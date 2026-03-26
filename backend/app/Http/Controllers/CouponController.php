<?php
namespace App\Http\Controllers;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponController extends Controller {
    // Public: list active coupons for display (global, no user_id)
    public function publicList() {
        $coupons = Coupon::whereNull('user_id')
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function($q) {
                $q->whereNull('max_uses')->orWhereRaw('uses_count < max_uses');
            })
            ->get();
        return response()->json($coupons);
    }

    // Protected: list personal coupons for the authenticated user
    public function myCoupons(Request $request) {
        $coupons = Coupon::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function($q) {
                $q->whereNull('max_uses')->orWhereRaw('uses_count < max_uses');
            })
            ->get();
        return response()->json($coupons);
    }

    // Public: validate a coupon code + cart total
    public function validate(Request $request) {
        $request->validate(['code' => 'required|string', 'total' => 'required|numeric|min:0']);
        $coupon = Coupon::where('code', strtoupper(trim($request->code)))->first();
        if (!$coupon) return response()->json(['message' => 'Cupón no encontrado.'], 404);
        if (!$coupon->is_active) return response()->json(['message' => 'Este cupón no está activo.'], 422);
        if ($coupon->expires_at && $coupon->expires_at->isPast()) return response()->json(['message' => 'Este cupón ha expirado.'], 422);
        if ($coupon->max_uses && $coupon->uses_count >= $coupon->max_uses) return response()->json(['message' => 'Este cupón alcanzó su límite de usos.'], 422);
        if ($request->total < $coupon->min_purchase) return response()->json(['message' => "Compra mínima de Q{$coupon->min_purchase} requerida."], 422);

        // Verificar uso previo por usuario autenticado
        $userId = auth('sanctum')->id();
        if ($userId) {
            $alreadyUsed = DB::table('coupon_usages')
                ->where('coupon_id', $coupon->id)
                ->where('user_id', $userId)
                ->exists();
            if ($alreadyUsed) {
                return response()->json(['message' => 'Ya utilizaste este cupón anteriormente.'], 422);
            }
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_type' => $coupon->discount_type,
            'discount_value' => (float)$coupon->discount_value,
            'discount_amount' => $coupon->getDiscountAmount((float)$request->total),
            'description' => $coupon->description,
        ]);
    }

    // Admin CRUD
    public function index() {
        return response()->json(Coupon::latest()->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));
        $coupon = Coupon::create($validated);
        return response()->json($coupon, 201);
    }

    public function update(Request $request, $id) {
        $coupon = Coupon::findOrFail($id);
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50|unique:coupons,code,' . $id,
            'description' => 'nullable|string|max:255',
            'discount_type' => 'sometimes|required|in:percentage,fixed',
            'discount_value' => 'sometimes|required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);
        if (isset($validated['code'])) $validated['code'] = strtoupper(trim($validated['code']));
        $coupon->update($validated);
        return response()->json($coupon);
    }

    public function destroy($id) {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted.']);
    }
}
