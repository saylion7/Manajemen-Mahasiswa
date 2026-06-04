<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/email/verify', [AuthController::class, 'verifyEmail']);
    Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail']);
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);

    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/filters', [StudentController::class, 'filters']);
    Route::get('/students/search', [StudentController::class, 'search']);
    Route::post('/students/sort', [StudentController::class, 'sort']);
    Route::get('/students/export', [StudentController::class, 'export']);
    Route::post('/students/import', [StudentController::class, 'import']);
    Route::get('/students/{student}', [StudentController::class, 'show']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::put('/students/{student}', [StudentController::class, 'update']);
    Route::delete('/students/{student}', [StudentController::class, 'destroy']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
