import { useEffect, useState } from 'react'
import FractalGlass from './FractalGlass.jsx'
import { FUNDO_IMAGEM_URL } from '../config/fundo.js'

// Lê a preferência "fundo estático" das configurações e acompanha quando ela muda.
function useFundoAnimado() {
  const [animado, setAnimado] = useState(() => !document.documentElement.classList.contains('fundo-estatico'))

  useEffect(() => {
    const observador = new MutationObserver(() => {
      setAnimado(!document.documentElement.classList.contains('fundo-estatico'))
    })
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])

  return animado
}

// Camadas: imagem de fundo (estática) → parede fractal por cima, transparente onde não há vidro.
export default function FundoAmbiente() {
  const animado = useFundoAnimado()
  return (
    <div aria-hidden="true" className="fundo-app">
      {FUNDO_IMAGEM_URL && (
        <div className="fundo-foto" style={{ backgroundImage: `url("${FUNDO_IMAGEM_URL}")` }} />
      )}
      <FractalGlass animado={animado} />
    </div>
  )
}
