import { useState } from 'react'
import IlhaDinamica from './IlhaDinamica.jsx'
import BotaoTema from './BotaoTema.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

function Avatar({ usuario }) {
  const [fotoFalhou, setFotoFalhou] = useState(false)
  if (usuario.foto_url && !fotoFalhou) {
    return (
      <img
        src={usuario.foto_url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFotoFalhou(true)}
        className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white/20"
      />
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rtc-blue to-rtc-navy text-xs font-bold text-white ring-2 ring-white/20">
      {usuario.avatar}
    </span>
  )
}

// Header transparente: engrenagem à esquerda, perfil à direita e, só em telas grandes, a ilha no centro.
export default function Topbar({ usuario, onLogout, onRefresh, refreshing, onAbrirConfiguracoes }) {
  const telaGrande = useMediaQuery('(min-width: 1024px)')

  return (
    <header className={`items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 ${telaGrande ? 'grid grid-cols-[1fr_auto_1fr]' : 'flex'}`}>
      <div className="flex items-center gap-2">
        <BotaoTema />
        <button
          type="button"
          onClick={onAbrirConfiguracoes}
          aria-label="Configurações"
          title="Configurações"
          className="grid size-10 place-items-center rounded-full bg-white/10 text-rtc-mist transition hover:bg-white/20 hover:text-white"
        >
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      </div>

      {telaGrande && <IlhaDinamica />}

      <div className="flex min-w-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Atualizar dados"
          title="Atualizar"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-rtc-mist transition hover:bg-white/20 hover:text-white disabled:opacity-50"
        >
          <svg aria-hidden="true" className={`size-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
          </svg>
        </button>
        <div className="vidro flex min-w-0 items-center gap-3 rounded-full py-1 pl-1 pr-1.5">
          <Avatar usuario={usuario} />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-white">{usuario.nome}</p>
            <p className="truncate text-xs text-rtc-mist/70">{usuario.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-rtc-mist transition hover:bg-white/20 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
