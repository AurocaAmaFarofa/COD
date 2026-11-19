import { MODULOS_ATIVOS } from '../config/modulos.js'

export default function DashboardTV({ cargas, catalogos, onRefresh, onExit, loading }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-rtc-navy p-5 text-white sm:p-8 lg:p-10">
      <div aria-hidden="true" className="ambient-orb ambient-orb--top pointer-events-none absolute -right-12 -top-20 z-0 size-96 rounded-full bg-sky-400/35 blur-3xl" />
      <div aria-hidden="true" className="ambient-orb ambient-orb--bottom pointer-events-none absolute -bottom-24 -left-16 z-0 size-96 rounded-full bg-rtc-blue/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1800px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">RTC · Operações</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Painel de cargas</h1>
            <p className="mt-2 text-slate-300">Visão geral da operação.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onRefresh} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15">{loading ? 'Atualizando...' : 'Atualizar'}</button>
            <button type="button" onClick={onExit} className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Sair do painel</button>
          </div>
        </header>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {MODULOS_ATIVOS.map((modulo) => {
            const cargasModulo = cargas.filter((carga) => carga.modulo_atual === modulo.id)
            return (
              <article key={modulo.id} className="rounded-2xl border border-white/15 bg-rtc-steel/50 p-5 shadow-xl backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-300">{modulo.nome}</p>
                <p className="mt-3 text-5xl font-semibold">{cargasModulo.length}</p>
                <p className="mt-2 text-xs text-slate-400">cargas em andamento</p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {cargasModulo.slice(0, 3).map((carga) => (
                    <p key={carga.id} className="truncate text-sm text-slate-200">
                      {catalogos.clientes.find((item) => item.id === carga.cliente_id)?.nome ?? carga.id}
                    </p>
                  ))}
                  {cargasModulo.length > 3 && <p className="text-xs text-sky-200">+{cargasModulo.length - 3} cargas</p>}
                </div>
              </article>
            )
          })}
        </section>
        <footer className="mt-8 text-right text-xs text-slate-400">Cargas canceladas não são exibidas.</footer>
      </div>
    </main>
  )
}
