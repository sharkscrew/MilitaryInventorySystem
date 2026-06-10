import type { InventoryItemPayload } from '../interfaces/InventoryInterface'
import type { Category, InventoryItem, Paginated } from '../types'
import AxiosInstance from './AxiosInstance'

const InventoryService = {
    list: (status?: string) => {
        const query = status ? `?status=${status}` : ''
        return AxiosInstance.get<Paginated<InventoryItem>>(`/inventory-items${query}`)
    },

    getCategories: () => AxiosInstance.get<Category[]>('/categories'),

    create: (data: InventoryItemPayload) =>
        AxiosInstance.post<InventoryItem>('/inventory-items', data),

    update: (id: number, data: Partial<InventoryItemPayload>) =>
        AxiosInstance.put<InventoryItem>(`/inventory-items/${id}`, data),

    delete: (id: number) =>
        AxiosInstance.delete(`/inventory-items/${id}`),
}

export default InventoryService
