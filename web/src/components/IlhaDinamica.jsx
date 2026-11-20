import { useEffect, useState } from 'react'
import { useClima } from '../hooks/useClima.js'
import ClimaIcon from './ClimaIcon.jsx'

// Ilha do header: fechada mostra o horário; aberta mostra data, temperatura e clima.
// Ao abrir, a ilha faz um bounce (classe ilha-bounce só é aplicada ao abrir).
export default function IlhaDinamica() {
  const [agora, setAgora] = useState(() => new Date())
  const [aberta, setAberta] = useState(false)
  const { clima } = useClima()

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 15000)
    return () => clearInterval(intervalo)
  }, [])

  const horario = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <button
      type="button"
      onClick={() => setAberta((valor) => !valor)}
      aria-expanded={aberta}
      aria-label={aberta ? 'Recolher informações' : 'Mostrar data e clima'}
      className={`vidro flex items-center justify-center gap-3 overflow-hidden rounded-full text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors duration-300 hover:bg-white/10 ${
        aberta ? 'ilha-bounce h-12 px-5' : 'h-10 px-5'
      }`}
    >
      <span className="tabular-nums tracking-wide">{horario}</span>
      {aberta && (
        <>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          <span className="capitalize text-rtc-mist">{data}</span>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          {clima ? (
            <span className="flex items-center gap-2">
              <ClimaIcon categoria={clima.categoria} className="size-5 text-sky-200" />
              <span className="tabular-nums">{clima.temperatura}°C</span>
              {clima.cidade && <span className="text-xs font-medium text-rtc-mist/70">{clima.cidade}</span>}
            </span>
          ) : (
            <span className="text-xs font-medium text-rtc-mist/70">Clima indisponível</span>
          )}
        </>
      )}
    </button>
  )
}
