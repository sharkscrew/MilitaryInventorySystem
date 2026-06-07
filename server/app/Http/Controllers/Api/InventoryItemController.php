<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    public function __construct(private WebhookService $webhooks) {}

    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::query()->with(['category', 'supplier']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('item_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        $items = $query->orderBy('name')->paginate(15);

        return response()->json($items);
    }

    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        return response()->json($inventoryItem->load(['category', 'supplier', 'stockTransactions' => fn ($q) => $q->latest()->limit(20)]));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'item_code' => ['required', 'string', 'max:50', 'unique:inventory_items,item_code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'unit' => ['nullable', 'string', 'max:50'],
            'quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $item = InventoryItem::create([
            ...$validated,
            'quantity' => $validated['quantity'] ?? 0,
            'reorder_level' => $validated['reorder_level'] ?? 10,
            'unit' => $validated['unit'] ?? 'pcs',
        ]);

        $item->refreshStatus();

        $this->webhooks->dispatch('inventory.created', ['item' => $item->load('category')->toArray()]);

        return response()->json($item, 201);
    }

    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'item_code' => ['sometimes', 'string', 'max:50', 'unique:inventory_items,item_code,'.$inventoryItem->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'unit' => ['nullable', 'string', 'max:50'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'reorder_level' => ['sometimes', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $inventoryItem->update($validated);
        $inventoryItem->refreshStatus();

        $this->webhooks->dispatch('inventory.updated', ['item' => $inventoryItem->load('category')->toArray()]);

        return response()->json($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $payload = ['item' => $inventoryItem->load('category')->toArray()];
        $inventoryItem->delete();

        $this->webhooks->dispatch('inventory.deleted', $payload);

        return response()->json(['message' => 'Inventory item deleted.']);
    }
}
