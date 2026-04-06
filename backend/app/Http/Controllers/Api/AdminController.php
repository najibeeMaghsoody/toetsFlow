<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admin;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;


class AdminController extends Controller
{
    public function __construct()
    {
    }

    // User Management
    public function getUsers(Request $request)
    {
        $query = User::with(['student', 'teacher', 'admin']);
        
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        $users = $query->paginate($request->get('per_page', 15));
        
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role' => ['required', Rule::in(['student', 'teacher', 'admin'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Create role-specific record
        if ($request->role === 'student') {
            Student::create([
                'user_id' => $user->id,
                'student_number' => 'STU' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            ]);
        } elseif ($request->role === 'teacher') {
            Teacher::create([
                'user_id' => $user->id,
                'teacher_number' => 'TCH' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            ]);
        } elseif ($request->role === 'admin') {
            Admin::create(['user_id' => $user->id]);
        }

        return response()->json($user->load(['student', 'teacher', 'admin']), 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['student', 'teacher', 'admin'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['name', 'email', 'role']));
        
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        return response()->json($user->load(['student', 'teacher', 'admin']));
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json(['message' => 'User deleted successfully']);
    }

    // Import students from CSV
    public function importStudents(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');
        
        $headers = fgetcsv($handle, 1000, ',');
        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            $data = array_combine($headers, $row);
            
            $validator = Validator::make($data, [
                'name' => 'required|string',
                'email' => 'required|email|unique:users',
            ]);

            if ($validator->fails()) {
                $errors[] = ['row' => $data, 'errors' => $validator->errors()];
                continue;
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password123'),
                'role' => 'student',
            ]);

            Student::create([
                'user_id' => $user->id,
                'student_number' => $data['student_number'] ?? 'STU' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            ]);

            $imported++;
        }

        fclose($handle);

        return response()->json([
            'message' => "Imported {$imported} students",
            'errors' => $errors,
        ]);
    }

    // Statistics
    public function getStatistics()
    {
        $stats = [
            'total_users' => User::count(),
            'students' => User::where('role', 'student')->count(),
            'teachers' => User::where('role', 'teacher')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'total_tests' => Test::count(),
            'total_attempts' => TestAttempt::count(),
            'average_score' => TestAttempt::avg('score'),
            'tests_taken_today' => TestAttempt::whereDate('created_at', today())->count(),
        ];

        return response()->json($stats);
    }

    // Export results
    public function exportResults(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'test_id' => 'sometimes|exists:tests,id',
        ]);

        $query = TestAttempt::with(['user', 'test'])
            ->whereBetween('completed_at', [$request->start_date, $request->end_date]);

        if ($request->has('test_id')) {
            $query->where('test_id', $request->test_id);
        }

        $results = $query->get();

        $csv = "Student Name,Student Email,Test Title,Score,Completed At\n";
        
        foreach ($results as $result) {
            $csv .= sprintf(
                '"%s","%s","%s",%.2f,"%s"' . "\n",
                $result->user->name,
                $result->user->email,
                $result->test->title,
                $result->score ?? 0,
                $result->completed_at
            );
        }

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="results.csv"');
    }
}