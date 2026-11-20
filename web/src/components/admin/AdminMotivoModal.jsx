import { useState } from 'react'
import ModalBase from '../ModalBase.jsx'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300'

// Pede o motivo antes de uma ação sensível. O motivo fica gravado na auditoria.
export default function AdminMotivoModal({ title, message, confirmLabel, onConfirm, onClose }) {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(event) {
    event.preventDefault()
    if (motivo.trim().length < 5) return setErro('Informe o motivo (mínimo 5 caracteres).')
    setSalvando(true)
    setErro('')
    try {
      await onConfirm(motivo.trim())
    } catch (error) {
      setErro(error.message || 'Não foi possível concluir a ação.')
      setSalvando(false)
    }
  }

  return (
    <ModalBase title={title} onClose={onClose}>
      <form onSubmit={enviar} className="space-y-4">
        <p className="text-sm text-rtc-mist">{message}</p>
        <label className="block text-sm text-rtc-mist">
          Motivo <span className="text-rose-300">*</span>
          <textarea
            required
            rows="3"
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            className={inputClass}
          />
        </label>
        {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-rtc-mist hover:bg-white/10">
            Voltar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-300 disabled:opacity-60"
          >
            {salvando ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
