import type { FC } from 'react'
import CloseButton from '../../../components/Button/CloseButton'
import ModalCloseButton from '../../../components/Button/modalCloseButton'
import RemoveButton from '../../../components/Button/RemoveButton'
import type { InventoryItem } from '../../../types'

interface DeleteItemModalProps {
    item: InventoryItem
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}

const DeleteItemModal: FC<DeleteItemModalProps> = ({ item, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
        <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-sm space-y-4">
            <ModalCloseButton onClose={onCancel} />
            <div>
                <h3 className="text-white font-medium text-base">Delete item?</h3>
                <p className="text-white/40 text-sm mt-1">
                    This will permanently remove{' '}
                    <span className="text-white/70 font-medium">{item.name}</span>{' '}
                    (<span className="font-mono text-white/50">{item.item_code}</span>) and its stock
                    transaction history. This cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 pt-1">
                <CloseButton
                    label="Cancel"
                    onClose={onCancel}
                    newClassName="flex-1 bg-white/5 border border-white/10 text-white/70 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
                />
                <RemoveButton
                    label={loading ? 'Deleting…' : 'Delete'}
                    onRemove={onConfirm}
                    newClassname="flex-1 bg-red-500/80 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50"
                />
            </div>
        </div>
    </div>
)

export default DeleteItemModal
