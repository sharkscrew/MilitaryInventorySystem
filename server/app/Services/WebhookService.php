<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\WebhookDelivery;
use App\Models\WebhookSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WebhookService
{
    public function dispatch(string $event, array $payload): void
    {
        $subscriptions = WebhookSubscription::query()
            ->where('is_active', true)
            ->get()
            ->filter(fn (WebhookSubscription $subscription) => $subscription->listensTo($event));

        foreach ($subscriptions as $subscription) {
            $this->sendToSubscription($subscription, $event, $payload);
        }
    }

    public function sendToSubscription(
        WebhookSubscription $subscription,
        string $event,
        array $payload
    ): WebhookDelivery {
        $body = [
            'id' => (string) Str::uuid(),
            'event' => $event,
            'created_at' => now()->toIso8601String(),
            'data' => $payload,
        ];

        $json = json_encode($body);
        $signature = hash_hmac('sha256', $json, $subscription->secret);

        $delivery = WebhookDelivery::create([
            'webhook_subscription_id' => $subscription->id,
            'event' => $event,
            'direction' => 'outgoing',
            'payload' => $body,
            'success' => false,
        ]);

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Event' => $event,
                    'X-Webhook-Signature' => $signature,
                ])
                ->withBody($json, 'application/json')
                ->post($subscription->target_url);

            $delivery->update([
                'response_status' => $response->status(),
                'response_body' => Str::limit($response->body(), 2000),
                'success' => $response->successful(),
            ]);
        } catch (\Throwable $exception) {
            $delivery->update([
                'response_status' => 0,
                'response_body' => $exception->getMessage(),
                'success' => false,
            ]);
        }

        return $delivery;
    }

    public function verifySignature(string $rawBody, string $signature, string $secret): bool
    {
        if ($signature === '' || $secret === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $signature);
    }

    public function logIncoming(string $event, array $payload, bool $success, ?int $status = null, ?string $body = null): WebhookDelivery
    {
        return WebhookDelivery::create([
            'webhook_subscription_id' => null,
            'event' => $event,
            'direction' => 'incoming',
            'payload' => $payload,
            'response_status' => $status,
            'response_body' => $body,
            'success' => $success,
        ]);
    }

    public function notifyStockChange(InventoryItem $item, string $transactionType, array $extra = []): void
    {
        $payload = [
            'item' => $item->load('category')->toArray(),
            'transaction_type' => $transactionType,
            ...$extra,
        ];

        $this->dispatch('stock.transaction', $payload);

        if (in_array($item->status, ['low_stock', 'out_of_stock'], true)) {
            $this->dispatch('stock.low', $payload);
        }
    }
}
