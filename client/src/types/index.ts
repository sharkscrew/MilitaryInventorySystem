export interface Category {
    id: number;
    name: string;
    description: string | null;
    inventory_items_count?: number;
}

export interface InventoryItem {
    id: number;
    category_id: number;
    item_code: string;
    name: string;
    quantity: number;
    reorder_level: number;
    status: string;
    location: string | null;
    unit: string;
    category?: Category;
}

export interface StockTransaction {
    id: number;
    inventory_item_id?: number;
    type: string;
    quantity: number;
    personnel_name: string;
    balance_after: number;
    created_at: string;
    inventory_item?: InventoryItem;
}

export interface WebhookSubscription {
    id: number;
    name: string;
    target_url: string;
    secret: string;
    events: string[];
    is_active: boolean;
}

export interface WebhookDelivery {
    id: number;
    event: string;
    direction: string;
    success: boolean;
    created_at: string;
    payload: Record<string, unknown>;
}

export interface DashboardSummary {
    total_items: number;
    low_stock_items: number;
    total_quantity: number;
    recent_transactions: StockTransaction[];
    stock_by_category: Array<Category & { total_quantity: number }>;
    recent_webhook_deliveries: WebhookDelivery[];
}

export interface Paginated<T> {
    data: T[];
}