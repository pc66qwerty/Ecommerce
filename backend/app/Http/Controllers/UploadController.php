<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,gif|max:5120', // max 5MB
        ]);

        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);

        $result = $cloudinary->uploadApi()->upload(
            $request->file('file')->getRealPath(),
            [
                'folder'         => 'mian-store',
                'transformation' => [['quality' => 'auto', 'fetch_format' => 'auto']],
            ]
        );

        return response()->json([
            'url'       => $result['secure_url'],
            'public_id' => $result['public_id'],
        ]);
    }
}
