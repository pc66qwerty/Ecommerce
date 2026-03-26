<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\OrderStatus;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function submitOrder(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'total' => 'required|numeric',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1'
        ]);

        $calculatedTotal = 0;

        foreach ($request->products as $p) {
            $product = \App\Models\Product::find($p['product_id']);

            if ($product->stock < $p['quantity']) {
                $errorMsg = 'Product ' . $product->name . ' is out of stock (Only ' . $product->stock . ' left)';
                Log::error($errorMsg);
                return response()->json(['message' => $errorMsg], 400);
            }

            $priceToUse = $product->discount_price ?? $product->price;
            $calculatedTotal += ($priceToUse * $p['quantity']);
        }

        $couponCode = null;
        $discountAmount = 0;
        $appliedCouponModel = null;
        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper(trim($request->coupon_code)))
                ->where('is_active', true)
                ->first();
            if ($coupon && (!$coupon->expires_at || !$coupon->expires_at->isPast())
                && (!$coupon->max_uses || $coupon->uses_count < $coupon->max_uses)
                && $calculatedTotal >= $coupon->min_purchase) {
                $discountAmount = $coupon->getDiscountAmount($calculatedTotal);
                $calculatedTotal = max(0, $calculatedTotal - $discountAmount);
                $coupon->increment('uses_count');
                $couponCode = $coupon->code;
                $appliedCouponModel = $coupon;
            }
        }

        // Create Order natively using accurate total
        $order = Order::create([
            'user_id' => auth('sanctum')->id(), // null if guest, populated if Bearer token sent
            'reference_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $calculatedTotal,
            'status' => 'Pending confirmation',
            'payment_proof_status' => 'pending',
            'shipping_info' => $request->address
        ]);

        // Deduct quantities permanently
        foreach ($request->products as $p) {
            $product = \App\Models\Product::find($p['product_id']);
            $product->decrement('stock', $p['quantity']);
        }

        // Record initial timeline event
        $order->statuses()->create(['status' => 'Pending confirmation']);

        // Registrar uso del cupón por usuario para evitar doble uso
        $userId = auth('sanctum')->id();
        if ($userId && $appliedCouponModel) {
            DB::table('coupon_usages')->insertOrIgnore([
                'coupon_id'  => $appliedCouponModel->id,
                'user_id'    => $userId,
                'order_id'   => $order->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Order preliminary created, redirect to WhatsApp',
            'reference_number' => $order->reference_number,
            'order' => $order
        ], 201);
    }

    public function trackOrder($reference)
    {
        $order = Order::with('statuses')->where('reference_number', $reference)->firstOrFail();
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'tracking_number' => 'nullable|string',
            'shipping_company' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);
        $order->update([
            'status' => $request->status,
            'tracking_number' => $request->tracking_number ?? $order->tracking_number,
            'shipping_company' => $request->shipping_company ?? $order->shipping_company,
        ]);

        $order->statuses()->create(['status' => $request->status]);

        return response()->json($order->load('statuses'));
    }

    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)->with('statuses')->latest()->get();
        return response()->json($orders);
    }

    public function allOrders()
    {
        $orders = Order::with(['user', 'statuses'])->latest()->get();
        return response()->json($orders);
    }

    public function approvePayment($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['payment_proof_status' => 'approved']);
        return response()->json($order);
    }

    public function denyPayment($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['payment_proof_status' => 'denied']);
        $order->statuses()->create(['status' => 'Payment denied']);
        return response()->json($order);
    }
}
