import { useState } from 'react'

export default function ConfirmDialog({
  title,
  message,
  reasonLabel,
  confirmLabel = 'Confirmar',
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onConfirm(reason)
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível concluir a ação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 text-white shadow-2xl">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
        {reasonLabel && (
          <label className="mt-5 block text-sm text-slate-200">
            {reasonLabel} <span className="text-slate-400">(opcional)</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows="3"
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-sky-300"
            />
          </label>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
            Voltar
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-rtc-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
