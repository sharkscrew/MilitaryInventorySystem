<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokenS;

    // ✅ Point to your actual table
    protected $table = 'tbl_users';

    protected $fillable = [
        'username',
        'password',
        'role',
        'is_deleted',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'is_deleted' => 'boolean',
        ];
    }
}