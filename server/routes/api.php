<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IncomingWebhookController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\StockTransactionController;
use App\Http\Controllers\Api\WebhookDeliveryController;
use App\Http\Controllers\Api\WebhookSubscriptionController;
use Illuminate\Support\Facades\Route;

// ✅ Auth routes
Route::post('/login', [AuthController::class, 'login']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    Route::get('/dashboard', [DashboardController::class, 'summary']);

    Route::apiResource('categories', CategoryController::class)->except(['show']);
    Route::apiResource('inventory-items', InventoryItemController::class);
    Route::get('stock-transactions', [StockTransactionController::class, 'index']);
    Route::post('stock-transactions', [StockTransactionController::class, 'store']);

    Route::get('webhooks/events', [WebhookSubscriptionController::class, 'events']);
    Route::apiResource('webhooks/subscriptions', WebhookSubscriptionController::class)
        ->parameters(['subscriptions' => 'webhookSubscription']);
    Route::get('webhooks/deliveries', [WebhookDeliveryController::class, 'index']);

    Route::post('webhooks/incoming', [IncomingWebhookController::class, 'handle']);
}); 