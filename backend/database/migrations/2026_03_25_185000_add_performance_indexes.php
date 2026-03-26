<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id');
            $table->index('is_featured');
            $table->index('created_at');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('reference_number');
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->index('code');
            $table->index('user_id');
            $table->index('is_active');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['reference_number']);
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropIndex(['code']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
        });
    }
};
