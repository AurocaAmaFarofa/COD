import { useEffect, useRef, useState } from 'react'
import { getAuthConfig } from '../services/authService.js'

const GIS_URL = 'https://accounts.google.com/gsi/client'

let scriptPromise
function carregarGoogle() {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)
    const script = document.createElement('script')
    script.src = GIS_URL
    script.async = true
    script.onload = () => resolve(window.google)
    script.onerror = () => {
      scriptPromise = undefined
      reject(new Error('Não foi possível carregar o login do Google.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

// O Google só permite um callback ativo; guardamos o do botão montado no momento.
let callbackAtual = () => {}
let clientIdInicializado = null

/**
 * Botão oficial "Entrar com Google" (Google Identity Services).
 * onCredential recebe o ID token, que deve ser enviado ao back-end para validação.
 */
export default function GoogleButton({ onCredential, texto = 'signin_with', disabled = false }) {
  const containerRef = useRef(null)
  const [estado, setEstado] = useState('carregando') // carregando | pronto | indisponivel
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    callbackAtual = (resposta) => onCredential(resposta.credential)
  }, [onCredential])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const { googleClientId } = await getAuthConfig()
        if (!googleClientId) throw new Error('Login com Google ainda não configurado.')
        const google = await carregarGoogle()
        if (cancelado || !containerRef.current) return
        if (clientIdInicializado !== googleClientId) {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (resposta) => callbackAtual(resposta),
            ux_mode: 'popup',
          })
          clientIdInicializado = googleClientId
        }
        google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: texto,
          locale: 'pt-BR',
          width: Math.min(containerRef.current.offsetWidth || 360, 400),
        })
        setEstado('pronto')
      } catch (error) {
        if (cancelado) return
        setEstado('indisponivel')
        setMensagem(error.message)
      }
    })()
    return () => {
      cancelado = true
    }
  }, [texto])

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div ref={containerRef} className={`flex min-h-11 w-full justify-center ${estado === 'pronto' ? '' : 'hidden'}`} />
      {estado === 'carregando' && (
        <div className="h-11 w-full animate-pulse rounded-full bg-white/10" aria-label="Carregando login do Google" />
      )}
      {estado === 'indisponivel' && (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs text-slate-400">{mensagem}</p>
      )}
    </div>
  )
}
