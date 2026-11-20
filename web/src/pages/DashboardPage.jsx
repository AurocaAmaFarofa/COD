import PainelMetricas from '../components/PainelMetricas.jsx'

// Abre o Painel TV em uma nova guia, para espelhar na tela externa.
function abrirEspelhamento() {
  window.open(`${window.location.origin}/tv`, '_blank', 'noopener')
}

export default function DashboardPage({ cargas, cancelamentos, catalogos }) {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-300">Visão geral</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-rtc-mist/75">Fretes, embarques e cargas perdidas do mês.</p>
        </div>
        <button
          type="button"
          onClick={abrirEspelhamento}
          className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
        >
          Espelhamento
        </button>
      </header>

      <PainelMetricas cargas={cargas} cancelamentos={cancelamentos} catalogos={catalogos} />
    </section>
  )
}
