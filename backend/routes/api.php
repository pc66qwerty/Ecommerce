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

// Google OAuth
Route::middleware('throttle:10,1')->post('/auth/google', function (\Illuminate\Http\Request $request) {
    $request->validate(['access_token' => 'required|string']);

    $response = \Illuminate\Support\Facades\Http::withToken($request->access_token)
        ->get('https://www.googleapis.com/oauth2/v3/userinfo');

    if ($response->failed()) {
        return response()->json(['message' => 'Token de Google inválido.'], 401);
    }

    $googleUser = $response->json();
    $email = $googleUser['email'] ?? null;
    if (!$email) {
        return response()->json(['message' => 'No se pudo obtener el email de Google.'], 401);
    }

    $user = \App\Models\User::firstOrCreate(
        ['email' => $email],
        [
            'name'     => $googleUser['name'] ?? $email,
            'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
            'google_id' => $googleUser['sub'] ?? null,
        ]
    );

    // Update google_id if it was missing (existing user logging in with Google for the first time)
    if (!$user->google_id && isset($googleUser['sub'])) {
        $user->update(['google_id' => $googleUser['sub']]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user'         => $user,
    ]);
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
Route::get('/settings/trust-bar', [SettingController::class, 'getTrustBar']);

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
    Route::put('/admin/settings/trust-bar', [SettingController::class, 'updateTrustBar']);

    // Admin Coupons
    Route::get('/admin/coupons', [CouponController::class, 'index']);
    Route::post('/admin/coupons', [CouponController::class, 'store']);
    Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);

    // Admin Stats
    Route::get('/admin/stats', [StatsController::class, 'index']);

    // Admin Reviews
    Route::get('/admin/reviews', function () {
        $reviews = \App\Models\Review::with('user', 'product')->latest()->get();
        return response()->json($reviews);
    });
    Route::put('/admin/reviews/{id}', function (\Illuminate\Http\Request $request, $id) {
        $review = \App\Models\Review::findOrFail($id);
        $request->validate(['comment' => 'nullable|string', 'rating' => 'required|integer|min:1|max:5']);
        $review->update(['comment' => $request->comment, 'rating' => $request->rating]);
        \App\Models\Product::refreshRating($review->product_id);
        return response()->json($review);
    });
    Route::delete('/admin/reviews/{id}', function ($id) {
        $review = \App\Models\Review::findOrFail($id);
        $productId = $review->product_id;
        $review->delete();
        \App\Models\Product::refreshRating($productId);
        return response()->json(['message' => 'Reseña eliminada.']);
    });

    // Verify admin password
    Route::post('/admin/verify-password', function (\Illuminate\Http\Request $request) {
        $request->validate(['password' => 'required|string']);
        $user = $request->user();
        if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Contraseña incorrecta.'], 422);
        }
        return response()->json(['ok' => true]);
    });

    // Image Upload (Cloudinary)
    Route::post('/admin/upload', [UploadController::class, 'upload']);

    // Clear all discounts
    Route::post('/admin/clear-discounts', function () {
        \App\Models\Product::query()->update(['discount_price' => null, 'offer_ends_at' => null]);
        return response()->json(['message' => 'Descuentos eliminados correctamente.']);
    });


});
