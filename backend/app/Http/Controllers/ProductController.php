<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Bulk expire discounts in one UPDATE — replaces per-product loop
        Product::whereNotNull('offer_ends_at')
            ->where('offer_ends_at', '<=', now())
            ->update(['discount_price' => null, 'offer_ends_at' => null]);

        $query = Product::with('category');

        // Filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'ilike', "%{$s}%")
                  ->orWhere('description', 'ilike', "%{$s}%");
            });
        }

        if ($request->filled('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($request->filled('discounted')) {
            $query->whereNotNull('discount_price')->where('discount_price', '>', 0);
        }

        if ($request->filled('min_price')) {
            $query->whereRaw('COALESCE(discount_price, price) >= ?', [(float) $request->min_price]);
        }

        if ($request->filled('max_price')) {
            $query->whereRaw('COALESCE(discount_price, price) <= ?', [(float) $request->max_price]);
        }

        // Sort
        switch ($request->get('sort', 'newest')) {
            case 'price_asc':  $query->orderByRaw('COALESCE(discount_price, price) ASC'); break;
            case 'price_desc': $query->orderByRaw('COALESCE(discount_price, price) DESC'); break;
            case 'rating':     $query->orderByDesc('cached_rating'); break;
            default:           $query->orderByDesc('created_at');
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $paginated = $query->paginate($perPage);

        // Flash sale metadata — one aggregate query
        $discountsMeta = Product::whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->selectRaw('COUNT(*) as count, MIN(offer_ends_at) as nearest_expiry')
            ->first();

        return response()->json(array_merge($paginated->toArray(), [
            'discounts_meta' => $discountsMeta,
        ]));
    }

    public function categories()
    {
        return response()->json(\App\Models\Category::orderBy('name')->get());
    }

    public function show($id)
    {
        $product = Product::with('category', 'reviews.user')->findOrFail($id);

        if ($product->offer_ends_at && $product->offer_ends_at <= now()) {
            $product->update(['discount_price' => null, 'offer_ends_at' => null]);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'slug'         => 'required|string|unique:products',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0.01',
            'stock'        => 'required|integer|min:0',
            'images'       => 'nullable|array',
            'specs'        => 'nullable|array',
            'is_featured'  => 'boolean',
            'discount_price' => 'nullable|numeric|min:0',
            'offer_ends_at' => 'nullable|date',
            'features'     => 'nullable|array',
            'video_url'    => 'nullable|url',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id'  => 'sometimes|exists:categories,id',
            'name'         => 'sometimes|string|max:255',
            'slug'         => 'sometimes|string|unique:products,slug,' . $product->id,
            'description'  => 'nullable|string',
            'price'        => 'sometimes|numeric|min:0.01',
            'stock'        => 'sometimes|integer|min:0',
            'images'       => 'nullable|array',
            'specs'        => 'nullable|array',
            'is_featured'  => 'sometimes|boolean',
            'discount_price' => 'nullable|numeric|min:0',
            'offer_ends_at' => 'nullable|date',
            'features'     => 'nullable|array',
            'video_url'    => 'nullable|url',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function submitReview(Request $request, $id)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $product = Product::findOrFail($id);
        $review  = $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating'  => $request->rating,
            'comment' => $request->comment,
        ]);

        // Refresh cached rating columns
        Product::refreshRating($product->id);

        return response()->json($review, 201);
    }
}
