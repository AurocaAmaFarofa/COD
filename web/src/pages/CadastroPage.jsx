import { useState } from 'react'
import AuthLayout, { BotaoPrincipal, CampoAuth, Divisor, LinkAuth } from '../components/AuthLayout.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import { cadastrarComSenha, entrarComGoogle } from '../services/authService.js'
import { REGRAS_SENHA, senhaForte } from '../utils/senha.js'

export default function CadastroPage({ onLogin, onIrParaLogin }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmacao: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const alterar = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }))

  async function executar(acao) {
    setEnviando(true)
    setErro('')
    try {
      onLogin(await acao())
    } catch (error) {
      setErro(error.message || 'Não foi possível concluir o cadastro.')
    } finally {
      setEnviando(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    if (!senhaForte(form.senha)) return setErro('A senha ainda não atende a todos os requisitos.')
    if (form.senha !== form.confirmacao) return setErro('As senhas não conferem.')
    executar(() => cadastrarComSenha(form))
  }

  const comGoogle = (credential) => executar(() => entrarComGoogle(credential))

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Somente e-mails autorizados pela RTC podem se cadastrar."
      rodape={<>Já tem conta? <LinkAuth onClick={onIrParaLogin}>Entrar</LinkAuth></>}
    >
      <div className="mt-7">
        <GoogleButton onCredential={comGoogle} texto="signup_with" disabled={enviando} />
      </div>
      <Divisor />
      <form onSubmit={submit} className="space-y-4">
        <CampoAuth id="cad-nome" label="Nome" autoComplete="name" required maxLength={120} value={form.nome} onChange={alterar('nome')} disabled={enviando} />
        <CampoAuth id="cad-email" label="E-mail" type="email" autoComplete="email" required value={form.email} onChange={alterar('email')} disabled={enviando} />
        <div>
          <CampoAuth id="cad-senha" label="Senha" type="password" autoComplete="new-password" required maxLength={72} aria-describedby="cad-senha-regras" value={form.senha} onChange={alterar('senha')} disabled={enviando} />
          <ul id="cad-senha-regras" className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 text-xs sm:grid-cols-2">
            {REGRAS_SENHA.map((regra) => {
              const ok = regra.ok(form.senha)
              return (
                <li key={regra.id} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-300' : 'text-slate-400'}`}>
                  <span aria-hidden="true">{ok ? '✓' : '•'}</span>
                  {regra.texto}
                  <span className="sr-only">{ok ? '(atendido)' : '(pendente)'}</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <CampoAuth id="cad-confirmacao" label="Confirmar senha" type="password" autoComplete="new-password" required value={form.confirmacao} onChange={alterar('confirmacao')} disabled={enviando} />
          {form.confirmacao && form.confirmacao !== form.senha && (
            <p className="mt-1.5 text-xs text-rose-300">As senhas não conferem.</p>
          )}
        </div>
        {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}
        <BotaoPrincipal disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</BotaoPrincipal>
      </form>
    </AuthLayout>
  )
}
