<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\StockTransaction;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockTransactionController extends Controller
{
    public function __construct(private WebhookService $webhooks) {}

    public function index(Request $request): JsonResponse
    {
        $query = StockTransaction::query()->with('inventoryItem.category');

        if ($request->filled('inventory_item_id')) {
            $query->where('inventory_item_id', $request->integer('inventory_item_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $transactions = $query->latest()->paginate(20);

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'type' => ['required', 'in:receive,issue,return,adjustment'],
            'quantity' => ['required', 'integer', 'min:1'],
            'personnel_name' => ['required', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string'],
        ]);

        $transaction = DB::transaction(function () use ($validated) {
            $item = InventoryItem::query()->lockForUpdate()->findOrFail($validated['inventory_item_id']);
            $quantity = (int) $validated['quantity'];
            $newBalance = $this->applyMovement($item, $validated['type'], $quantity);

            $item->quantity = $newBalance;
            $item->save();
            $item->refreshStatus();

            return StockTransaction::create([
                'inventory_item_id' => $item->id,
                'type' => $validated['type'],
                'quantity' => $quantity,
                'personnel_name' => $validated['personnel_name'],
                'reference_no' => $validated['reference_no'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'balance_after' => $newBalance,
            ]);
        });

        $item = $transaction->inventoryItem()->with('category')->first();
        $this->webhooks->notifyStockChange($item, $validated['type'], [
            'transaction' => $transaction->toArray(),
        ]);

        return response()->json($transaction->load('inventoryItem.category'), 201);
    }

    public function update(Request $request, StockTransaction $stockTransaction): JsonResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['sometimes', 'exists:inventory_items,id'],
            'type' => ['sometimes', 'in:receive,issue,return,adjustment'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'personnel_name' => ['sometimes', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string'],
        ]);

        $transaction = DB::transaction(function () use ($stockTransaction, $validated) {
            $previous = $stockTransaction->only([
                'inventory_item_id', 'type', 'quantity', 'personnel_name', 'reference_no', 'remarks',
            ]);

            $oldItem = InventoryItem::query()->lockForUpdate()->findOrFail($previous['inventory_item_id']);
            $this->reverseTransaction($stockTransaction, $oldItem);
            $stockTransaction->delete();

            $itemId = $validated['inventory_item_id'] ?? $previous['inventory_item_id'];
            $type = $validated['type'] ?? $previous['type'];
            $quantity = (int) ($validated['quantity'] ?? $previous['quantity']);

            $item = InventoryItem::query()->lockForUpdate()->findOrFail($itemId);
            $newBalance = $this->applyMovement($item, $type, $quantity);

            $item->quantity = $newBalance;
            $item->save();
            $item->refreshStatus();

            return StockTransaction::create([
                'inventory_item_id' => $item->id,
                'type' => $type,
                'quantity' => $quantity,
                'personnel_name' => $validated['personnel_name'] ?? $previous['personnel_name'],
                'reference_no' => $validated['reference_no'] ?? $previous['reference_no'],
                'remarks' => $validated['remarks'] ?? $previous['remarks'],
                'balance_after' => $newBalance,
            ]);
        });

        $item = $transaction->inventoryItem()->with('category')->first();
        $this->webhooks->notifyStockChange($item, $transaction->type, [
            'transaction' => $transaction->toArray(),
            'action' => 'updated',
        ]);

        return response()->json($transaction->load('inventoryItem.category'));
    }

    public function destroy(StockTransaction $stockTransaction): JsonResponse
    {
        DB::transaction(function () use ($stockTransaction) {
            $item = InventoryItem::query()->lockForUpdate()->findOrFail($stockTransaction->inventory_item_id);
            $this->reverseTransaction($stockTransaction, $item);
            $stockTransaction->delete();
        });

        return response()->json(['message' => 'Stock transaction deleted.']);
    }

    private function applyMovement(InventoryItem $item, string $type, int $quantity): int
    {
        return match ($type) {
            'receive', 'return' => $item->quantity + $quantity,
            'issue' => $this->issueQuantity($item, $quantity),
            'adjustment' => $quantity,
            default => $item->quantity,
        };
    }

    private function issueQuantity(InventoryItem $item, int $quantity): int
    {
        if ($quantity > $item->quantity) {
            throw ValidationException::withMessages([
                'quantity' => ['Insufficient stock for this issue.'],
            ]);
        }

        return $item->quantity - $quantity;
    }

    private function reverseTransaction(StockTransaction $transaction, InventoryItem $item): void
    {
        $balance = match ($transaction->type) {
            'receive', 'return' => $item->quantity - $transaction->quantity,
            'issue' => $item->quantity + $transaction->quantity,
            'adjustment' => $this->balanceBeforeAdjustment($transaction, $item),
            default => $item->quantity,
        };

        $item->quantity = max(0, $balance);
        $item->save();
        $item->refreshStatus();
    }

    private function balanceBeforeAdjustment(StockTransaction $transaction, InventoryItem $item): int
    {
        $previous = StockTransaction::query()
            ->where('inventory_item_id', $item->id)
            ->where('id', '<', $transaction->id)
            ->orderByDesc('id')
            ->value('balance_after');

        return $previous ?? 0;
    }
}
