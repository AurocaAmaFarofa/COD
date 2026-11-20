import { useEffect, useState } from 'react'

// Tema claro ou escuro. A escolha fica no navegador do usuário (preferência local)
// e é aplicada em <html data-tema="...">, que o CSS usa para trocar as cores.
const CHAVE = 'rtc-tema'

function lerTema() {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro'
  } catch {
    return 'claro'
  }
}

export function useTema() {
  const [tema, setTema] = useState(lerTema)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      // Sem armazenamento disponível, o tema vale só nesta sessão.
    }
  }, [tema])

  return [tema, setTema]
}
