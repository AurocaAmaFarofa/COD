import { MODULOS_ATIVOS } from '../config/modulos.js'
import CargaCard from '../components/CargaCard.jsx'
import { usuarioPodeEditarModulo } from '../utils/regras.js'

export default function KanbanPage({ cargas, catalogos, usuario, loading, error, onCreate, onOpen }) {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sky-300">Operação logística</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Kanban de cargas</h1>
          <p className="mt-2 text-sm text-slate-300">Acompanhe suas cargas no módulo Comercial.</p>
        </div>
        {usuarioPodeEditarModulo(usuario, 'comercial') && (
          <button type="button" onClick={onCreate} className="rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-200">
            + Nova carga
          </button>
        )}
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-300/20 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {loading && <p className="text-sm text-slate-300">Atualizando cargas...</p>}

      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 2xl:grid-cols-5">
        {MODULOS_ATIVOS.map((modulo) => {
          const cargasDaColuna = cargas.filter((carga) => carga.modulo_atual === modulo.id)
          return (
            <section key={modulo.id} className="min-w-[265px] rounded-2xl border border-white/10 bg-slate-950/20 p-3">
              <header className="mb-3 flex items-center justify-between gap-2 px-1">
                <h2 className="text-sm font-semibold text-white">{modulo.nome}</h2>
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-xs font-semibold text-slate-200">{cargasDaColuna.length}</span>
              </header>
              <div className="space-y-3">
                {cargasDaColuna.map((carga) => (
                  <CargaCard
                    key={carga.id}
                    carga={carga}
                    cliente={catalogos.clientes.find((item) => item.id === carga.cliente_id)}
                    onClick={() => onOpen(carga.id)}
                  />
                ))}
                {!cargasDaColuna.length && <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500">Nenhuma carga neste módulo</p>}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
