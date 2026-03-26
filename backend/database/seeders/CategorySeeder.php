<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'LED Lights',
            'Headlights',
            'Interior',
            'Engine',
            'Tools',
            'Safety',
            'GPS'
        ];

        foreach ($categories as $catName) {
            Category::create([
                'name' => $catName,
                'slug' => Str::slug($catName),
                'description' => "Explore our premium selection of {$catName} for your vehicle.",
            ]);
        }
    }
}
