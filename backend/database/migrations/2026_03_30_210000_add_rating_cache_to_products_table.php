<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('cached_rating', 3, 2)->default(0)->after('discount_price');
            $table->unsignedInteger('cached_reviews_count')->default(0)->after('cached_rating');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['cached_rating', 'cached_reviews_count']);
        });
    }
};
