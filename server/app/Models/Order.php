<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'order_id',
        'supplier_id',
        'inventory_item_id',
        'item_name',
        'ordered_qty',
        'remaining_stock',
        'status',
        'order_date',
    ];

    protected function casts(): array
    {
        return [
            'ordered_qty' => 'integer',
            'remaining_stock' => 'integer',
            'order_date' => 'datetime',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
