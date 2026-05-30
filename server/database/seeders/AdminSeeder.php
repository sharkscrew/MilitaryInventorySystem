<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin123'],  // username to find or create
            [
                'username'   => 'admin123',
                'password'   => Hash::make('Admin1234'),
                'role'       => 'admin',
                'is_deleted' => false,
                // add any other required fields your table has
            ]
        );

        $this->command->info('Admin user created successfully!');
    }
}