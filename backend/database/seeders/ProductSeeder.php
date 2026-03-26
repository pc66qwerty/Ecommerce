<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\Review;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $categories = Category::all();
        $users = User::all();
        
        $productsData = [
            ['name' => 'LED Strip RGB for Car', 'cat' => 'LED Lights', 'image' => 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'High Power LED Bulbs', 'cat' => 'LED Lights', 'image' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Neon Underglow Kit', 'cat' => 'LED Lights', 'image' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'HID Xenon Headlights', 'cat' => 'Headlights', 'image' => 'https://images.unsplash.com/photo-1542319630-55fb7f7c9e03?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'LED Fog Lights Pair', 'cat' => 'Headlights', 'image' => 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Magnetic Car Phone Holder', 'cat' => 'Interior', 'image' => 'https://images.unsplash.com/photo-1582208154673-c6cd442bc1d8?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Premium Leather Seat Covers', 'cat' => 'Interior', 'image' => 'https://images.unsplash.com/photo-1560383378-005ca7ff4791?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Alcantara Steering Wheel Cover', 'cat' => 'Interior', 'image' => 'https://images.unsplash.com/photo-1549921296-3398c257cae5?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Smart GPS Tracker Device', 'cat' => 'GPS', 'image' => 'https://images.unsplash.com/photo-1509121776510-1e5bdea20921?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Navigation Screen Protector', 'cat' => 'GPS', 'image' => 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Emergency Roadside Flare Kit', 'cat' => 'Safety', 'image' => 'https://images.unsplash.com/photo-1594924716168-3e4bda125e62?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Front and Rear Dash Cam 4K', 'cat' => 'Safety', 'image' => 'https://images.unsplash.com/photo-1510103597148-1ad0b4f8cb6e?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Heavy Duty 4-Gauge Jumper Cables', 'cat' => 'Safety', 'image' => 'https://images.unsplash.com/photo-1610444535390-3cb83edc4b3f?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Full Synthetic Engine Oil 5W-30', 'cat' => 'Engine', 'image' => 'https://images.unsplash.com/photo-1584988775269-ad6a9fe6fd20?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Performance Cone Air Filter', 'cat' => 'Engine', 'image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Radiator Coolant Flush Kit', 'cat' => 'Engine', 'image' => 'https://images.unsplash.com/photo-1625890906644-8395edc9d8bd?auto=format&fit=crop&q=80&w=600'],
            ['name' => '102-Piece Mechanic Tool Set', 'cat' => 'Tools', 'image' => 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Digital Tire Pressure Gauge', 'cat' => 'Tools', 'image' => 'https://images.unsplash.com/photo-1498887960847-2a5e46312788?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Portable 12V Air Compressor', 'cat' => 'Tools', 'image' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600'],
            ['name' => 'Bluetooth OBD2 Code Scanner', 'cat' => 'Tools', 'image' => 'https://images.unsplash.com/photo-1551522435-a13afa10f103?auto=format&fit=crop&q=80&w=600'],
        ];

        foreach ($productsData as $item) {
            $cat = $categories->where('name', $item['cat'])->first();
            if (!$cat) continue;

            $price = rand(50, 500) + 0.99;
            $discount = rand(0, 30);
            $hasDiscount = rand(0, 1) === 1;

            $p = Product::create([
                'category_id' => $cat->id,
                'name' => $item['name'],
                'slug' => Str::slug($item['name']),
                'description' => "High quality {$item['name']} for universal car fitments. Constructed from premium materials to ensure durability and top performance.",
                'price' => $price,
                'discount_price' => $hasDiscount ? round($price * (1 - ($discount / 100)), 2) : null,
                'stock' => rand(2, 50),
                'is_featured' => rand(0, 1) === 1,
                'images' => [$item['image']],
            ]);

            if ($users->count() > 0) {
                // Generate 1-4 random ratings per product
                for ($i = 0; $i < rand(1, 4); $i++) {
                    Review::create([
                        'product_id' => $p->id,
                        'user_id' => $users->random()->id,
                        'rating' => rand(4, 5), // Most products have good ratings
                        'comment' => "Amazing quality, totally worth the price!",
                    ]);
                }
            }
        }
    }
}
