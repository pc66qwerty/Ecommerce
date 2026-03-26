<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        for ($i = 1; $i <= 3; $i++) {
            User::create([
                'name' => "Customer User $i",
                'email' => "user{$i}@test.com",
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]);
        }
    }
}
