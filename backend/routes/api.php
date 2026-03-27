<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UploadController;

// Auth Routes — rate limited to prevent brute force
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Public Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public Category Routes
Route::get('/categories', [ProductController::class, 'categories']);

// Cart Routes
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/add', [CartController::class, 'add']);
Route::put('/cart/update', [CartController::class, 'update']);
Route::delete('/cart/remove/{cartItemId}', [CartController::class, 'remove']);

// Public Order Routes
Route::middleware('throttle:10,1')->post('/orders', [OrderController::class, 'submitOrder']);
Route::get('/orders/track/{reference}', [OrderController::class, 'trackOrder']);

// Public Settings Routes
Route::get('/settings/carousel', [SettingController::class, 'getCarousel']);
Route::get('/settings/whatsapp', [SettingController::class, 'getWhatsapp']);

// Public Coupon Routes
Route::get('/coupons/public', [CouponController::class, 'publicList']);
Route::middleware('throttle:20,1')->post('/coupons/validate', [CouponController::class, 'validate']);

// Protected User Routes (Customer & Admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Order history
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    // Personal coupons
    Route::get('/my-coupons', [CouponController::class, 'myCoupons']);
    // Update profile
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    // Review
    Route::post('/products/{id}/reviews', [ProductController::class, 'submitReview']);
});

// Admin Only Routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Manage Products
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Manage Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    
    // Admin Orders
    Route::get('/admin/orders', [OrderController::class, 'allOrders']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/approve-payment', [OrderController::class, 'approvePayment']);
    Route::put('/orders/{id}/deny-payment', [OrderController::class, 'denyPayment']);

    // Admin Users
    Route::get('/admin/users', [AuthController::class, 'allUsers']);
    Route::post('/admin/users', [AuthController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
    Route::put('/admin/users/{id}/password', [AuthController::class, 'resetUserPassword']);

    // Admin Settings
    Route::put('/admin/settings/carousel', [SettingController::class, 'updateCarousel']);
    Route::put('/admin/settings/whatsapp', [SettingController::class, 'updateWhatsapp']);

    // Admin Coupons
    Route::get('/admin/coupons', [CouponController::class, 'index']);
    Route::post('/admin/coupons', [CouponController::class, 'store']);
    Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);

    // Admin Stats
    Route::get('/admin/stats', [StatsController::class, 'index']);

    // Image Upload (Cloudinary)
    Route::post('/admin/upload', [UploadController::class, 'upload']);

    // Clear all discounts
    Route::post('/admin/clear-discounts', function () {
        \App\Models\Product::query()->update(['discount_price' => null, 'offer_ends_at' => null]);
        return response()->json(['message' => 'Descuentos eliminados correctamente.']);
    });


});
