<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WebhookSubscription extends Model
{
    public const EVENTS = [
        'inventory.created',
        'inventory.updated',
        'inventory.deleted',
        'stock.low',
        'stock.transaction',
    ];

    protected $fillable = [
        'name',
        'target_url',
        'secret',
        'events',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (WebhookSubscription $subscription) {
            if (empty($subscription->secret)) {
                $subscription->secret = Str::random(32);
            }
        });
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    public function listensTo(string $event): bool
    {
        return in_array($event, $this->events ?? [], true);
    }
}
