import { useCallback, useEffect, useState } from 'react'
import { adminApi, formatarDataHora } from '../../services/adminService.js'
import ModalBase from '../ModalBase.jsx'
import ModulosCheck from './ModulosCheck.jsx'
import AdminMotivoModal from './AdminMotivoModal.jsx'
import AdminHistorico from './AdminHistorico.jsx'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300'

const ordenar = (lista) => [...lista].sort().join(',')

// Editor de módulos de um e-mail da allowlist. Vale para contas novas; a conta já criada
// é ajustada na aba Usuários.
function EditarAllowlist({ item, catalogo, notify, onFechar, onSalvo }) {
  const [modulos, setModulos] = useState(item.modulos ?? [])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const mudou = ordenar(modulos) !== ordenar(item.modulos ?? [])

  async function salvar(event) {
    event.preventDefault()
    if (!modulos.length) return setErro('Escolha ao menos um módulo.')
    setSalvando(true)
    setErro('')
    try {
      await adminApi.alterarAllowlist(item.email, { modulos })
      notify('Allowlist atualizada. Alteração registrada no log.')
      onSalvo()
    } catch (error) {
      setErro(error.message)
      setSalvando(false)
    }
  }

  return (
    <ModalBase title="Módulos na allowlist" subtitle={item.email} onClose={onFechar}>
      <form onSubmit={salvar} className="space-y-5">
        <p className="text-sm text-rtc-mist">
          Esta alteração vale para contas criadas a partir de agora. Para uma conta que já existe,
          ajuste os módulos na aba Usuários.
        </p>
        <ModulosCheck catalogo={catalogo} selecionados={modulos} onChange={setModulos} />
        {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onFechar} className="rounded-lg px-4 py-2 text-sm text-rtc-mist hover:bg-white/10">
            Fechar
          </button>
          <button
            type="submit"
            disabled={salvando || !mudou}
            className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar módulos'}
          </button>
        </div>
      </form>
      <details className="mt-6 cartao rounded-xl p-3">
        <summary className="cursor-pointer text-sm text-rtc-mist">Histórico deste e-mail</summary>
        <div className="mt-3">
          <AdminHistorico entidade="allowlist" entidadeId={item.email} />
        </div>
      </details>
    </ModalBase>
  )
}

// Código de convite recém-gerado. Aparece só agora: o servidor guarda apenas o hash.
function ConviteGerado({ convite, onFechar }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    try {
      await navigator.clipboard.writeText(convite.codigo)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }
  return (
    <div role="status" className="cartao rounded-2xl border border-sky-300/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">Código de convite para {convite.email}</p>
          <p className="mt-1 text-xs text-rtc-mist/70">
            Envie este código à pessoa. Ele é pedido no cadastro com senha, vale uma vez e expira em{' '}
            {formatarDataHora(convite.expiraEm)}. Ele não será mostrado de novo; se perder, gere outro.
            Quem entrar com Google não precisa dele.
          </p>
        </div>
        <button type="button" onClick={onFechar} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-rtc-mist hover:bg-white/10">
          Fechar
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <code className="rounded-lg bg-[var(--campo)] px-4 py-2 font-mono text-lg tracking-[0.2em] text-white select-all">
          {convite.codigo}
        </code>
        <button
          type="button"
          onClick={copiar}
          className="cursor-pointer rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200"
        >
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

function situacaoConta(item) {
  if (item.usuario_id) return item.usuario_ativo ? 'Conta ativa' : 'Conta desativada'
  if (item.convite_pendente) return `Sem conta · convite até ${formatarDataHora(item.convite_expira_em)}`
  return 'Sem conta · sem convite válido'
}

export default function AdminAllowlist({ catalogo, usuarioLogado, notify }) {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [email, setEmail] = useState('')
  const [modulosNovos, setModulosNovos] = useState([])
  const [adicionando, setAdicionando] = useState(false)
  const [mensagemAdicao, setMensagemAdicao] = useState('')
  const [editando, setEditando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [conviteGerado, setConviteGerado] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const { itens: lista } = await adminApi.listarAllowlist()
      setItens(lista)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function adicionar(event) {
    event.preventDefault()
    setAdicionando(true)
    setErro('')
    setMensagemAdicao('')
    try {
      const resposta = await adminApi.adicionarAllowlist({ email, modulos: modulosNovos })
      notify('E-mail adicionado à allowlist. Alteração registrada no log.')
      setConviteGerado(resposta.convite ? { email: resposta.email, ...resposta.convite } : null)
      setMensagemAdicao(
        resposta.usuarioExiste
          ? 'Este e-mail já tem conta. Os módulos dela não mudam aqui: ajuste-os na aba Usuários.'
          : '',
      )
      setEmail('')
      setModulosNovos([])
      carregar()
    } catch (error) {
      setErro(error.message)
    } finally {
      setAdicionando(false)
    }
  }

  async function novoConvite(item) {
    setErro('')
    try {
      const resposta = await adminApi.gerarConvite(item.email)
      setConviteGerado({ email: resposta.email, ...resposta.convite })
      notify('Novo convite gerado. O código anterior deixou de valer.')
      carregar()
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <section className="space-y-6">
      <form onSubmit={adicionar} className="space-y-4 cartao rounded-2xl p-5">
        <div>
          <h2 className="font-semibold text-white">Adicionar e-mail à allowlist</h2>
          <p className="mt-1 text-xs text-rtc-mist/70">
            Só e-mails desta lista conseguem criar conta ou entrar.
          </p>
        </div>
        <label className="block text-sm text-rtc-mist">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nome@empresa.com"
            className={inputClass}
          />
        </label>
        <div>
          <p className="text-sm text-rtc-mist">Módulos</p>
          <div className="mt-2">
            <ModulosCheck catalogo={catalogo} selecionados={modulosNovos} onChange={setModulosNovos} />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-200">{mensagemAdicao}</p>
          <button
            type="submit"
            disabled={adicionando || !modulosNovos.length}
            className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200 disabled:opacity-50"
          >
            {adicionando ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </form>

      {conviteGerado && <ConviteGerado convite={conviteGerado} onFechar={() => setConviteGerado(null)} />}

      {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}

      <div className="overflow-x-auto cartao rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[var(--campo)] text-xs uppercase tracking-wide text-rtc-mist/70">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Módulos</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {carregando && itens.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-rtc-mist">Carregando...</td></tr>
            )}
            {itens.map((item) => {
              const ehVoce = item.email === usuarioLogado.email
              return (
                <tr key={item.email} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">
                    {item.email} {ehVoce && <span className="text-xs font-normal text-amber-200">(você)</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-rtc-mist">{item.modulos?.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-xs text-rtc-mist">
                    {situacaoConta(item)}
                  </td>
                  <td className="px-4 py-3 text-xs text-rtc-mist">{formatarDataHora(item.criado_em)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!item.usuario_id && (
                        <button
                          type="button"
                          onClick={() => novoConvite(item)}
                          className="cursor-pointer rounded-lg bg-sky-300/15 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-300/25"
                        >
                          Novo convite
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={ehVoce}
                        onClick={() => setEditando(item)}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-40"
                      >
                        Módulos
                      </button>
                      <button
                        type="button"
                        disabled={ehVoce}
                        onClick={() => setRemovendo(item)}
                        className="rounded-lg bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-400/25 disabled:opacity-40"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editando && (
        <EditarAllowlist
          item={editando}
          catalogo={catalogo}
          notify={notify}
          onFechar={() => setEditando(null)}
          onSalvo={() => {
            setEditando(null)
            carregar()
          }}
        />
      )}

      {removendo && (
        <AdminMotivoModal
          title="Remover da allowlist"
          message={`${removendo.email} deixa de poder entrar no sistema imediatamente. A conta, se existir, não é apagada e pode ser reativada depois.`}
          confirmLabel="Remover"
          onClose={() => setRemovendo(null)}
          onConfirm={async (motivo) => {
            await adminApi.removerAllowlist(removendo.email, { motivo })
            notify('Removido da allowlist. Alteração registrada no log.')
            setRemovendo(null)
            carregar()
          }}
        />
      )}
    </section>
  )
}
