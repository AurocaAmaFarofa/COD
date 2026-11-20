import { useState } from 'react'

function Avatar({ usuario }) {
  const [fotoFalhou, setFotoFalhou] = useState(false)
  if (usuario.foto_url && !fotoFalhou) {
    return (
      <img
        src={usuario.foto_url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFotoFalhou(true)}
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-white/20"
      />
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rtc-blue text-xs font-semibold text-white ring-1 ring-white/20">
      {usuario.avatar}
    </span>
  )
}

export default function Topbar({ usuario, onLogout, onRefresh, refreshing }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 lg:px-8">
      <button type="button" onClick={onRefresh} disabled={refreshing} className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">
        {refreshing ? 'Atualizando...' : 'Atualizar'}
      </button>
      <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2">
        <Avatar usuario={usuario} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{usuario.nome}</p>
          <p className="truncate text-xs text-slate-400">{usuario.email}</p>
        </div>
        <button type="button" onClick={onLogout} className="ml-1 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
          Sair
        </button>
      </div>
    </header>
  )
}
