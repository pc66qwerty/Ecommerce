<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function getCarousel()
    {
        $row = DB::table('settings')->where('key', 'carousel_slides')->first();
        $slides = $row ? json_decode($row->value, true) : [];
        return response()->json($slides);
    }

    public function updateCarousel(Request $request)
    {
        $request->validate([
            'slides' => 'required|array|min:1|max:6',
            'slides.*.image' => 'required|string',
            'slides.*.badge' => 'required|string|max:100',
            'slides.*.title' => 'required|string|max:200',
            'slides.*.subtitle' => 'required|string|max:300',
        ]);

        DB::table('settings')->updateOrInsert(
            ['key' => 'carousel_slides'],
            ['value' => json_encode($request->slides), 'updated_at' => now()]
        );

        return response()->json(['message' => 'Carrusel actualizado correctamente']);
    }
}
