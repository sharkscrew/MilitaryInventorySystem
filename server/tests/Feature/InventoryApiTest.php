<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\InventoryItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsAdmin();
    }

    public function test_health_endpoint(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    public function test_dashboard_returns_summary(): void
    {
        $category = Category::create(['name' => 'Test Category']);
        InventoryItem::create([
            'category_id' => $category->id,
            'item_code' => 'TST-001',
            'name' => 'Test Item',
            'quantity' => 5,
            'reorder_level' => 10,
            'unit' => 'pcs',
            'status' => 'low_stock',
        ]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('total_items', 1)
            ->assertJsonPath('low_stock_count', 1)
            ->assertJsonCount(1, 'low_stock_items');
    }

    public function test_stock_issue_reduces_quantity_and_logs_transaction(): void
    {
        $category = Category::create(['name' => 'Gear']);
        $item = InventoryItem::create([
            'category_id' => $category->id,
            'item_code' => 'GEAR-01',
            'name' => 'Vest',
            'quantity' => 10,
            'reorder_level' => 2,
            'unit' => 'pcs',
            'status' => 'available',
        ]);

        $this->postJson('/api/stock-transactions', [
            'inventory_item_id' => $item->id,
            'type' => 'issue',
            'quantity' => 3,
            'personnel_name' => 'Test Officer',
            'reference_no' => 'ISS-TEST',
        ])
            ->assertCreated()
            ->assertJsonPath('balance_after', 7);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $item->id,
            'quantity' => 7,
        ]);

        $this->assertDatabaseHas('stock_transactions', [
            'inventory_item_id' => $item->id,
            'type' => 'issue',
            'personnel_name' => 'Test Officer',
        ]);
    }

    public function test_cannot_issue_more_than_available_stock(): void
    {
        $category = Category::create(['name' => 'Gear']);
        $item = InventoryItem::create([
            'category_id' => $category->id,
            'item_code' => 'GEAR-02',
            'name' => 'Helmet',
            'quantity' => 2,
            'reorder_level' => 1,
            'unit' => 'pcs',
            'status' => 'available',
        ]);

        $this->postJson('/api/stock-transactions', [
            'inventory_item_id' => $item->id,
            'type' => 'issue',
            'quantity' => 5,
            'personnel_name' => 'Test Officer',
        ])->assertStatus(422);
    }
}
