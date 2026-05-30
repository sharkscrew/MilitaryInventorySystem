import type { FC } from "react"

interface RemoveButtonProps {
    label: string
    className?: string
    newClassname?: string
    onRemove: () => void
}

const RemoveButton: FC<RemoveButtonProps> = ({ label, className, newClassname, onRemove }) => {
    return (
        <>
            <button type="button" className={newClassname ? newClassname : `px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer rounded-lg shadow-lg ${className}`} onClick={onRemove}>{label}</button>
        </>
    )
}

export default RemoveButton