import { useState } from 'react'
import rtcLogo from '../assets/Images/RtcLogoKanban.png'

export default function LoginPage({ usuarios, loading, error, onEnter }) {
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [loginError, setLoginError] = useState('')
  const usuarioId = usuarios.some((usuario) => usuario.id === usuarioSelecionado)
    ? usuarioSelecionado
    : usuarios[0]?.id ?? ''

  async function submit(event) {
    event.preventDefault()
    setEntrando(true)
    setLoginError('')
    try {
      await onEnter(usuarioId)
    } catch (submitError) {
      setLoginError(submitError.message || 'Não foi possível entrar.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-rtc-navy px-4 py-10 text-rtc-cream">
      <div aria-hidden="true" className="ambient-orb ambient-orb--top pointer-events-none absolute -right-12 -top-20 z-0 size-96 rounded-full bg-sky-400/35 blur-3xl" />
      <div aria-hidden="true" className="ambient-orb ambient-orb--bottom pointer-events-none absolute -bottom-24 -left-16 z-0 size-96 rounded-full bg-rtc-blue/40 blur-3xl" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-rtc-steel/50 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <img src={rtcLogo} alt="RTC" className="mx-auto mb-6 h-16 w-48 object-contain" />
        <p className="text-center text-sm font-medium text-sky-200">Plataforma de operações</p>
        <h1 className="mt-2 text-center text-2xl font-semibold">Gestão de cargas RTC</h1>
        <p className="mt-2 text-center text-sm text-slate-300">Entre para acompanhar as operações logísticas.</p>
        <label htmlFor="login-user" className="mt-7 block text-sm font-medium text-slate-200">Perfil de demonstração</label>
        <select id="login-user" value={usuarioId} onChange={(event) => setUsuarioSelecionado(event.target.value)} disabled={loading || !usuarios.length} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-sky-300">
          {usuarios.map((usuario) => <option key={usuario.id} value={usuario.id} className="bg-slate-900">{usuario.nome} — {usuario.modulos.join(', ')}</option>)}
        </select>
        {(error || loginError) && <p role="alert" className="mt-3 text-sm text-rose-300">{loginError || error}</p>}
        <button type="submit" disabled={loading || entrando || !usuarioId} className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100 disabled:opacity-60">
          <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-sm font-bold text-rtc-blue">G</span>
          {entrando ? 'Entrando...' : 'Entrar com Google'}
        </button>
        <p className="mt-5 text-center text-xs text-slate-400">Modo de demonstração: selecione um perfil para testar permissões.</p>
      </form>
    </main>
  )
}
