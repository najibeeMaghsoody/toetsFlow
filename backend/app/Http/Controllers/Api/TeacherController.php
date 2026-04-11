<?php
// app/Http/Controllers/Api/TeacherController.php
namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller as BaseController;
use App\Models\Test;
use App\Models\Section;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Group;
use App\Models\User;
use App\Models\TestAttempt;
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

        return response()->json(['data' => $test], 201);
    }

    public function updateTest(Request $request, $id)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'max_attempts' => 'integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test->update($request->only(['title', 'description', 'is_public', 'max_attempts']));

        return response()->json(['data' => $test]);
    }

    public function deleteTest(Request $request, $id)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($id);
        $test->delete();
        
        return response()->json(['message' => 'Test deleted successfully']);
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

        return response()->json(['data' => $section], 201);
    }

    public function updateSection(Request $request, $sectionId)
    {
        $section = Section::with('test')->findOrFail($sectionId);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'new_page' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $section->update($request->only(['title', 'description', 'new_page']));

        return response()->json(['data' => $section]);
    }

    public function deleteSection(Request $request, $sectionId)
    {
        Log::info('Delete section called', ['section_id' => $sectionId, 'user_id' => $request->user()->id]);
        
        $section = Section::with('test')->findOrFail($sectionId);
        
        if ($section->test->teacher_id !== $request->user()->id) {
            Log::warning('Unauthorized delete attempt');
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $section->delete();
        
        Log::info('Section deleted successfully');
        
        return response()->json(['message' => 'Section deleted successfully']);
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

        return response()->json(['data' => $question, 'id' => $question->id], 201);
    }

    public function updateQuestion(Request $request, $questionId)
    {
        $question = Question::with('section.test')->findOrFail($questionId);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|string',
            'type' => 'sometimes|in:single_choice,multiple_choice,text',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question->update($request->only(['question_text', 'type']));

        return response()->json(['data' => $question]);
    }

    public function deleteQuestion(Request $request, $questionId)
    {
        Log::info('Delete question called', ['question_id' => $questionId, 'user_id' => $request->user()->id]);
        
        $question = Question::with('section.test')->findOrFail($questionId);
        
        if ($question->section->test->teacher_id !== $request->user()->id) {
            Log::warning('Unauthorized delete attempt');
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $question->delete();
        
        Log::info('Question deleted successfully');
        
        return response()->json(['message' => 'Question deleted successfully']);
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

        return response()->json(['data' => $answer], 201);
    }

    public function updateAnswer(Request $request, $answerId)
    {
        $answer = Answer::with('question.section.test')->findOrFail($answerId);
        
        if ($answer->question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'answer_text' => 'sometimes|string',
            'is_correct' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $answer->update($request->only(['answer_text', 'is_correct']));

        return response()->json(['data' => $answer]);
    }

    public function deleteAnswer(Request $request, $answerId)
    {
        $answer = Answer::with('question.section.test')->findOrFail($answerId);
        
        if ($answer->question->section->test->teacher_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $answer->delete();
        
        return response()->json(['message' => 'Answer deleted successfully']);
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

        return response()->json(['data' => $group], 201);
    }

    public function updateGroup(Request $request, $id)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group->update($request->only(['name', 'description']));

        return response()->json(['data' => $group]);
    }

    public function deleteGroup(Request $request, $id)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($id);
        
        // Detach all students and test assignments first
        $group->users()->detach();
        $group->tests()->detach();
        $group->delete();
        
        return response()->json(['message' => 'Group deleted successfully']);
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

        // Check if student is already in group
        if ($group->users()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['error' => 'Student already in group'], 422);
        }

        $group->users()->attach($request->user_id);

        return response()->json(['message' => 'Student added to group']);
    }

    public function removeStudentFromGroup(Request $request, $groupId, $userId)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($groupId);
        
        // Check if student is in group
        if (!$group->users()->where('user_id', $userId)->exists()) {
            return response()->json(['error' => 'Student not in group'], 404);
        }
        
        $group->users()->detach($userId);
        
        return response()->json(['message' => 'Student removed from group']);
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

        return response()->json(['message' => 'Test assigned to group']);
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

        return response()->json(['message' => 'Test assigned to student']);
    }

    // ==================== ASSIGNMENTS (GET) ====================
    
    public function getAssignments(Request $request)
    {
        // Haal alle groepen van de docent op met hun toegewezen toetsen
        $groups = Group::where('teacher_id', $request->user()->id)
            ->with(['tests' => function($query) {
                $query->withPivot('start_date', 'end_date', 'id');
            }, 'users' => function($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
            ->get();

        // Formatteer de data
        $assignments = [];
        
        foreach ($groups as $group) {
            foreach ($group->tests as $test) {
                // Check of dit een individuele toewijzing is
                $isIndividual = str_starts_with($group->name, 'Individual_');
                
                if ($isIndividual && $group->users->count() === 1) {
                    // Individuele toewijzing
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
                        'start_date' => $test->pivot->start_date,
                        'end_date' => $test->pivot->end_date,
                    ];
                } else {
                    // Groep toewijzing
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

    // ==================== STUDENTS ====================
    
    public function getStudents(Request $request)
    {
        $students = User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        
        return response()->json(['data' => $students]);
    }

    // ==================== RETAKE MANAGEMENT ====================
    
    public function getStudentsForRetake(Request $request, $testId)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($testId);

        $validator = Validator::make($request->all(), [
            'max_score' => 'required|numeric|min:0|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $students = User::whereHas('testAttempts', function($query) use ($testId, $request) {
            $query->where('test_id', $testId)
                  ->where('score', '<', $request->max_score);
        })->with(['testAttempts' => function($query) use ($testId) {
            $query->where('test_id', $testId)->latest();
        }])->get();

        return response()->json(['data' => $students]);
    }

    // ==================== GET SINGLE TEST WITH DETAILS ====================
    
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
}