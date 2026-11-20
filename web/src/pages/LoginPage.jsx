import { useState } from 'react'
import AuthLayout, { BotaoPrincipal, CampoAuth, Divisor, LinkAuth } from '../components/AuthLayout.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import { entrarComGoogle, entrarComSenha } from '../services/authService.js'

export default function LoginPage({ onLogin, onIrParaCadastro, erroInicial = '' }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(erroInicial)

  async function executar(acao) {
    setEnviando(true)
    setErro('')
    try {
      onLogin(await acao())
    } catch (error) {
      setErro(error.message || 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    executar(() => entrarComSenha(email, senha))
  }

  const comGoogle = (credential) => executar(() => entrarComGoogle(credential))

  return (
    <AuthLayout
      titulo="Gestão de cargas RTC"
      subtitulo="Entre para acompanhar as operações logísticas."
      rodape={<>Ainda não tem conta? <LinkAuth onClick={onIrParaCadastro}>Criar conta</LinkAuth></>}
    >
      <div className="mt-7">
        <GoogleButton onCredential={comGoogle} texto="signin_with" disabled={enviando} />
      </div>
      <Divisor />
      <form onSubmit={submit} className="space-y-4">
        <CampoAuth id="login-email" label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={enviando} />
        <CampoAuth id="login-senha" label="Senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} disabled={enviando} />
        {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}
        <BotaoPrincipal disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</BotaoPrincipal>
      </form>
    </AuthLayout>
  )
}
