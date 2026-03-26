<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        // Seed default carousel slides
        DB::table('settings')->insert([
            'key' => 'carousel_slides',
            'value' => json_encode([
                [
                    'image' => 'https://images.unsplash.com/photo-1621252178351-5121b6d9da25?auto=format&fit=crop&q=80&w=1200',
                    'badge' => '🔥 Oferta Relámpago',
                    'title' => "Ilumina tu\nCamino",
                    'subtitle' => 'LEDs de alta potencia 6000K para cualquier vehículo. Instalación en minutos.',
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
                    'badge' => '⚡ Nuevo Ingreso',
                    'title' => "Accesorios\nPremium",
                    'subtitle' => 'La mejor selección de accesorios para el interior y exterior de tu auto.',
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200',
                    'badge' => '🚚 Envío Gratis',
                    'title' => "Precios\nInmejorables",
                    'subtitle' => 'Calidad garantizada con envío express en 2-3 días a todo el país.',
                ],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
