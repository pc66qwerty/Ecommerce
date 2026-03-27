<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
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
            'address'              => 'required|string',
            'total'                => 'required|numeric',
            'products'             => 'required|array|min:1',
            'products.*.product_id'=> 'required|exists:products,id',
            'products.*.quantity'  => 'required|integer|min:1',
        ]);

        $userId = auth('sanctum')->id();

        try {
        $order = DB::transaction(function () use ($request, $userId) {
            $calculatedTotal = 0;
            $productSnapshots = [];

            foreach ($request->products as $p) {
                // Lock the row so concurrent orders can't read stale stock
                $product = \App\Models\Product::lockForUpdate()->find($p['product_id']);

                if (!$product || $product->stock < $p['quantity']) {
                    throw new \Exception("Sin stock suficiente para \"{$product->name}\" (disponible: {$product->stock})");
                }

                $priceToUse = $product->discount_price ?? $product->price;
                $calculatedTotal += ($priceToUse * $p['quantity']);

                $productSnapshots[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $priceToUse,
                    'quantity'     => $p['quantity'],
                ];
            }

            $couponCode = null;
            $discountAmount = 0;
            $appliedCouponModel = null;
            if ($request->filled('coupon_code')) {
                $coupon = Coupon::where('code', strtoupper(trim($request->coupon_code)))
                    ->where('is_active', true)->first();
                if ($coupon
                    && (!$coupon->expires_at || !$coupon->expires_at->isPast())
                    && (!$coupon->max_uses || $coupon->uses_count < $coupon->max_uses)
                    && $calculatedTotal >= $coupon->min_purchase) {
                    $discountAmount     = $coupon->getDiscountAmount($calculatedTotal);
                    $calculatedTotal    = max(0, $calculatedTotal - $discountAmount);
                    $coupon->increment('uses_count');
                    $couponCode         = $coupon->code;
                    $appliedCouponModel = $coupon;
                }
            }

            $order = Order::create([
                'user_id'              => $userId,
                'reference_number'     => 'ORD-' . strtoupper(Str::random(8)),
                'total_amount'         => $calculatedTotal,
                'status'               => 'Pending confirmation',
                'payment_proof_status' => 'pending',
                'shipping_info'        => $request->address,
            ]);

            foreach ($productSnapshots as $snap) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $snap['product_id'],
                    'product_name' => $snap['product_name'],
                    'price'        => $snap['price'],
                    'quantity'     => $snap['quantity'],
                ]);
                \App\Models\Product::where('id', $snap['product_id'])->decrement('stock', $snap['quantity']);
            }

            $order->statuses()->create(['status' => 'Pending confirmation']);

            if ($userId && $appliedCouponModel) {
                DB::table('coupon_usages')->insertOrIgnore([
                    'coupon_id'  => $appliedCouponModel->id,
                    'user_id'    => $userId,
                    'order_id'   => $order->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $order;
        });

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        return response()->json([
            'message'          => 'Order created',
            'reference_number' => $order->reference_number,
            'order'            => $order->load('items'),
        ], 201);
    }

    public function trackOrder($reference)
    {
        $order = Order::with(['statuses', 'items'])->where('reference_number', $reference)->firstOrFail();
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'           => 'required|string',
            'tracking_number'  => 'nullable|string',
            'shipping_company' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $order->update([
            'status'           => $request->status,
            'tracking_number'  => $request->tracking_number ?? $order->tracking_number,
            'shipping_company' => $request->shipping_company ?? $order->shipping_company,
        ]);

        $order->statuses()->create(['status' => $request->status]);

        return response()->json($order->load(['statuses', 'items']));
    }

    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['statuses', 'items'])
            ->latest()
            ->get();
        return response()->json($orders);
    }

    public function allOrders()
    {
        $orders = Order::with(['user', 'statuses', 'items'])->latest()->get();
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

        // Restaurar stock de los productos del pedido
        foreach ($order->items as $item) {
            if ($item->product_id) {
                \App\Models\Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }
        }

        return response()->json($order);
    }
}
