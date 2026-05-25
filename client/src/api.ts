const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

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

export interface DashboardSummary {
  total_items: number;
  low_stock_items: number;
  total_quantity: number;
  recent_transactions: StockTransaction[];
  stock_by_category: Array<Category & { total_quantity: number }>;
  recent_webhook_deliveries: WebhookDelivery[];
}

export interface StockTransaction {
  id: number;
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

export interface Paginated<T> {
  data: T[];
}
