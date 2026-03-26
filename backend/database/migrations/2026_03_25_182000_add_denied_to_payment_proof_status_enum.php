<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY payment_proof_status ENUM('pending', 'received', 'approved', 'denied') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY payment_proof_status ENUM('pending', 'received', 'approved') DEFAULT 'pending'");
    }
};
