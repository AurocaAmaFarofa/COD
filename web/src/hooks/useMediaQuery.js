import { useEffect, useState } from 'react'

// Retorna se a média consulta atual está valendo e acompanha quando o tamanho da tela muda.
export function useMediaQuery(consulta) {
  const [casa, setCasa] = useState(() => window.matchMedia(consulta).matches)

  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const atualizar = () => setCasa(mq.matches)
    atualizar()
    mq.addEventListener('change', atualizar)
    return () => mq.removeEventListener('change', atualizar)
  }, [consulta])

  return casa
}
