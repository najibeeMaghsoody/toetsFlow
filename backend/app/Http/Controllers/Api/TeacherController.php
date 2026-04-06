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

class TeacherController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:teacher');
    }

    // Test Management
    public function getTests(Request $request)
    {
        $tests = $request->user()->createdTests()
            ->with(['sections.questions.answers'])
            ->paginate($request->get('per_page', 15));
        
        return response()->json($tests);
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

        return response()->json($test, 201);
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

        return response()->json($test);
    }

    public function deleteTest(Request $request, $id)
    {
        $test = Test::where('teacher_id', $request->user()->id)->findOrFail($id);
        $test->delete();
        
        return response()->json(['message' => 'Test deleted successfully']);
    }

    // Section Management
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

        return response()->json($section, 201);
    }

    // Question Management
    public function addQuestion(Request $request, $sectionId)
    {
        $section = Section::with('test')->findOrFail($sectionId);
        
        // Verify ownership
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

        return response()->json($question, 201);
    }

    // Answer Management
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

        return response()->json($answer, 201);
    }

    // Group Management
    public function getGroups(Request $request)
    {
        $groups = $request->user()->createdGroups()
            ->with(['users' => function($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
            ->paginate($request->get('per_page', 15));
        
        return response()->json($groups);
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

        return response()->json($group, 201);
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

        return response()->json($group);
    }

    public function deleteGroup(Request $request, $id)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($id);
        $group->delete();
        
        return response()->json(['message' => 'Group deleted successfully']);
    }

    // Add students to group
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

        $group->users()->attach($request->user_id);

        return response()->json(['message' => 'Student added to group']);
    }

    public function removeStudentFromGroup(Request $request, $groupId, $userId)
    {
        $group = Group::where('teacher_id', $request->user()->id)->findOrFail($groupId);
        $group->users()->detach($userId);
        
        return response()->json(['message' => 'Student removed from group']);
    }

    // Assign test to group
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

    // Assign test to individual student
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

        // Create a group specifically for this individual assignment
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

    // Get students with many mistakes for retake
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

        return response()->json($students);
    }
}