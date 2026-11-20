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

// Área do acumulado no mês: parte sólida até hoje e linha tracejada até a projeção do fim do mês.
function GraficoAcumulado({ serieAcumulada, projecao, acumulado, diasNoMes, diaAtual }) {
  const largura = 600
  const altura = 200
  const maximo = Math.max(projecao, acumulado, 1)
  const xDe = (dia) => ((dia - 1) / Math.max(1, diasNoMes - 1)) * largura
  const yDe = (valor) => altura - 16 - (valor / maximo) * (altura - 32)

  const pontos = serieAcumulada.map((valor, indice) => [xDe(indice + 1), yDe(valor)])
  const linha = pontos.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaFechada = pontos.length ? `${linha} ${xDe(diaAtual).toFixed(1)},${altura} 0,${altura}` : ''
  const fimX = xDe(diasNoMes)
  const fimY = yDe(projecao)
  const inicioX = xDe(diaAtual)
  const inicioY = yDe(acumulado)

  return (
    <div>
      <svg viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none" className="h-44 w-full" role="img" aria-label="Acumulado no mês com projeção até o fim do mês">
        <defs>
          <linearGradient id="grad-acumulado" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3f72af" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3f72af" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((faixa) => (
          <line key={faixa} x1="0" x2={largura} y1={altura * faixa} y2={altura * faixa} stroke="currentColor" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
        ))}
        {areaFechada && <polygon points={areaFechada} fill="url(#grad-acumulado)" />}
        {linha && <polyline points={linha} fill="none" stroke="#3f72af" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />}
        {diaAtual < diasNoMes && (
          <line x1={inicioX} y1={inicioY} x2={fimX} y2={fimY} stroke="#9cc4ee" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-rtc-mist/60">
        <span>1</span>
        <span>{Math.round(diasNoMes / 2)}</span>
        <span>{diasNoMes}</span>
      </div>
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

  // Séries para os mini gráficos: valores dos últimos dias e somas acumuladas até hoje.
  const ateHoje = m.porDia.slice(0, m.diaAtual)
  const serieAcumulada = ateHoje.reduce((lista, item) => [...lista, (lista.at(-1) ?? 0) + item.valor], [])
  const serieCargas = ateHoje.reduce((lista, item) => [...lista, (lista.at(-1) ?? 0) + item.quantidade], [])
  const serieDia = ateHoje.slice(-7).map((item) => item.valor)

  return (
    <div className={compacto ? 'space-y-5' : 'space-y-6'}>
      <section className={`grid gap-4 sm:grid-cols-2 ${compacto ? 'xl:grid-cols-6' : 'xl:grid-cols-3 2xl:grid-cols-6'}`}>
        <KpiCard titulo="Dia" valor={m.dia} formatar={moeda} detalhe="Projetado de todas as cargas com embarque hoje" icone={icones.dia} serie={serieDia} destaque />
        <KpiCard titulo="Acumulado no mês" valor={m.acumulado} formatar={moeda} detalhe={`${m.cargasNoMes} carga(s) com embarque no mês`} icone={icones.acumulado} serie={serieAcumulada} />
        <KpiCard titulo="Projeção do mês" valor={m.projecao} formatar={moeda} detalhe="Ritmo atual aplicado ao mês inteiro" icone={icones.projecao} serie={[m.acumulado, m.projecao]} />
        <KpiCard titulo="Mês anterior" valor={m.mesAnterior} formatar={moeda} detalhe="Total de fretes do mês passado" icone={icones.anterior} />
        <KpiCard titulo="Cargas no mês" valor={m.cargasNoMes} detalhe="Cargas com embarque neste mês" icone={icones.cargas} serie={serieCargas} />
        <KpiCard titulo="Perdidas no mês" valor={m.perdidasNoMes} detalhe={`${moeda(m.valorPerdido)} em frete cancelado`} icone={icones.perdidas} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="cartao rounded-3xl p-5 xl:col-span-2">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">Acumulado do mês</h2>
              <p className="mt-1 text-xs text-rtc-mist/65">Fretes somados dia a dia, com a projeção até o fim do mês</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rtc-mist">
              {agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </header>
          <GraficoAcumulado
            serieAcumulada={serieAcumulada}
            projecao={m.projecao}
            acumulado={m.acumulado}
            diasNoMes={m.diasNoMes}
            diaAtual={m.diaAtual}
          />
        </article>

        <article className="cartao rounded-3xl p-5">
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

      <article className="cartao rounded-3xl p-5">
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
