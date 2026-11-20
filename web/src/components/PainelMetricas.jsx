import { moeda } from '../utils/formatadores.js'
import { calcularMetricas } from '../utils/metricas.js'
import { MODULOS_ATIVOS } from '../config/modulos.js'
import KpiCard from './KpiCard.jsx'

const icones = {
  dia: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  acumulado: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
  ),
  projecao: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" strokeDasharray="3 3" /><path d="M14 7h7v7" /></svg>
  ),
  anterior: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
  ),
  cargas: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" /></svg>
  ),
  perdidas: (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
  ),
}

// Gráfico de barras do mês: uma barra por dia de embarque, com o dia atual destacado.
function GraficoPorDia({ porDia, diaAtual }) {
  const maximo = Math.max(1, ...porDia.map((item) => item.valor))
  return (
    <div className="flex h-44 items-end gap-1.5">
      {porDia.map((item) => {
        const altura = Math.max(3, (item.valor / maximo) * 100)
        const futuro = item.dia > diaAtual
        return (
          <div key={item.dia} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              title={`Dia ${item.dia}: ${moeda(item.valor)} em ${item.quantidade} carga(s)`}
              style={{ height: `${altura}%` }}
              className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                item.dia === diaAtual
                  ? 'bg-gradient-to-t from-rtc-blue to-sky-300'
                  : futuro
                    ? 'bg-white/15'
                    : 'bg-gradient-to-t from-rtc-blue/50 to-rtc-blue/90'
              }`}
            />
            {(item.dia === 1 || item.dia % 5 === 0) && (
              <span className="mt-2 text-center text-[10px] tabular-nums text-rtc-mist/60">{item.dia}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Bloco de indicadores usado no dashboard e no Painel TV.
export default function PainelMetricas({ cargas, cancelamentos, catalogos, compacto = false }) {
  const agora = new Date()
  const m = calcularMetricas(cargas, cancelamentos, agora)
  const nomeCliente = (id) => catalogos?.clientes?.find((item) => item.id === id)?.nome ?? 'Cliente'
  const contagemPorModulo = MODULOS_ATIVOS.map((modulo) => ({
    id: modulo.id,
    nome: modulo.nome,
    quantidade: cargas.filter((carga) => carga.modulo_atual === modulo.id).length,
  }))
  const totalEmAndamento = Math.max(1, cargas.length)

  return (
    <div className={compacto ? 'space-y-5' : 'space-y-6'}>
      <section className={`grid gap-4 sm:grid-cols-2 ${compacto ? 'xl:grid-cols-6' : 'xl:grid-cols-3 2xl:grid-cols-6'}`}>
        <KpiCard titulo="Dia" valor={moeda(m.dia)} detalhe="Projetado de todas as cargas com embarque hoje" icone={icones.dia} destaque />
        <KpiCard titulo="Acumulado no mês" valor={moeda(m.acumulado)} detalhe={`${m.cargasNoMes} carga(s) com embarque no mês`} icone={icones.acumulado} />
        <KpiCard titulo="Projeção do mês" valor={moeda(m.projecao)} detalhe="Ritmo atual aplicado ao mês inteiro" icone={icones.projecao} />
        <KpiCard titulo="Mês anterior" valor={moeda(m.mesAnterior)} detalhe="Total de fretes do mês passado" icone={icones.anterior} />
        <KpiCard titulo="Cargas no mês" valor={String(m.cargasNoMes)} detalhe="Cargas com embarque neste mês" icone={icones.cargas} />
        <KpiCard titulo="Perdidas no mês" valor={String(m.perdidasNoMes)} detalhe={`${moeda(m.valorPerdido)} em frete cancelado`} icone={icones.perdidas} />
      </section>

      <section className={`grid gap-4 ${compacto ? 'xl:grid-cols-3' : 'xl:grid-cols-3'}`}>
        <article className="vidro rounded-3xl p-5 xl:col-span-2">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">Embarques do mês</h2>
              <p className="mt-1 text-xs text-rtc-mist/65">Valor de frete por dia de embarque</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rtc-mist">
              {agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </header>
          <GraficoPorDia porDia={m.porDia} diaAtual={m.diaAtual} />
        </article>

        <article className="vidro rounded-3xl p-5">
          <h2 className="text-base font-bold text-white">Cargas por módulo</h2>
          <p className="mt-1 text-xs text-rtc-mist/65">Onde estão as cargas em andamento</p>
          <ul className="mt-5 space-y-4">
            {contagemPorModulo.map((item) => (
              <li key={item.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-white">{item.nome}</span>
                  <span className="tabular-nums text-rtc-mist">{item.quantidade}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-rtc-blue to-sky-300 transition-all duration-500" style={{ width: `${(item.quantidade / totalEmAndamento) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="vidro rounded-3xl p-5">
        <h2 className="text-base font-bold text-white">Próximos embarques</h2>
        {m.proximas.length === 0 ? (
          <p className="mt-4 text-sm text-rtc-mist/65">Nenhuma carga com embarque agendado.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {m.proximas.map((carga) => (
              <li key={carga.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{nomeCliente(carga.cliente_id)}</p>
                  <p className="truncate text-xs text-rtc-mist/65">{carga.rota || carga.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-sky-200">{moeda(carga.frete_empresa)}</p>
                  <p className="text-xs text-rtc-mist/65">{carga.dia_embarque.split('-').reverse().join('/')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  )
}
