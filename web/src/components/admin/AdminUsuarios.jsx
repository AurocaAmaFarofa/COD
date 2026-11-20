import { useCallback, useEffect, useState } from 'react'
import { adminApi, formatarDataHora } from '../../services/adminService.js'
import ModalBase from '../ModalBase.jsx'
import ModulosCheck from './ModulosCheck.jsx'
import AdminHistorico from './AdminHistorico.jsx'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300'

function Badge({ children, tom = 'neutro' }) {
  const cores = {
    neutro: 'bg-white/10 text-rtc-mist',
    admin: 'bg-sky-300/20 text-sky-200',
    ok: 'bg-emerald-400/15 text-emerald-300',
    perigo: 'bg-rose-400/15 text-rose-300',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cores[tom]}`}>{children}</span>
}

const ordenar = (lista) => [...lista].sort().join(',')

// Edição de um usuário: papel, status, módulos e histórico (quem mexeu e quando).
function EditarUsuario({ usuario, catalogo, usuarioLogado, notify, onFechar, onSalvo }) {
  const [papel, setPapel] = useState(usuario.papel)
  const [ativo, setAtivo] = useState(usuario.ativo)
  const [modulos, setModulos] = useState(usuario.modulos ?? [])
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [versaoHistorico, setVersaoHistorico] = useState(0)

  const ehVoce = String(usuario.id) === String(usuarioLogado.id)
  const mudaPapel = papel !== usuario.papel
  const mudaStatus = ativo !== usuario.ativo
  const desativa = usuario.ativo && !ativo
  const sensivel = mudaPapel || desativa
  const mudaModulos = ordenar(modulos) !== ordenar(usuario.modulos ?? [])
  const algoMudou = mudaPapel || mudaStatus || mudaModulos

  async function salvar(event) {
    event.preventDefault()
    if (sensivel && motivo.trim().length < 5) return setErro('Informe o motivo (mínimo 5 caracteres).')
    if (!modulos.length) return setErro('Escolha ao menos um módulo. Para bloquear, desative o usuário.')
    setSalvando(true)
    setErro('')
    try {
      const textoMotivo = motivo.trim() || undefined
      if (mudaPapel || mudaStatus) {
        await adminApi.alterarUsuario(usuario.id, { ativo, papel, motivo: textoMotivo })
      }
      if (mudaModulos) {
        await adminApi.definirModulosUsuario(usuario.id, { modulos, motivo: textoMotivo })
      }
      notify('Usuário atualizado. Alteração registrada no log.')
      onSalvo()
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar.')
      setSalvando(false)
      setVersaoHistorico((versao) => versao + 1)
    }
  }

  return (
    <ModalBase title={usuario.nome} subtitle={usuario.email} onClose={onFechar} wide>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={salvar} className="space-y-5">
          {ehVoce && (
            <p className="rounded-lg bg-amber-300/15 px-3 py-2 text-sm text-amber-200">
              Esta é a sua conta. Ela não pode ser alterada nesta tela.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-rtc-mist">
              Papel
              <select value={papel} disabled={ehVoce} onChange={(event) => setPapel(event.target.value)} className={inputClass}>
                <option value="usuario">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <label className="block text-sm text-rtc-mist">
              Status
              <select
                value={ativo ? 'ativo' : 'inativo'}
                disabled={ehVoce}
                onChange={(event) => setAtivo(event.target.value === 'ativo')}
                className={inputClass}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Desativado (não consegue entrar)</option>
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm text-rtc-mist">Módulos liberados</p>
            <div className="mt-2">
              <ModulosCheck catalogo={catalogo} selecionados={modulos} onChange={setModulos} disabled={ehVoce} />
            </div>
          </div>

          {(sensivel || algoMudou) && (
            <label className="block text-sm text-rtc-mist">
              Motivo {sensivel && <span className="text-rose-300">*</span>}
              <textarea
                rows="2"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder={sensivel ? 'Obrigatório para desativar ou mudar o papel' : 'Opcional'}
                className={inputClass}
              />
            </label>
          )}

          {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onFechar} className="rounded-lg px-4 py-2 text-sm text-rtc-mist hover:bg-white/10">
              Fechar
            </button>
            <button
              type="submit"
              disabled={salvando || ehVoce || !algoMudou}
              className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-sm font-semibold text-white">Histórico</h3>
          <p className="mb-3 text-xs text-rtc-mist/70">Tudo o que aconteceu com esta conta.</p>
          <AdminHistorico entidade="usuario" entidadeId={usuario.id} recarregarKey={versaoHistorico} />
        </div>
      </div>
    </ModalBase>
  )
}

export default function AdminUsuarios({ catalogo, usuarioLogado, notify }) {
  const [busca, setBusca] = useState('')
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const { itens: lista } = await adminApi.listarUsuarios(busca.trim())
      setItens(lista)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [busca])

  useEffect(() => {
    const timer = setTimeout(carregar, 250)
    return () => clearTimeout(timer)
  }, [carregar])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="w-full max-w-sm rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300"
        />
        <p className="text-xs text-rtc-mist/70">{itens.length} usuário(s)</p>
      </div>

      {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}

      <div className="overflow-x-auto cartao rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--campo)] text-xs uppercase tracking-wide text-rtc-mist/70">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Módulos</th>
              <th className="px-4 py-3">Último login</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {carregando && itens.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-rtc-mist">Carregando...</td></tr>
            )}
            {!carregando && itens.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-rtc-mist">Nenhum usuário encontrado.</td></tr>
            )}
            {itens.map((usuario) => (
              <tr key={usuario.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{usuario.nome}</p>
                  <p className="text-xs text-rtc-mist/70">{usuario.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tom={usuario.papel === 'admin' ? 'admin' : 'neutro'}>
                    {usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tom={usuario.ativo ? 'ok' : 'perigo'}>{usuario.ativo ? 'Ativo' : 'Desativado'}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-rtc-mist">{usuario.modulos?.join(', ') || '—'}</td>
                <td className="px-4 py-3 text-xs text-rtc-mist">{formatarDataHora(usuario.ultimo_login)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelecionado(usuario)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    Gerenciar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionado && (
        <EditarUsuario
          key={selecionado.id}
          usuario={selecionado}
          catalogo={catalogo}
          usuarioLogado={usuarioLogado}
          notify={notify}
          onFechar={() => setSelecionado(null)}
          onSalvo={() => {
            setSelecionado(null)
            carregar()
          }}
        />
      )}
    </section>
  )
}
