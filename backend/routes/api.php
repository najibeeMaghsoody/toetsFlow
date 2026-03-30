<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum'])->prefix('api')->group(function () {
    
    // User profile routes
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'update']);
    
    // Admin-only user management routes
    Route::get('/users/{user}', [UserController::class, 'show']);
    
    // Admin-only routes for user management
    Route::middleware(['admin'])->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/bulk-update', [UserController::class, 'bulkUpdate']);
    });
});
