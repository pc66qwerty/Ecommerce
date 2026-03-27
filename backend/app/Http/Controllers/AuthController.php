<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8', // In a real app we might use 'confirmed' but 'min:8' is simpler for API.
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create personal welcome coupon for new user
        $couponCode = 'BIENVENIDO-' . strtoupper(substr(md5($user->id . $user->email), 0, 6));
        Coupon::create([
            'user_id'        => $user->id,
            'code'           => $couponCode,
            'description'    => '¡Bienvenido! Cupón exclusivo de registro — 10% de descuento en tu primera compra.',
            'discount_type'  => 'percentage',
            'discount_value' => 10,
            'min_purchase'   => 0,
            'max_uses'       => 1,
            'uses_count'     => 0,
            'is_active'      => true,
            'expires_at'     => now()->addDays(30),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been disabled. Contact support.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
        ];

        if ($request->filled('password')) {
            $rules['current_password'] = 'required|string';
            $rules['password']         = 'required|string|min:8';
        }

        $validated = $request->validate($rules);

        if (isset($validated['current_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $validated['password'] = Hash::make($validated['password']);
            unset($validated['current_password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function allUsers()
    {
        $users = User::latest()->get()->makeHidden(['password', 'remember_token']);
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'in:admin,customer',
            'is_active'=> 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role']      = $validated['role'] ?? 'customer';
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role'      => 'sometimes|required|in:admin,customer',
            'is_active' => 'sometimes|required|boolean',
            'name'      => 'sometimes|required|string|max:255',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    public function resetUserPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}
