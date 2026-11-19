export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
        toast.type === 'error'
          ? 'border-rose-300/30 bg-rose-950/90 text-rose-100'
          : 'border-emerald-300/30 bg-emerald-950/90 text-emerald-100'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Fechar notificação" className="rounded px-2 py-1 hover:bg-white/10">
        ×
      </button>
    </div>
  )
}
