import { formatarData } from '../utils/formatadores.js'

// Cartão da carga. Pode ser arrastado só quando o usuário tem acesso ao módulo em que ela está.
export default function CargaCard({ carga, cliente, podeArrastar, arrastando, onDragStart, onDragEnd, onClick }) {
  return (
    <button
      type="button"
      draggable={podeArrastar}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      title={podeArrastar ? 'Arraste para outro módulo' : 'Carga fora do seu módulo: somente leitura'}
      className={`group w-full rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-left shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-rtc-blue/60 hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
        arrastando ? 'scale-[0.98] opacity-40' : ''
      } ${podeArrastar ? '' : 'opacity-60'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-rtc-blue/25 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-200">{carga.id.toUpperCase()}</span>
        {podeArrastar && (
          <span aria-hidden="true" className="grid grid-cols-2 gap-0.5 opacity-40 transition group-hover:opacity-100">
            {Array.from({ length: 6 }, (_, indice) => (
              <span key={indice} className="size-1 rounded-full bg-white" />
            ))}
          </span>
        )}
      </div>
      <h3 className="mt-3 truncate text-sm font-bold text-white">{cliente?.nome ?? 'Cliente não encontrado'}</h3>
      <p className="mt-1 truncate text-xs text-rtc-mist/75">{carga.rota || `${carga.origem} → ${carga.destino}`}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-rtc-mist/70">
        <span className="truncate">{carga.tipo_carga} · {carga.peso_toneladas ? `${carga.peso_toneladas} t` : 'sem peso'}</span>
        <span className="shrink-0">{formatarData(carga.criada_em)}</span>
      </div>
    </button>
  )
}
