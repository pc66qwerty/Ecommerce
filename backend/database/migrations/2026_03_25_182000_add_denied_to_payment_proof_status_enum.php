<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Column is already a string type — all values including 'denied' are accepted
    }

    public function down(): void
    {
        //
    }
};
