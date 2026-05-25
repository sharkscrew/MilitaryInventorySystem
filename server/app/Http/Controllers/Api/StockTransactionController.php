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
            $newBalance = $item->quantity;

            switch ($validated['type']) {
                case 'receive':
                case 'return':
                    $newBalance += $quantity;
                    break;
                case 'issue':
                    if ($quantity > $item->quantity) {
                        throw ValidationException::withMessages([
                            'quantity' => ['Insufficient stock for this issue.'],
                        ]);
                    }
                    $newBalance -= $quantity;
                    break;
                case 'adjustment':
                    $newBalance = $quantity;
                    break;
            }

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
}
