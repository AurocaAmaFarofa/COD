import { MODULOS_ATIVOS } from '../config/modulos.js'

export default function Topbar({ usuario, usuarios, onUserChange, onRefresh, refreshing }) {
  const perfil = usuario.modulos.map((id) => MODULOS_ATIVOS.find((modulo) => modulo.id === id)?.nome ?? id).join(' · ')

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{usuario.nome}</p>
        <p className="truncate text-xs text-slate-400">{perfil}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="perfil-usuario">Trocar perfil de demonstração</label>
        <select
          id="perfil-usuario"
          value={usuario.id}
          onChange={(event) => onUserChange(event.target.value)}
          className="max-w-40 rounded-lg border border-white/15 bg-slate-950/50 px-2 py-2 text-xs text-white outline-none sm:max-w-52 sm:px-3 sm:text-sm"
        >
          {usuarios.map((item) => <option key={item.id} value={item.id} className="bg-slate-900">{item.nome}</option>)}
        </select>
        <button type="button" onClick={onRefresh} disabled={refreshing} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50 sm:text-sm">
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
    </header>
  )
}
