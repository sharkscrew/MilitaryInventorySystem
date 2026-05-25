<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncomingWebhookController extends Controller
{
    public function __construct(private WebhookService $webhooks) {}

    /**
     * External systems POST stock updates here (e.g. procurement portal).
     * Requires X-Webhook-Signature HMAC-SHA256 using WEBHOOK_INCOMING_SECRET.
     */
    public function handle(Request $request): JsonResponse
    {
        $secret = (string) config('services.webhook.incoming_secret');
        $rawBody = $request->getContent();
        $signature = (string) $request->header('X-Webhook-Signature', '');

        if (! $this->webhooks->verifySignature($rawBody, $signature, $secret)) {
            $this->webhooks->logIncoming('incoming.unauthorized', [], false, 401, 'Invalid signature');

            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        $payload = $request->validate([
            'event' => ['required', 'string'],
            'data' => ['required', 'array'],
            'data.item_code' => ['required', 'string'],
            'data.quantity' => ['required', 'integer', 'min:0'],
            'data.personnel_name' => ['nullable', 'string', 'max:255'],
            'data.remarks' => ['nullable', 'string'],
        ]);

        $item = InventoryItem::query()
            ->where('item_code', $payload['data']['item_code'])
            ->first();

        if (! $item) {
            $this->webhooks->logIncoming($payload['event'], $payload, false, 404, 'Item not found');

            return response()->json(['message' => 'Inventory item not found.'], 404);
        }

        $item->quantity = (int) $payload['data']['quantity'];
        $item->save();
        $item->refreshStatus();

        $this->webhooks->logIncoming($payload['event'], $payload, true, 200);
        $this->webhooks->dispatch('inventory.updated', [
            'item' => $item->load('category')->toArray(),
            'source' => 'incoming_webhook',
        ]);

        return response()->json([
            'message' => 'Stock updated via incoming webhook.',
            'item' => $item->load('category'),
        ]);
    }
}
