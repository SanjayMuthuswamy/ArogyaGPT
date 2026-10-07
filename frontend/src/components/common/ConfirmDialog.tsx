interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E3F1EB]">
        <h3 className="font-display text-lg font-semibold text-[#18322D] mb-4">{title}</h3>
        <p className="font-body text-sm text-[#4A5E59] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[#DCEBE6] px-4 py-2 text-sm font-medium text-[#4A5E59]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[#C23B3B] px-4 py-2 text-sm font-medium text-white shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
