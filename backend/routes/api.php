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

   Route::middleware('role:teacher')->prefix('teacher')->group(function () {
    // Tests
    Route::get('/tests', [TeacherController::class, 'getTests']);
    Route::get('/tests/{id}', [TeacherController::class, 'getTest']);
    Route::post('/tests', [TeacherController::class, 'createTest']);
    Route::put('/tests/{id}', [TeacherController::class, 'updateTest']);
    Route::delete('/tests/{id}', [TeacherController::class, 'deleteTest']);
    
    // Sections
    Route::post('/tests/{testId}/sections', [TeacherController::class, 'addSection']);
    Route::get('/sections/{id}', [TeacherController::class, 'getSection']);
    Route::put('/sections/{id}', [TeacherController::class, 'updateSection']);
    Route::delete('/sections/{id}', [TeacherController::class, 'deleteSection']);
    
    // Questions
    Route::post('/sections/{sectionId}/questions', [TeacherController::class, 'addQuestion']);
    Route::get('/questions/{id}', [TeacherController::class, 'getQuestion']);
    Route::put('/questions/{id}', [TeacherController::class, 'updateQuestion']);
    Route::delete('/questions/{id}', [TeacherController::class, 'deleteQuestion']);
    
    // Answers
    Route::post('/questions/{questionId}/answers', [TeacherController::class, 'addAnswer']);
    Route::put('/answers/{id}', [TeacherController::class, 'updateAnswer']);
    Route::delete('/answers/{id}', [TeacherController::class, 'deleteAnswer']);
    
    // Groups
    Route::get('/groups', [TeacherController::class, 'getGroups']);
    Route::get('/groups/{id}', [TeacherController::class, 'getGroup']);
    Route::post('/groups', [TeacherController::class, 'createGroup']);
    Route::put('/groups/{id}', [TeacherController::class, 'updateGroup']);
    Route::delete('/groups/{id}', [TeacherController::class, 'deleteGroup']);
    
    // Group Students
    Route::post('/groups/{groupId}/students', [TeacherController::class, 'addStudentToGroup']);
    Route::delete('/groups/{groupId}/students/{userId}', [TeacherController::class, 'removeStudentFromGroup']);
    
    // Assign Tests
    Route::post('/groups/{groupId}/tests/{testId}', [TeacherController::class, 'assignTestToGroup']);
    Route::post('/tests/{testId}/assign-student', [TeacherController::class, 'assignTestToStudent']);
    
    // Assignments
    Route::get('/assignments', [TeacherController::class, 'getAssignments']);
    Route::get('/assignments/{id}', [TeacherController::class, 'getAssignment']);
    Route::put('/assignments/{id}', [TeacherController::class, 'updateAssignment']);
    Route::delete('/assignments/{id}', [TeacherController::class, 'deleteAssignment']);
    
    // Students
    Route::get('/students', [TeacherController::class, 'getStudents']);
});
});