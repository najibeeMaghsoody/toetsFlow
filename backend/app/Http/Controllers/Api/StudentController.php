<?php
// app/Http/Controllers/Api/StudentController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\UserAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{

    // Get available tests
    public function getAvailableTests(Request $request)
    {
        $user = $request->user();
        
        // Get IDs of tests already completed
        $completedTestIds = TestAttempt::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->pluck('test_id')
            ->toArray();

        // Get available tests (public or assigned within time window)
        $tests = Test::where(function($query) use ($user) {
                $query->where('is_public', true)
                    ->orWhereHas('groups.users', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->whereNotIn('id', $completedTestIds)
            ->with(['groups' => function($query) use ($user) {
                $query->whereHas('users', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }])
            ->get()
            ->filter(function($test) use ($user) {
                if ($test->is_public) {
                    return true;
                }
                
                $now = now();
                foreach ($test->groups as $group) {
                    if ($group->pivot->start_date <= $now && $group->pivot->end_date >= $now) {
                        return true;
                    }
                }
                return false;
            });

        return response()->json($tests->values());
    }

    // Start a test
    public function startTest(Request $request, $testId)
    {
        $user = $request->user();
        $test = Test::findOrFail($testId);

        // Check if test is available
        if (!$test->isAvailableForUser($user)) {
            return response()->json(['error' => 'Test is not available'], 403);
        }

        // Check attempts limit
        $attemptCount = TestAttempt::where('user_id', $user->id)
            ->where('test_id', $testId)
            ->count();

        if ($attemptCount >= $test->max_attempts) {
            return response()->json(['error' => 'Maximum attempts reached'], 403);
        }

        // Create new attempt
        $attempt = TestAttempt::create([
            'user_id' => $user->id,
            'test_id' => $testId,
            'started_at' => now(),
            'attempts_count' => $attemptCount + 1,
        ]);

        // Load test structure
        $test->load(['sections.questions.answers']);

        return response()->json([
            'attempt' => $attempt,
            'test' => $test,
        ]);
    }

    // Submit answer for a question
    public function submitAnswer(Request $request, $attemptId)
    {
        $user = $request->user();
        $attempt = TestAttempt::with('test')->findOrFail($attemptId);

        // Verify ownership
        if ($attempt->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if test is already completed
        if ($attempt->completed_at) {
            return response()->json(['error' => 'Test already completed'], 403);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'question_id' => 'required|exists:questions,id',
            'answer_id' => 'nullable|exists:answers,id',
            'text_answer' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question = Question::findOrFail($request->question_id);
        $isCorrect = false;

        // Check if answer is correct
        if ($request->answer_id) {
            $answer = \App\Models\Answer::find($request->answer_id);
            if ($answer && $answer->question_id === $question->id) {
                $isCorrect = $answer->is_correct;
            }
        }

        // Save or update answer
        UserAnswer::updateOrCreate(
            [
                'test_attempt_id' => $attemptId,
                'question_id' => $request->question_id,
            ],
            [
                'answer_id' => $request->answer_id,
                'text_answer' => $request->text_answer,
                'is_correct' => $isCorrect,
            ]
        );

        return response()->json(['message' => 'Answer saved']);
    }

    // Complete test and calculate score
    public function completeTest(Request $request, $attemptId)
    {
        $user = $request->user();
        $attempt = TestAttempt::with(['test.sections.questions'])->findOrFail($attemptId);

        if ($attempt->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($attempt->completed_at) {
            return response()->json(['error' => 'Test already completed'], 403);
        }

        // Calculate score
        $userAnswers = UserAnswer::where('test_attempt_id', $attemptId)->get();
        $totalQuestions = 0;
        $correctAnswers = 0;

        foreach ($attempt->test->sections as $section) {
            foreach ($section->questions as $question) {
                $totalQuestions++;
                $userAnswer = $userAnswers->where('question_id', $question->id)->first();
                if ($userAnswer && $userAnswer->is_correct) {
                    $correctAnswers++;
                }
            }
        }

        $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 10 : 0;

        $attempt->update([
            'completed_at' => now(),
            'score' => $score,
        ]);

        return response()->json([
            'message' => 'Test completed',
            'score' => $score,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
        ]);
    }

    // Get test results
    public function getTestResults(Request $request)
    {
        $results = TestAttempt::with(['test'])
            ->where('user_id', $request->user()->id)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($results);
    }

    // Get detailed results for a specific test attempt
    public function getAttemptDetails(Request $request, $attemptId)
    {
        $user = $request->user();
        $attempt = TestAttempt::with([
            'test.sections.questions.answers',
            'userAnswers'
        ])->findOrFail($attemptId);

        if ($attempt->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Prepare detailed results
        $details = [
            'attempt' => $attempt,
            'score' => $attempt->score,
            'questions' => [],
        ];

        foreach ($attempt->test->sections as $section) {
            foreach ($section->questions as $question) {
                $userAnswer = $attempt->userAnswers->where('question_id', $question->id)->first();
                
                $details['questions'][] = [
                    'question' => $question,
                    'user_answer' => $userAnswer,
                    'is_correct' => $userAnswer ? $userAnswer->is_correct : false,
                    'correct_answers' => $question->answers->where('is_correct', true)->values(),
                ];
            }
        }

        return response()->json($details);
    }

    // Retake test with only incorrect questions
    public function retakeIncorrect(Request $request, $testId)
    {
        $user = $request->user();
        $test = Test::findOrFail($testId);

        // Get the last attempt
        $lastAttempt = TestAttempt::where('user_id', $user->id)
            ->where('test_id', $testId)
            ->whereNotNull('completed_at')
            ->latest()
            ->first();

        if (!$lastAttempt) {
            return response()->json(['error' => 'No previous attempt found'], 404);
        }

        // Get incorrect questions from last attempt
        $incorrectQuestionIds = UserAnswer::where('test_attempt_id', $lastAttempt->id)
            ->where('is_correct', false)
            ->pluck('question_id')
            ->toArray();

        if (empty($incorrectQuestionIds)) {
            return response()->json(['message' => 'All questions were answered correctly!'], 200);
        }

        // Create new attempt
        $attemptCount = TestAttempt::where('user_id', $user->id)
            ->where('test_id', $testId)
            ->count();

        if ($attemptCount >= $test->max_attempts) {
            return response()->json(['error' => 'Maximum attempts reached'], 403);
        }

        $attempt = TestAttempt::create([
            'user_id' => $user->id,
            'test_id' => $testId,
            'started_at' => now(),
            'attempts_count' => $attemptCount + 1,
        ]);

        // Load only incorrect questions
        $test->load(['sections.questions' => function($query) use ($incorrectQuestionIds) {
            $query->whereIn('id', $incorrectQuestionIds)
                  ->with('answers');
        }]);

        return response()->json([
            'attempt' => $attempt,
            'test' => $test,
            'message' => 'Retake with incorrect questions',
        ]);
    }
}