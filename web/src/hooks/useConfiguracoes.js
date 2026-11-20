import { useEffect, useState } from 'react'

// Preferências de desempenho do próprio navegador do usuário.
// Ficam em localStorage porque são uma conveniência local, não dados da operação.
const CHAVE = 'rtc-configuracoes'
const PADRAO = { desligarDesfoque: false, fundoEstatico: false, desligarAnimacoes: false }

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
    html.classList.toggle('efeitos-reduzidos', configuracoes.desligarDesfoque)
    html.classList.toggle('fundo-estatico', configuracoes.fundoEstatico)
    html.classList.toggle('sem-animacoes', configuracoes.desligarAnimacoes)
    try {
      localStorage.setItem(CHAVE, JSON.stringify(configuracoes))
    } catch {
      // Sem armazenamento disponível, a preferência vale só nesta sessão.
    }
  }, [configuracoes])

  return [configuracoes, setConfiguracoes]
}
