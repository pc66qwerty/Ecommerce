<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private function expireDiscounts($products)
    {
        $now = now();
        return $products->map(function ($p) use ($now) {
            if ($p->offer_ends_at && $p->offer_ends_at <= $now) {
                $p->discount_price = null;
                $p->offer_ends_at = null;
            }
            return $p;
        });
    }

    public function index(Request $request)
    {
        $query = Product::with('category')->orderBy('created_at', 'desc');

        if ($request->has('page')) {
            $perPage = min((int) $request->get('per_page', 20), 100);
            $paginated = $query->paginate($perPage);
            $paginated->setCollection($this->expireDiscounts($paginated->getCollection()));
            return response()->json($paginated);
        }

        return response()->json($this->expireDiscounts($query->get()));
    }

    public function categories()
    {
        return response()->json(\App\Models\Category::orderBy('name')->get());
    }

    public function show($id)
    {
        $product = Product::with('category', 'reviews.user')->findOrFail($id);
        if ($product->offer_ends_at && $product->offer_ends_at <= now()) {
            $product->discount_price = null;
            $product->offer_ends_at = null;
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
            'images' => 'nullable|array',
            'specs' => 'nullable|array',
            'is_featured' => 'boolean',
            'discount_price' => 'nullable|numeric|min:0',
            'offer_ends_at' => 'nullable|date',
            'features' => 'nullable|array',
            'video_url' => 'nullable|url',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0.01',
            'stock' => 'sometimes|integer|min:0',
            'images' => 'nullable|array',
            'specs' => 'nullable|array',
            'is_featured' => 'sometimes|boolean',
            'discount_price' => 'nullable|numeric|min:0',
            'offer_ends_at' => 'nullable|date',
            'features' => 'nullable|array',
            'video_url' => 'nullable|url',
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
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        $product = Product::findOrFail($id);
        $review = $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json($review, 201);
    }
}
