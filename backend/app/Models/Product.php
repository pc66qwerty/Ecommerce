<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price', 'discount_price', 'stock', 'is_featured', 'images', 'specs', 'video_url'
    ];

    protected $casts = [
        'images' => 'array',
        'specs' => 'array',
        'is_featured' => 'boolean',
        'price' => 'float',
        'discount_price' => 'float',
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

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?: 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function getImageUrlAttribute()
    {
        return isset($this->images[0]) ? $this->images[0] : 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600';
    }
}
