import { useEffect, useState } from 'react'

// Número que sobe do zero até o valor final em ~0,9s (desliga se o usuário preferir menos movimento).
function useContador(alvo) {
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduzir || !Number.isFinite(alvo)) {
      const sem = requestAnimationFrame(() => setAtual(alvo))
      return () => cancelAnimationFrame(sem)
    }
    const inicio = performance.now()
    const duracao = 900
    let quadro
    const passo = (agora) => {
      const progresso = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - Math.pow(1 - progresso, 3)
      setAtual(alvo * suave)
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo])

  return atual
}

// Mini gráfico de linha com área, no rodapé do card.
function Sparkline({ serie, destaque }) {
  if (!serie || serie.length < 2) return null
  const maximo = Math.max(...serie, 1)
  const minimo = Math.min(...serie, 0)
  const faixa = Math.max(1, maximo - minimo)
  const pontos = serie.map((valor, indice) => {
    const x = (indice / (serie.length - 1)) * 100
    const y = 100 - ((valor - minimo) / faixa) * 80 - 10
    return `${x},${y}`
  })
  const linha = pontos.join(' ')
  const cor = destaque ? '#ffffff' : '#3f72af'

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-10 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${destaque ? 'd' : 'n'}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${linha} 100,100`} fill={`url(#spark-${destaque ? 'd' : 'n'})`} />
      <polyline points={linha} fill="none" stroke={cor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Card de indicador: número animado, mini gráfico opcional. O destaque usa gradiente azul.
export default function KpiCard({ titulo, valor, formatar = (n) => String(Math.round(n)), detalhe, icone, serie, destaque = false }) {
  const animado = useContador(valor)

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 ${
        destaque
          ? 'bg-gradient-to-br from-rtc-blue via-rtc-blue/80 to-rtc-navy text-white'
          : 'cartao text-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${destaque ? 'text-white/80' : 'text-rtc-mist/70'}`}>{titulo}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-2xl ${destaque ? 'bg-white/20' : 'bg-white/10 text-sky-200'}`}>
          {icone}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums sm:text-[2rem]">{formatar(animado)}</p>
      {detalhe && <p className={`mt-2 text-xs ${destaque ? 'text-white/75' : 'text-rtc-mist/65'}`}>{detalhe}</p>}
      <Sparkline serie={serie} destaque={destaque} />
      <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/[0.07] transition group-hover:scale-125" />
    </article>
  )
}
