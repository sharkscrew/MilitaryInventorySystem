<?php

namespace App\Observers;

use App\Jobs\SendWebhookToN8n;
use App\Models\StockTransaction;

class StockTransactionObserver
{
    public function created(StockTransaction $transaction): void
    {
        $item = $transaction->inventoryItem;

        // 1. Stock Receiving (receive + adjustment)
        if (in_array($transaction->type, ['receive', 'adjustment'])) {
            SendWebhookToN8n::dispatch(
                'http://localhost:5678/webhook/deb698cd-d68f-4de7-89cf-00de3c46a8bf',
                [
                    'event'        => 'stock.transaction',
                    'type'         => $transaction->type,
                    'productId'    => $item->id,
                    'productName'  => $item->name,
                    'quantity'     => $transaction->quantity,
                    'balanceAfter' => $transaction->balance_after,
                    'personnel'    => $transaction->personnel_name,
                    'updatedAt'    => now()->toISOString(),
                ]
            );
        }

        // 2. Order Fulfillment (all types)
        SendWebhookToN8n::dispatch(
            'http://localhost:5678/webhook/e2ef00d2-ab0b-41f8-8d08-d28103a0a04a',
            [
                'event'        => 'stock.transaction',
                'type'         => $transaction->type,
                'productId'    => $item->id,
                'productName'  => $item->name,
                'quantity'     => $transaction->quantity,
                'balanceAfter' => $transaction->balance_after,
                'personnel'    => $transaction->personnel_name,
                'updatedAt'    => now()->toISOString(),
            ]
        );

        // 3. Low Stock Alert (balance 10 or below)
        if ($transaction->balance_after <= 10) {
            SendWebhookToN8n::dispatch(
                'http://localhost:5678/webhook/79cf0370-37f5-4afe-87c2-d8ffbfcb4eb0',
                [
                    'event'        => 'stock.low',
                    'productId'    => $item->id,
                    'productName'  => $item->name,
                    'currentStock' => $transaction->balance_after,
                    'updatedAt'    => now()->toISOString(),
                ]
            );
        }
    }
}