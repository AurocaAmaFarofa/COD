import { useEffect, useState } from 'react'

// Preferências de desempenho do próprio navegador do usuário.
// Ficam em localStorage porque são uma conveniência local, não dados da operação.
// modoLeve vem ligado por padrão: fundo parado, sem desfoque de vidro e sem animações.
// Quem quiser o visual completo desliga o modo leve nas Configurações.
const CHAVE = 'rtc-configuracoes'
const PADRAO = { modoLeve: true, fundoEstatico: false, desligarAnimacoes: false }

function lerConfiguracoes() {
  try {
    return { ...PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}') }
  } catch {
    return PADRAO
  }
}

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState(lerConfiguracoes)

  useEffect(() => {
    const html = document.documentElement
    const { modoLeve, fundoEstatico, desligarAnimacoes } = configuracoes
    html.classList.toggle('modo-leve', modoLeve)
    html.classList.toggle('fundo-estatico', modoLeve || fundoEstatico)
    html.classList.toggle('sem-animacoes', modoLeve || desligarAnimacoes)
    try {
      localStorage.setItem(CHAVE, JSON.stringify(configuracoes))
    } catch {
      // Sem armazenamento disponível, a preferência vale só nesta sessão.
    }
  }, [configuracoes])

  return [configuracoes, setConfiguracoes]
}
