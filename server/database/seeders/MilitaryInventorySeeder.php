<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\WebhookSubscription;
use Illuminate\Database\Seeder;

class MilitaryInventorySeeder extends Seeder
{
    public function run(): void
    {
        $uniforms = Category::firstOrCreate(
            ['name' => 'Uniforms & Apparel'],
            ['description' => 'BDU, boots, caps, and related apparel.']
        );

        $equipment = Category::firstOrCreate(
            ['name' => 'Equipment & Gear'],
            ['description' => 'Tactical gear, packs, and field equipment.']
        );

        $supplies = Category::firstOrCreate(
            ['name' => 'Supplies & Consumables'],
            ['description' => 'Cleaning kits, patches, name tapes, and consumables.']
        );

        $items = [
            ['category_id' => $uniforms->id, 'item_code' => 'UNI-001', 'name' => 'BDU Set (Woodland)', 'quantity' => 45, 'reorder_level' => 15, 'location' => 'Warehouse A'],
            ['category_id' => $uniforms->id, 'item_code' => 'UNI-002', 'name' => 'Combat Boots (Size 9)', 'quantity' => 8, 'reorder_level' => 10, 'location' => 'Warehouse A'],
            ['category_id' => $equipment->id, 'item_code' => 'EQP-001', 'name' => 'Tactical Vest', 'quantity' => 22, 'reorder_level' => 8, 'location' => 'Armory'],
            ['category_id' => $equipment->id, 'item_code' => 'EQP-002', 'name' => 'Helmet (Standard)', 'quantity' => 0, 'reorder_level' => 5, 'location' => 'Armory'],
            ['category_id' => $supplies->id, 'item_code' => 'SUP-001', 'name' => 'Name Tape Kit', 'quantity' => 120, 'reorder_level' => 30, 'location' => 'Supply Room'],
        ];

        foreach ($items as $data) {
            $item = InventoryItem::updateOrCreate(
                ['item_code' => $data['item_code']],
                [
                    ...$data,
                    'unit' => 'pcs',
                ]
            );
            $item->refreshStatus();
        }

        WebhookSubscription::firstOrCreate(
            ['name' => 'Demo Low Stock Listener'],
            [
                'target_url' => 'https://webhook.site/unique-id-replace-me',
                'secret' => 'demo-webhook-secret-change-me-32',
                'events' => ['stock.low', 'stock.transaction', 'inventory.created'],
                'is_active' => false,
            ]
        );
    }
}
