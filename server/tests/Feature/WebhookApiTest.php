<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\WebhookDelivery;
use App\Models\WebhookSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsAdmin();
        config(['services.webhook.incoming_secret' => 'test-incoming-secret']);
    }

    public function test_lists_webhook_events(): void
    {
        $this->getJson('/api/webhooks/events')
            ->assertOk()
            ->assertJsonFragment(['stock.low']);
    }

    public function test_outgoing_webhook_dispatched_on_inventory_create(): void
    {
        Http::fake(['*' => Http::response('ok', 200)]);

        WebhookSubscription::create([
            'name' => 'Test Listener',
            'target_url' => 'https://example.com/hook',
            'secret' => 'test-secret-minimum-16-chars',
            'events' => ['inventory.created'],
            'is_active' => true,
        ]);

        $category = Category::create(['name' => 'Supplies']);

        $this->postJson('/api/inventory-items', [
            'category_id' => $category->id,
            'item_code' => 'NEW-001',
            'name' => 'New Supply',
            'quantity' => 1,
            'reorder_level' => 1,
        ])->assertCreated();

        Http::assertSentCount(1);
        $this->assertDatabaseHas('webhook_deliveries', [
            'event' => 'inventory.created',
            'direction' => 'outgoing',
            'success' => true,
        ]);
    }

    public function test_incoming_webhook_updates_stock_with_valid_signature(): void
    {
        $category = Category::create(['name' => 'Uniforms']);
        InventoryItem::create([
            'category_id' => $category->id,
            'item_code' => 'UNI-100',
            'name' => 'Boots',
            'quantity' => 3,
            'reorder_level' => 5,
            'unit' => 'pcs',
            'status' => 'low_stock',
        ]);

        $payload = json_encode([
            'event' => 'procurement.stock_received',
            'data' => [
                'item_code' => 'UNI-100',
                'quantity' => 20,
                'personnel_name' => 'Supply',
            ],
        ]);

        $signature = hash_hmac('sha256', $payload, 'test-incoming-secret');

        $this->postJson('/api/webhooks/incoming', json_decode($payload, true), [
            'X-Webhook-Signature' => $signature,
        ])
            ->assertOk()
            ->assertJsonPath('item.quantity', 20);

        $this->assertDatabaseHas('webhook_deliveries', [
            'direction' => 'incoming',
            'success' => true,
        ]);
    }

    public function test_incoming_webhook_rejects_invalid_signature(): void
    {
        $this->postJson('/api/webhooks/incoming', [
            'event' => 'test',
            'data' => ['item_code' => 'X', 'quantity' => 1],
        ], ['X-Webhook-Signature' => 'bad-signature'])
            ->assertUnauthorized();

        $this->assertTrue(
            WebhookDelivery::where('event', 'incoming.unauthorized')->exists()
        );
    }
}
