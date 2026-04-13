<?php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller as BaseController;
use App\Models\Test;
use App\Models\Section;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Group;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeacherController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:teacher');
    }

    // ==================== TEST MANAGEMENT ====================
    
    public function getTests(Request $request)
    {
        $tests = $request->user()->createdTests()
            ->with(['sections' => function($query) {
                $query->orderBy('order');
            }, 'sections.questions' => function($query) {
                $query->orderBy('order');
            }, 'sections.questions.answers' => function($query) {
                $query->orderBy('order');
            }])
            ->get();
        
        return response()->json(['data' => $tests]);
    }

    public function getTest($id, Request $request)
    {
        $test = Test::where('teacher_id', $request->user()->id)
            ->with(['sections' => function($query) {
                $query->orderBy('order');
            }, 'sections.questions' => function($query) {
                $query->orderBy('order');
            }, 'sections.questions.answers' => function($query) {
                $query->orderBy('order');
            }])
            ->findOrFail($id);
        
        return response()->json(['data' => $test]);
    }

    public function createTest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'max_attempts' => 'integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = $request->user()->createdTests()->create([
            'title' => $request->title,
            'description' => $request->description,
            'is_public' => $request->is_public ?? false,
            'max_attempts' => $request->max_attempts ?? 1,
        ]);

        return response()->json(['data' => $test, 'message' => 'Toets succesvol aangemaakt'], 201);
    }

    public function updateTest(Request $request, $id)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'max_attempts' => 'integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test->update($request->only(['title', 'description', 'is_public', 'max_attempts']));

        return response()->json(['data' => $test, 'message' => 'Toets succesvol bijgewerkt']);
    }

    public function deleteTest(Request $request, $id)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($id);
        $testTitle = $test->title;
        $test->delete();
        
        return response()->json(['message' => "Toets '{$testTitle}' succesvol verwijderd"]);
    }

    // ==================== SECTION MANAGEMENT ====================
    
    public function addSection(Request $request, $testId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'new_page' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = $test->sections()->max('order') + 1;

        $section = $test->sections()->create([
            'title' => $request->title,
            'description' => $request->description,
            'order' => $order,
            'new_page' => $request->new_page ?? false,
        ]);

        return response()->json(['data' => $section, 'message' => 'Sectie succesvol toegevoegd'], 201);
    }

    public function getSection($id, Request $request)
    {
        $section = Section::with('test')->findOrFail($id);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json(['data' => $section]);
    }

    public function updateSection(Request $request, $id)
    {
        $section = Section::with('test')->findOrFail($id);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'new_page' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $section->update($request->only(['title', 'description', 'new_page']));

        return response()->json(['data' => $section, 'message' => 'Sectie succesvol bijgewerkt']);
    }

    public function deleteSection(Request $request, $id)
    {
        $section = Section::with('test')->findOrFail($id);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $sectionTitle = $section->title;
        $section->delete();
        
        return response()->json(['message' => "Sectie '{$sectionTitle}' succesvol verwijderd"]);
    }

    // ==================== QUESTION MANAGEMENT ====================
    
    public function addQuestion(Request $request, $sectionId)
    {
        $section = Section::with('test')->findOrFail($sectionId);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'question_text' => 'required|string',
            'type' => 'required|in:single_choice,multiple_choice,text',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = $section->questions()->max('order') + 1;

        $question = $section->questions()->create([
            'question_text' => $request->question_text,
            'type' => $request->type,
            'order' => $order,
        ]);

        return response()->json(['data' => $question, 'id' => $question->id, 'message' => 'Vraag succesvol toegevoegd'], 201);
    }

    public function getQuestion($id, Request $request)
    {
        $question = Question::with(['section.test', 'answers'])->findOrFail($id);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json(['data' => $question]);
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = Question::with('section.test')->findOrFail($id);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'question_text' => 'required|string',
            'type' => 'required|in:single_choice,multiple_choice,text',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question->update($request->only(['question_text', 'type']));

        return response()->json(['data' => $question, 'message' => 'Vraag succesvol bijgewerkt']);
    }

    public function deleteQuestion(Request $request, $id)
    {
        $question = Question::with('section.test')->findOrFail($id);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $question->delete();
        
        return response()->json(['message' => 'Vraag succesvol verwijderd']);
    }

    // ==================== ANSWER MANAGEMENT ====================
    
    public function addAnswer(Request $request, $questionId)
    {
        $question = Question::with('section.test')->findOrFail($questionId);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'answer_text' => 'required|string',
            'is_correct' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = $question->answers()->max('order') + 1;

        $answer = $question->answers()->create([
            'answer_text' => $request->answer_text,
            'is_correct' => $request->is_correct ?? false,
            'order' => $order,
        ]);

        return response()->json(['data' => $answer, 'message' => 'Antwoord succesvol toegevoegd'], 201);
    }

    public function updateAnswer(Request $request, $id)
    {
        $answer = Answer::with('question.section.test')->findOrFail($id);
        
        if ($answer->question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'answer_text' => 'required|string',
            'is_correct' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $answer->update($request->only(['answer_text', 'is_correct']));

        return response()->json(['data' => $answer, 'message' => 'Antwoord succesvol bijgewerkt']);
    }

    public function deleteAnswer(Request $request, $id)
    {
        $answer = Answer::with('question.section.test')->findOrFail($id);
        
        if ($answer->question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $answer->delete();
        
        return response()->json(['message' => 'Antwoord succesvol verwijderd']);
    }

    // ==================== GROUP MANAGEMENT ====================
    
    public function getGroups(Request $request)
    {
        $groups = $request->user()->createdGroups()
            ->with(['users' => function($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
            ->get();
        
        return response()->json(['data' => $groups]);
    }

    public function getGroup($id, Request $request)
    {
        $group = Group::where('teacher_id', $request->user()->id)
            ->with(['users' => function($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
            ->findOrFail($id);
        
        return response()->json(['data' => $group]);
    }

    public function createGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group = $request->user()->createdGroups()->create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json(['data' => $group, 'message' => 'Groep succesvol aangemaakt'], 201);
    }

    public function updateGroup(Request $request, $id)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group->update($request->only(['name', 'description']));

        return response()->json(['data' => $group, 'message' => 'Groep succesvol bijgewerkt']);
    }

    public function deleteGroup(Request $request, $id)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($id);
        $groupName = $group->name;
        
        $group->users()->detach();
        $group->tests()->detach();
        $group->delete();
        
        return response()->json(['message' => "Groep '{$groupName}' succesvol verwijderd"]);
    }

    // ==================== STUDENTS IN GROUP ====================
    
    public function addStudentToGroup(Request $request, $groupId)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($groupId);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = User::where('id', $request->user_id)->where('role', 'student')->first();
        
        if (!$student) {
            return response()->json(['error' => 'User is not a student'], 422);
        }

        if ($group->users()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['error' => 'Student already in group'], 422);
        }

        $group->users()->attach($request->user_id);

        return response()->json(['message' => "Student '{$student->name}' succesvol toegevoegd aan groep '{$group->name}'"]);
    }

    public function removeStudentFromGroup(Request $request, $groupId, $userId)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($groupId);
        $student = User::findOrFail($userId);
        
        if (!$group->users()->where('user_id', $userId)->exists()) {
            return response()->json(['error' => 'Student not in group'], 404);
        }
        
        $group->users()->detach($userId);
        
        return response()->json(['message' => "Student '{$student->name}' succesvol verwijderd uit groep '{$group->name}'"]);
    }

    // ==================== ASSIGN TESTS ====================
    
    public function assignTestToGroup(Request $request, $groupId, $testId)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($groupId);
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);

        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group->tests()->attach($testId, [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json(['message' => "Toets '{$test->title}' succesvol toegewezen aan groep '{$group->name}'"]);
    }

    public function assignTestToStudent(Request $request, $testId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = User::where('id', $request->user_id)->where('role', 'student')->first();
        
        if (!$student) {
            return response()->json(['error' => 'User is not a student'], 422);
        }

        $groupName = "Individual_{$test->title}_{$request->user_id}";
        $group = Group::firstOrCreate([
            'name' => $groupName,
            'teacher_id' => $request->user()->id,
        ]);

        $group->users()->syncWithoutDetaching([$request->user_id]);
        
        $group->tests()->syncWithoutDetaching([$testId => [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]]);

        return response()->json(['message' => "Toets '{$test->title}' succesvol toegewezen aan student '{$student->name}'"]);
    }

    // ==================== ASSIGNMENTS ====================
    
    public function getAssignments(Request $request)
    {
        $groups = Group::where('teacher_id', $request->user()->id)
            ->with(['tests' => function($query) {
                $query->withPivot('start_date', 'end_date', 'id');
            }, 'users' => function($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
            ->get();

        $assignments = [];
        
        foreach ($groups as $group) {
            foreach ($group->tests as $test) {
                $isIndividual = str_starts_with($group->name, 'Individual_');
                
                if ($isIndividual && $group->users->count() === 1) {
                    $student = $group->users->first();
                    $assignments[] = [
                        'id' => $test->pivot->id,
                        'test_id' => $test->id,
                        'test' => [
                            'id' => $test->id,
                            'title' => $test->title,
                            'description' => $test->description,
                        ],
                        'user_id' => $student->id,
                        'user' => [
                            'id' => $student->id,
                            'name' => $student->name,
                            'email' => $student->email,
                        ],
                        'group_id' => $group->id,
                        'group' => [
                            'id' => $group->id,
                            'name' => $group->name,
                            'description' => $group->description,
                        ],
                        'start_date' => $test->pivot->start_date,
                        'end_date' => $test->pivot->end_date,
                    ];
                } else {
                    $assignments[] = [
                        'id' => $test->pivot->id,
                        'test_id' => $test->id,
                        'test' => [
                            'id' => $test->id,
                            'title' => $test->title,
                            'description' => $test->description,
                        ],
                        'group_id' => $group->id,
                        'group' => [
                            'id' => $group->id,
                            'name' => $group->name,
                            'description' => $group->description,
                        ],
                        'start_date' => $test->pivot->start_date,
                        'end_date' => $test->pivot->end_date,
                    ];
                }
            }
        }

        return response()->json(['data' => $assignments]);
    }

    public function getAssignment($id, Request $request)
    {
        $groupTest = DB::table('group_test')->where('id', $id)->first();
        
        if (!$groupTest) {
            return response()->json(['error' => 'Assignment not found'], 404);
        }
        
        $group = Group::where('id', $groupTest->group_id)
            ->where('teacher_id', $request->user()->id)
            ->first();
        
        if (!$group) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $test = Test::find($groupTest->test_id);
        $isIndividual = str_starts_with($group->name, 'Individual_');
        
        $assignment = [
            'id' => $groupTest->id,
            'test_id' => $test->id,
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'description' => $test->description,
            ],
            'start_date' => $groupTest->start_date,
            'end_date' => $groupTest->end_date,
        ];
        
        if ($isIndividual && $group->users->count() === 1) {
            $student = $group->users->first();
            $assignment['user_id'] = $student->id;
            $assignment['user'] = [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ];
        } else {
            $assignment['group_id'] = $group->id;
            $assignment['group'] = [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
            ];
        }
        
        return response()->json(['data' => $assignment]);
    }

    public function updateAssignment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'test_id' => 'sometimes|exists:tests,id',
            'group_id' => 'sometimes|exists:groups,id',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupTest = DB::table('group_test')->where('id', $id)->first();
        
        if (!$groupTest) {
            return response()->json(['error' => 'Toewijzing niet gevonden'], 404);
        }
        
        $group = Group::where('id', $groupTest->group_id)
            ->where('teacher_id', $request->user()->id)
            ->first();
        
        if (!$group) {
            return response()->json(['error' => 'Niet geautoriseerd'], 403);
        }
        
        $updateData = [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
        
        if ($request->has('test_id') && $request->test_id != $groupTest->test_id) {
            $updateData['test_id'] = $request->test_id;
        }
        
        $needsReassignment = false;
        $newGroupId = $groupTest->group_id;
        
        if ($request->has('group_id') && $request->group_id != $groupTest->group_id) {
            $needsReassignment = true;
            $newGroupId = $request->group_id;
            
            $newGroup = Group::where('id', $newGroupId)
                ->where('teacher_id', $request->user()->id)
                ->first();
            
            if (!$newGroup) {
                return response()->json(['error' => 'Nieuwe groep niet gevonden'], 403);
            }
        } elseif ($request->has('user_id')) {
            $test = Test::find($request->test_id ?? $groupTest->test_id);
            $groupName = "Individual_{$test->title}_{$request->user_id}";
            
            $individualGroup = Group::firstOrCreate([
                'name' => $groupName,
                'teacher_id' => $request->user()->id,
            ]);
            
            $individualGroup->users()->syncWithoutDetaching([$request->user_id]);
            
            $newGroupId = $individualGroup->id;
            $needsReassignment = true;
        }
        
        if ($needsReassignment) {
            DB::table('group_test')->where('id', $id)->delete();
            
            DB::table('group_test')->insert([
                'group_id' => $newGroupId,
                'test_id' => $updateData['test_id'] ?? $groupTest->test_id,
                'start_date' => $updateData['start_date'],
                'end_date' => $updateData['end_date'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            return response()->json(['message' => 'Toewijzing succesvol bijgewerkt']);
        } else {
            DB::table('group_test')
                ->where('id', $id)
                ->update($updateData);
            
            return response()->json(['message' => 'Toewijzing succesvol bijgewerkt']);
        }
    }

    public function deleteAssignment(Request $request, $id)
    {
        $groupTest = DB::table('group_test')->where('id', $id)->first();
        
        if (!$groupTest) {
            return response()->json(['error' => 'Toewijzing niet gevonden'], 404);
        }
        
        $group = Group::where('id', $groupTest->group_id)
            ->where('teacher_id', $request->user()->id)
            ->first();
        
        if (!$group) {
            return response()->json(['error' => 'Niet geautoriseerd'], 403);
        }
        
        DB::table('group_test')->where('id', $id)->delete();
        
        return response()->json(['message' => 'Toewijzing succesvol verwijderd']);
    }

    // ==================== STUDENTS ====================
    
    public function getStudents(Request $request)
    {
        $students = User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        
        return response()->json(['data' => $students]);
    }

    // ==================== RESULTS MANAGEMENT ====================

  
    public function getTestResults(Request $request, $testId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);
       
        $maxScore = $this->getMaxScoreForTest($test);
        
        $results = TestAttempt::where('test_id', $testId)
            ->with(['user' => function($query) {
                $query->select('id', 'name', 'email');
            }])
            ->get()
            ->map(function($attempt) use ($maxScore) {
              
                $score = $attempt->score ?? 0;
                
                return [
                    'attempt_id' => $attempt->id,
                    'student_id' => $attempt->user_id,
                    'student_name' => $attempt->user->name,
                    'student_email' => $attempt->user->email,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                    'score' => (float)$score,
                    'max_score' => $maxScore,
                    'percentage' => $maxScore > 0 ? ((float)$score / $maxScore) * 100 : 0,
                    'attempts_count' => $attempt->attempts_count,
                    'status' => $attempt->completed_at ? 'completed' : 'in_progress',
                ];
            });
        
        return response()->json(['data' => $results]);
    }

    /**
     * Haal gedetailleerde resultaten op voor een specifieke student en toets
     */
    public function getStudentResultDetail(Request $request, $testId, $studentId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);
        
        $attempt = TestAttempt::where('test_id', $testId)
            ->where('user_id', $studentId)
            ->with(['user', 'userAnswers.question.answers' => function($query) {
                $query->where('is_correct', true);
            }])
            ->first();
        
        if (!$attempt) {
            return response()->json(['error' => 'Geen poging gevonden'], 404);
        }
        
        $maxScore = $this->getMaxScoreForTest($test);
        $score = $attempt->score ?? 0;
        
        $questions = [];
        foreach ($attempt->userAnswers as $userAnswer) {
            $question = $userAnswer->question;
            $correctAnswer = $question->answers->first();
            
            $questions[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'user_answer' => $userAnswer->answer_text ?? $userAnswer->text_answer,
                'is_correct' => $userAnswer->is_correct ?? false,
                'correct_answer' => $correctAnswer ? $correctAnswer->answer_text : null,
                'points' => ($userAnswer->is_correct ?? false) ? 1 : 0,
                'max_points' => 1,
            ];
        }
        
        return response()->json([
            'data' => [
                'student' => [
                    'id' => $attempt->user->id,
                    'name' => $attempt->user->name,
                    'email' => $attempt->user->email,
                ],
                'test' => [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                ],
                'attempt' => [
                    'id' => $attempt->id,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                    'score' => (float)$score,
                    'max_score' => $maxScore,
                    'percentage' => $maxScore > 0 ? ((float)$score / $maxScore) * 100 : 0,
                    'attempts_count' => $attempt->attempts_count,
                ],
                'questions' => $questions,
            ]
        ]);
    }

    /**
     * Haal alle resultaten op voor alle toetsen van de docent
     */
    public function getAllStudentResults(Request $request)
    {
        $teacherId = $request->user()->id;
        
        $tests = Test::where('teacher_id', $teacherId)->get();
        $testIds = $tests->pluck('id')->toArray();
        
        $results = TestAttempt::whereIn('test_id', $testIds)
            ->with(['user', 'test'])
            ->get()
            ->groupBy('test_id')
            ->map(function($attempts, $testId) use ($tests) {
                $test = $tests->firstWhere('id', $testId);
                $maxScore = $this->getMaxScoreForTest($test);
                
                return [
                    'test_id' => $testId,
                    'test_title' => $test->title ?? 'Onbekend',
                    'students' => $attempts->map(function($attempt) use ($maxScore) {
                        $score = $attempt->score ?? 0;
                        return [
                            'student_id' => $attempt->user_id,
                            'student_name' => $attempt->user->name,
                            'student_email' => $attempt->user->email,
                            'score' => (float)$score,
                            'max_score' => $maxScore,
                            'percentage' => $maxScore > 0 ? ((float)$score / $maxScore) * 100 : 0,
                            'completed_at' => $attempt->completed_at,
                            'attempts_count' => $attempt->attempts_count,
                        ];
                    })->values()
                ];
            });
        
        return response()->json(['data' => $results]);
    }

    /**
     * Exporteer resultaten naar CSV bestand
     */
    public function exportResultsToCsv(Request $request, $testId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);
        $maxScore = $this->getMaxScoreForTest($test);
        
        $results = TestAttempt::where('test_id', $testId)
            ->with('user')
            ->get()
            ->map(function($attempt) use ($maxScore) {
                $score = $attempt->score ?? 0;
                return [
                    'Student Naam' => $attempt->user->name,
                    'Student Email' => $attempt->user->email,
                    'Start Datum' => $attempt->started_at,
                    'Voltooid Datum' => $attempt->completed_at ?? 'Niet voltooid',
                    'Score' => $score,
                    'Max Score' => $maxScore,
                    'Percentage' => $maxScore > 0 ? round(((float)$score / $maxScore) * 100, 1) . '%' : '0%',
                    'Pogingen' => $attempt->attempts_count,
                    'Status' => $attempt->completed_at ? 'Voltooid' : 'In uitvoering',
                ];
            });
        
        $filename = "resultaten_{$test->title}_" . date('Y-m-d') . ".csv";
        
        $callback = function() use ($results) {
            $file = fopen('php://output', 'w');
            // Voeg BOM toe voor UTF-8 ondersteuning in Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            if ($results->isNotEmpty()) {
                fputcsv($file, array_keys($results->first()), ';');
            }
            
            foreach ($results as $row) {
                fputcsv($file, array_values($row), ';');
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    /**
     * Helper functie om het maximale aantal punten voor een toets te berekenen
     * Dit kan worden aangepast op basis van jouw toetsstructuur
     */
    private function getMaxScoreForTest($test)
    {
        // Optie 1: Tel het aantal vragen in de toets (elke vraag is 1 punt)
        $questionCount = 0;
        if ($test->sections) {
            foreach ($test->sections as $section) {
                $questionCount += $section->questions->count();
            }
        }
        
        if ($questionCount > 0) {
            return $questionCount;
        }
        
        
        return 10;
    }
}