import { useEffect } from 'react'
import FundoAmbiente from '../components/FundoAmbiente.jsx'
import PainelMetricas from '../components/PainelMetricas.jsx'

// Atualiza a cada 30 segundos, para a tela externa refletir novas cargas (RNF01).
const INTERVALO_ATUALIZACAO_MS = 30000

export default function PainelTV({ cargas, cancelamentos, catalogos, onRefresh, loading }) {
  useEffect(() => {
    const intervalo = setInterval(onRefresh, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
  }, [onRefresh])

  return (
    <main className="relative isolate min-h-screen overflow-hidden p-4 text-white sm:p-6 lg:p-8">
      <FundoAmbiente />
      <div className="vidro relative z-10 mx-auto min-h-[calc(100vh-4rem)] max-w-[1800px] rounded-[28px] p-5 shadow-2xl shadow-black/30 sm:p-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-200">RTC · Operações</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Painel de cargas</h1>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-rtc-mist">
            {loading ? 'Atualizando...' : 'Atualização automática a cada 30 s'}
          </span>
        </header>
        <PainelMetricas cargas={cargas} cancelamentos={cancelamentos} catalogos={catalogos} compacto />
      </div>
    </main>
  )
}
