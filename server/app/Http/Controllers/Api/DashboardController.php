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
        $lowStockCount = InventoryItem::whereIn('status', ['low_stock', 'out_of_stock'])->count();
        $lowStockAlerts = InventoryItem::query()
            ->with('category')
            ->whereIn('status', ['low_stock', 'out_of_stock'])
            ->orderBy('quantity')
            ->get()
            ->map(fn (InventoryItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category?->name,
                'quantity' => $item->quantity,
            ]);
        $totalQuantity = (int) InventoryItem::sum('quantity');
        $recentTransactions = StockTransaction::with('inventoryItem')
            ->latest()
            ->limit(5)
            ->get();

        $byCategory = Category::query()
            ->withCount('inventoryItems')
            ->withSum('inventoryItems as total_quantity', 'quantity')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'quantity' => (int) ($category->total_quantity ?? 0),
                'itemCount' => $category->inventory_items_count,
            ]);

        $recentWebhookDeliveries = WebhookDelivery::query()
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'total_items' => $totalItems,
            'low_stock_count' => $lowStockCount,
            'low_stock_items' => $lowStockAlerts,
            'total_quantity' => $totalQuantity,
            'recent_transactions' => $recentTransactions,
            'stock_by_category' => $byCategory,
            'recent_webhook_deliveries' => $recentWebhookDeliveries,
        ]);
    }
}
