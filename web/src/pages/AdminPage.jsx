import { useEffect, useState } from 'react'
import { adminApi, formatarDataHora, rotuloEvento } from '../services/adminService.js'
import AdminUsuarios from '../components/admin/AdminUsuarios.jsx'
import AdminAllowlist from '../components/admin/AdminAllowlist.jsx'
import AdminLogs from '../components/admin/AdminLogs.jsx'
import AdminDados from '../components/admin/AdminDados.jsx'

const ABAS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'usuarios', label: 'Usuários' },
  { id: 'allowlist', label: 'Allowlist' },
  { id: 'logs', label: 'Logs' },
  { id: 'dados', label: 'Dados' },
]

function Indicador({ titulo, valor, detalhe, alerta = false }) {
  return (
    <div className="cartao rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wide text-rtc-mist/70">{titulo}</p>
      <p className={`mt-2 text-3xl font-semibold ${alerta && valor > 0 ? 'text-rose-300' : 'text-white'}`}>{valor ?? '—'}</p>
      {detalhe && <p className="mt-1 text-xs text-rtc-mist/70">{detalhe}</p>}
    </div>
  )
}

function VisaoGeral({ onIrParaLogs }) {
  const [resumo, setResumo] = useState(null)
  const [recentes, setRecentes] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([adminApi.resumo(), adminApi.auditoria({ limite: 8 })])
      .then(([dadosResumo, dadosLogs]) => {
        setResumo(dadosResumo)
        setRecentes(dadosLogs.itens)
      })
      .catch((error) => setErro(error.message))
  }, [])

  if (erro) return <p role="alert" className="text-sm text-rose-300">{erro}</p>

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador titulo="Usuários" valor={resumo?.usuariosTotal} detalhe={`${resumo?.usuariosAtivos ?? 0} ativos`} />
        <Indicador titulo="Administradores" valor={resumo?.administradores} detalhe="contas com acesso a esta página" />
        <Indicador titulo="Allowlist" valor={resumo?.allowlist} detalhe="e-mails autorizados a entrar" />
        <Indicador titulo="Eventos (24h)" valor={resumo?.eventos24h} detalhe="tudo o que foi registrado" />
        <Indicador titulo="Alertas (24h)" valor={resumo?.alertas24h} detalhe="logins negados e bloqueios" alerta />
      </div>

      <div className="cartao rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Atividade recente</h2>
          <button type="button" onClick={onIrParaLogs} className="text-xs font-semibold text-sky-300 hover:text-sky-200">
            Ver todos os logs
          </button>
        </div>
        <ul className="divide-y divide-white/10">
          {recentes.length === 0 && <li className="py-3 text-sm text-rtc-mist">Nenhum evento ainda.</li>}
          {recentes.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="text-white">
                {rotuloEvento(item.evento)}
                <span className="text-rtc-mist"> · {item.usuario_nome || item.email || 'sistema'}</span>
              </span>
              <span className="text-xs text-rtc-mist/70">{formatarDataHora(item.criado_em)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// Página de administração. Só aparece no menu para quem é admin, e o servidor confere de novo
// em cada chamada (/api/admin/*).
export default function AdminPage({ usuario, notify }) {
  const [aba, setAba] = useState('visao')
  const [catalogo, setCatalogo] = useState([])
  const [erroCatalogo, setErroCatalogo] = useState('')

  useEffect(() => {
    adminApi
      .modulos()
      .then(({ itens }) => setCatalogo(itens))
      .catch((error) => setErroCatalogo(error.message))
  }, [])

  return (
    <section className="space-y-6">
      <header className="cartao flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rtc-blue to-rtc-navy text-white shadow-lg shadow-rtc-blue/30">
            <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <span className="inline-flex rounded-full bg-rose-400/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-500">Área restrita</span>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Administração</h1>
          </div>
        </div>
        <p className="max-w-md text-sm text-rtc-mist">
          Toda alteração feita aqui fica registrada nos logs, com quem fez, quando e o motivo.
        </p>
      </header>

      <nav aria-label="Seções da administração" className="cartao flex flex-wrap gap-1.5 rounded-2xl p-1.5">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={aba === item.id ? 'page' : undefined}
            onClick={() => setAba(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              aba === item.id ? 'bg-sky-300 text-slate-950' : 'bg-white/10 text-rtc-mist hover:bg-white/20 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {erroCatalogo && <p role="alert" className="text-sm text-rose-300">{erroCatalogo}</p>}

      {aba === 'visao' && <VisaoGeral onIrParaLogs={() => setAba('logs')} />}
      {aba === 'usuarios' && <AdminUsuarios catalogo={catalogo} usuarioLogado={usuario} notify={notify} />}
      {aba === 'allowlist' && <AdminAllowlist catalogo={catalogo} usuarioLogado={usuario} notify={notify} />}
      {aba === 'logs' && <AdminLogs />}
      {aba === 'dados' && <AdminDados />}
    </section>
  )
}
