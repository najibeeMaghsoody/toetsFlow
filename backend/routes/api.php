<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Geen prefix('api') nodig! Laravel doet dit automatisch
// Publieke auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Beschermde routes (authenticatie vereist)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User profile
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'update']);
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User endpoints (eigen profile of andere users)
    Route::get('/users/{user}', [UserController::class, 'show']);
    
    // Admin only endpoints
    Route::middleware(['admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/bulk-update', [UserController::class, 'bulkUpdate']);
    });
});