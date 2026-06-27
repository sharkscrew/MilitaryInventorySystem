import type { FC, FormEvent } from 'react'
import SubmitButton from '../../../components/Button/SubmitButton'
import ModalCloseButton from '../../../components/Button/modalCloseButton'
import type { InventoryItemPayload } from '../../../interfaces/InventoryInterface'
import type { Category, InventoryItem } from '../../../types'

const Input = ({ name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) => (
    <input
        name={name}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
        {...props}
    />
)

const Select = ({ name, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { name: string }) => (
    <select
        name={name}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 [&>option]:bg-neutral-900"
        {...props}
    >
        {children}
    </select>
)

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="flex flex-col gap-1.5">
        <span className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</span>
        {children}
    </label>
)

interface EditItemModalProps {
    item: InventoryItem
    categories: Category[]
    onSave: (id: number, data: InventoryItemPayload) => void
    onCancel: () => void
    loading: boolean
}

const EditItemModal: FC<EditItemModalProps> = ({ item, categories, onSave, onCancel, loading }) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        onSave(item.id, {
            category_id: Number(form.get('category_id')),
            item_code: form.get('item_code') as string,
            name: form.get('name') as string,
            quantity: Number(form.get('quantity')),
            reorder_level: Number(form.get('reorder_level')),
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
            <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto">
                <ModalCloseButton onClose={onCancel} />
                <div>
                    <h3 className="text-white font-medium text-base">Edit item</h3>
                    <p className="text-white/30 text-xs mt-0.5">Update details for {item.item_code}.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Label label="Category">
                            <Select name="category_id" required defaultValue={item.category_id}>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                        </Label>
                        <Label label="Item code">
                            <Input name="item_code" required defaultValue={item.item_code} />
                        </Label>
                    </div>
                    <Label label="Name">
                        <Input name="name" required defaultValue={item.name} />
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Label label="Quantity">
                            <Input name="quantity" type="number" min="0" required defaultValue={item.quantity} />
                        </Label>
                        <Label label="Reorder level">
                            <Input name="reorder_level" type="number" min="0" required defaultValue={item.reorder_level} />
                        </Label>
                    </div>
                    <div className="pt-1">
                        <SubmitButton
                            label="Save changes"
                            loading={loading}
                            loadingLabel="Saving…"
                            newClassName="bg-white text-black text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditItemModal
