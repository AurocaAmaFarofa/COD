import { formatarData } from '../utils/formatadores.js'

export default function CargaCard({ carga, cliente, onClick }) {
  const cancelada = carga.status === 'cancelada'
  const statusLabel = cancelada ? 'Cancelada' : 'Em andamento'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/10 bg-slate-950/45 p-4 text-left shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-sky-300">{carga.id.toUpperCase()}</span>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${cancelada ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-400/15 text-emerald-200'}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-white">{cliente?.nome ?? 'Cliente não encontrado'}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">{carga.rota || `${carga.origem} → ${carga.destino}`}</p>
      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-xs text-slate-400">
        <p className="truncate"><span className="text-slate-300">Carga:</span> {carga.tipo_carga} · {carga.peso_toneladas ? `${carga.peso_toneladas} t` : 'Peso não informado'}</p>
        <p><span className="text-slate-300">Criada em:</span> {formatarData(carga.criada_em)}</p>
      </div>
    </button>
  )
}
