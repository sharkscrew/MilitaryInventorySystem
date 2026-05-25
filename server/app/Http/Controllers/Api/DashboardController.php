<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\StockTransaction;
use App\Models\WebhookDelivery;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $totalItems = InventoryItem::count();
        $lowStock = InventoryItem::whereIn('status', ['low_stock', 'out_of_stock'])->count();
        $totalQuantity = (int) InventoryItem::sum('quantity');
        $recentTransactions = StockTransaction::with('inventoryItem')
            ->latest()
            ->limit(5)
            ->get();

        $byCategory = Category::query()
            ->withCount('inventoryItems')
            ->withSum('inventoryItems as total_quantity', 'quantity')
            ->orderBy('name')
            ->get();

        $recentWebhookDeliveries = WebhookDelivery::query()
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'total_items' => $totalItems,
            'low_stock_items' => $lowStock,
            'total_quantity' => $totalQuantity,
            'recent_transactions' => $recentTransactions,
            'stock_by_category' => $byCategory,
            'recent_webhook_deliveries' => $recentWebhookDeliveries,
        ]);
    }
}
