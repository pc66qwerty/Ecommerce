<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'features', 'price',
        'discount_price', 'offer_ends_at', 'stock', 'is_featured', 'images',
        'specs', 'video_url', 'cached_rating', 'cached_reviews_count',
    ];

    protected $casts = [
        'images'               => 'array',
        'specs'                => 'array',
        'features'             => 'array',
        'is_featured'          => 'boolean',
        'price'                => 'float',
        'discount_price'       => 'float',
        'offer_ends_at'        => 'datetime',
        'cached_rating'        => 'float',
        'cached_reviews_count' => 'integer',
    ];

    protected $appends = ['average_rating', 'reviews_count', 'image_url'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Read from cached columns — zero DB queries
    public function getAverageRatingAttribute(): float
    {
        return (float) ($this->cached_rating ?? 0);
    }

    public function getReviewsCountAttribute(): int
    {
        return (int) ($this->cached_reviews_count ?? 0);
    }

    public function getImageUrlAttribute(): string
    {
        return isset($this->images[0])
            ? $this->images[0]
            : 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600';
    }

    // Recalculate and persist rating cache for a product
    public static function refreshRating(int $productId): void
    {
        $product = static::find($productId);
        if (!$product) return;
        $product->update([
            'cached_rating'        => $product->reviews()->avg('rating') ?? 0,
            'cached_reviews_count' => $product->reviews()->count(),
        ]);
    }
}
