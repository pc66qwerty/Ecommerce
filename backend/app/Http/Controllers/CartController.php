<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCart(Request $request)
    {
        $userId = auth('sanctum')->id();
        $sessionId = $request->header('X-Session-ID') ?? 'MOCK_SESSION_'.rand(1000, 9999);

        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        return response()->json($cart->load('items.product'));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['message' => 'Not enough stock available'], 400);
        }

        $cart = $this->getCart($request);

        $cartItem = $cart->items()->where('product_id', $request->product_id)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($product->stock < $newQuantity) {
                return response()->json(['message' => 'Cannot add more, exceeds stock limit'], 400);
            }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json($cart->load('items.product'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::findOrFail($request->cart_item_id);
        $product = $cartItem->product;

        if ($product->stock < $request->quantity) {
            return response()->json(['message' => 'Not enough stock available'], 400);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json($cartItem->cart->load('items.product'));
    }

    public function remove($cartItemId)
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $cartItem->delete();

        return response()->json(['message' => 'Item removed']);
    }
}
