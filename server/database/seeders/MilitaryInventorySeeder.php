<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Supplier;
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

        $armyGear = Supplier::firstOrCreate(['name' => 'Army Gear Co']);
        $militaryGear = Supplier::firstOrCreate(['name' => 'Military Gear Corp']);

        $items = [
            [
                'supplier_id' => $armyGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'AG-001',
                'name' => 'PNP Pershing Cap',
                'quantity' => 50,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $armyGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'AG-002',
                'name' => 'Security Pants',
                'quantity' => 20,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $armyGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'AG-003',
                'name' => 'Security Ball Cap',
                'quantity' => 50,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $armyGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'AG-004',
                'name' => 'Security Pershing Cap',
                'quantity' => 50,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $armyGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'AG-005',
                'name' => 'Security Uniform',
                'quantity' => 20,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $equipment->id,
                'item_code' => 'MGC-001',
                'name' => 'Inside Holster',
                'quantity' => 30,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $equipment->id,
                'item_code' => 'MGC-002',
                'name' => 'Security Belt Set',
                'quantity' => 10,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $equipment->id,
                'item_code' => 'MGC-003',
                'name' => 'Rig Belt Set',
                'quantity' => 10,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'MGC-004',
                'name' => 'PNP Uniform',
                'quantity' => 20,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $equipment->id,
                'item_code' => 'MGC-005',
                'name' => 'Outside Holster',
                'quantity' => 30,
                'approval_status' => 'APPROVED',
            ],
            [
                'supplier_id' => $militaryGear->id,
                'category_id' => $uniforms->id,
                'item_code' => 'MGC-006',
                'name' => 'Military Boots',
                'quantity' => 0,
                'approval_status' => 'REORDERED',
                'po_id' => 'PO-2026-05-27T19:07:35.779+08:00',
                'reorder_qty' => 0,
                'urgency' => 'HIGH',
                'note' => 'Stock is zero — place an immediate reorder. Recommended quantity 50 (minimum 10).',
            ],
        ];

        $itemByName = [];

        foreach ($items as $data) {
            $item = InventoryItem::updateOrCreate(
                ['item_code' => $data['item_code']],
                [
                    ...$data,
                    'unit' => 'pcs',
                    'reorder_level' => 10,
                    'location' => 'Warehouse A',
                ]
            );
            $item->refreshStatus();
            $itemByName[$item->name] = $item;
        }

        $orders = [
            [
                'order_id' => 'ORD-1780561903692',
                'supplier_id' => $militaryGear->id,
                'item_name' => 'PNP Uniform',
                'ordered_qty' => 5,
                'remaining_stock' => 45,
                'status' => 'Fulfilled',
                'order_date' => '2026-06-04T04:31:43.715-04:00',
            ],
            [
                'order_id' => 'ORD-1780561988204',
                'supplier_id' => $militaryGear->id,
                'item_name' => 'PNP Uniform',
                'ordered_qty' => 5,
                'remaining_stock' => 40,
                'status' => 'Fulfilled',
                'order_date' => '2026-06-04T04:33:08.205-04:00',
            ],
            [
                'order_id' => 'ORD-1780562597458',
                'supplier_id' => $militaryGear->id,
                'item_name' => 'PNP Uniform',
                'ordered_qty' => 5,
                'remaining_stock' => 35,
                'status' => 'Fulfilled',
                'order_date' => '2026-06-04T04:43:17.459-04:00',
            ],
        ];

        foreach ($orders as $data) {
            Order::updateOrCreate(
                ['order_id' => $data['order_id']],
                [
                    ...$data,
                    'inventory_item_id' => $itemByName[$data['item_name']]->id ?? null,
                ]
            );
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
