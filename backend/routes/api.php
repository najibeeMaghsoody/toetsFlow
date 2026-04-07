<?php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // User management
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        
        // Import
        Route::post('/import-students', [AdminController::class, 'importStudents']);
        
        // Statistics
        Route::get('/statistics', [AdminController::class, 'getStatistics']);
        
        // Export results
        Route::get('/export-results', [AdminController::class, 'exportResults']);
    });

    // Teacher routes
    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        // Test management
        Route::get('/tests', [TeacherController::class, 'getTests']);
        Route::post('/tests', [TeacherController::class, 'createTest']);
        Route::put('/tests/{id}', [TeacherController::class, 'updateTest']);
        Route::delete('/tests/{id}', [TeacherController::class, 'deleteTest']);
        
        // Sections
        Route::post('/tests/{testId}/sections', [TeacherController::class, 'addSection']);
        
        // Questions
        Route::post('/sections/{sectionId}/questions', [TeacherController::class, 'addQuestion']);
        
        // Answers
        Route::post('/questions/{questionId}/answers', [TeacherController::class, 'addAnswer']);
        
        // Group management
        Route::get('/groups', [TeacherController::class, 'getGroups']);
        Route::post('/groups', [TeacherController::class, 'createGroup']);
        Route::put('/groups/{id}', [TeacherController::class, 'updateGroup']);
        Route::delete('/groups/{id}', [TeacherController::class, 'deleteGroup']);
        
         Route::get('/students', [TeacherController::class, 'getStudents']);
        // Group students
        Route::post('/groups/{groupId}/students', [TeacherController::class, 'addStudentToGroup']);
        Route::delete('/groups/{groupId}/students/{userId}', [TeacherController::class, 'removeStudentFromGroup']);
        
        // Assign tests
        Route::post('/groups/{groupId}/tests/{testId}', [TeacherController::class, 'assignTestToGroup']);
        Route::post('/tests/{testId}/assign-student', [TeacherController::class, 'assignTestToStudent']);
        
        // Retake management
        Route::get('/tests/{testId}/retake-candidates', [TeacherController::class, 'getStudentsForRetake']);
        Route::get('/assignments', [TeacherController::class, 'getAssignments']);
    });

    // Student routes
    Route::middleware('role:student')->prefix('student')->group(function () {
        // Tests
        Route::get('/available-tests', [StudentController::class, 'getAvailableTests']);
        Route::post('/tests/{testId}/start', [StudentController::class, 'startTest']);
        Route::post('/attempts/{attemptId}/answer', [StudentController::class, 'submitAnswer']);
        Route::post('/attempts/{attemptId}/complete', [StudentController::class, 'completeTest']);
        
        // Results
        Route::get('/results', [StudentController::class, 'getTestResults']);
        Route::get('/attempts/{attemptId}', [StudentController::class, 'getAttemptDetails']);
        
        // Retake
        Route::post('/tests/{testId}/retake', [StudentController::class, 'retakeIncorrect']);
    });
});