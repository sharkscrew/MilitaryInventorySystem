<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    protected function actingAsAdmin(): static
    {
        $user = User::factory()->create([
            'username' => 'testadmin',
            'role' => 'admin',
            'is_deleted' => false,
        ]);

        Sanctum::actingAs($user);

        return $this;
    }
}
