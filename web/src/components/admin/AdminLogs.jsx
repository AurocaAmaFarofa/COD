import { useCallback, useEffect, useState } from 'react'
import { adminApi, formatarDataHora, rotuloEvento } from '../../services/adminService.js'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300'

const LIMITE = 50
const FILTROS_VAZIOS = { evento: '', email: '', entidade: '', de: '', ate: '' }

// datetime-local vem sem fuso; converte para ISO para o servidor filtrar certo.
const paraIso = (valor) => (valor ? new Date(valor).toISOString() : '')

// Log completo: quem fez o quê, quando e de qual IP. Somente leitura (o banco não permite editar).
export default function AdminLogs() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS)
  const [pagina, setPagina] = useState(1)
  const [dados, setDados] = useState({ itens: [], total: 0 })
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [abertoId, setAbertoId] = useState(null)

  useEffect(() => {
    adminApi.eventosAuditoria().then((resposta) => setEventos(resposta.itens)).catch(() => {})
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const resposta = await adminApi.auditoria({
        ...aplicados,
        de: paraIso(aplicados.de),
        ate: paraIso(aplicados.ate),
        pagina,
        limite: LIMITE,
      })
      setDados(resposta)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [aplicados, pagina])

  useEffect(() => {
    carregar()
  }, [carregar])

  function aplicar(event) {
    event.preventDefault()
    setPagina(1)
    setAplicados(filtros)
  }

  const totalPaginas = Math.max(1, Math.ceil(dados.total / LIMITE))

  return (
    <section className="space-y-5">
      <form onSubmit={aplicar} className="grid gap-3 cartao rounded-2xl p-4 md:grid-cols-3 xl:grid-cols-6">
        <label className="block text-xs text-rtc-mist">
          Evento
          <select value={filtros.evento} onChange={(event) => setFiltros({ ...filtros, evento: event.target.value })} className={inputClass}>
            <option value="">Todos</option>
            {eventos.map((evento) => (
              <option key={evento} value={evento}>{rotuloEvento(evento)}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-rtc-mist">
          Alvo
          <select value={filtros.entidade} onChange={(event) => setFiltros({ ...filtros, entidade: event.target.value })} className={inputClass}>
            <option value="">Qualquer</option>
            <option value="usuario">Usuário</option>
            <option value="allowlist">Allowlist</option>
          </select>
        </label>
        <label className="block text-xs text-rtc-mist">
          E-mail (contém)
          <input value={filtros.email} onChange={(event) => setFiltros({ ...filtros, email: event.target.value })} className={inputClass} />
        </label>
        <label className="block text-xs text-rtc-mist">
          De
          <input type="datetime-local" value={filtros.de} onChange={(event) => setFiltros({ ...filtros, de: event.target.value })} className={inputClass} />
        </label>
        <label className="block text-xs text-rtc-mist">
          Até
          <input type="datetime-local" value={filtros.ate} onChange={(event) => setFiltros({ ...filtros, ate: event.target.value })} className={inputClass} />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="w-full rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200">
            Filtrar
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltros(FILTROS_VAZIOS)
              setAplicados(FILTROS_VAZIOS)
              setPagina(1)
            }}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-rtc-mist hover:bg-white/20"
          >
            Limpar
          </button>
        </div>
      </form>

      {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}

      <div className="flex items-center justify-between text-xs text-rtc-mist/70">
        <p>{dados.total} registro(s){carregando ? ' · atualizando...' : ''}</p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)} className="rounded-lg bg-white/10 px-3 py-1.5 disabled:opacity-40">Anterior</button>
          <span>{pagina} / {totalPaginas}</span>
          <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)} className="rounded-lg bg-white/10 px-3 py-1.5 disabled:opacity-40">Próxima</button>
        </div>
      </div>

      <div className="overflow-x-auto cartao rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--campo)] text-xs uppercase tracking-wide text-rtc-mist/70">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Quem</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Alvo</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {dados.itens.length === 0 && !carregando && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-rtc-mist">Nenhum registro com estes filtros.</td></tr>
            )}
            {dados.itens.map((item) => (
              <FragmentoLinha
                key={item.id}
                item={item}
                aberto={abertoId === item.id}
                onAlternar={() => setAbertoId(abertoId === item.id ? null : item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FragmentoLinha({ item, aberto, onAlternar }) {
  return (
    <>
      <tr className="border-t border-white/10">
        <td className="whitespace-nowrap px-4 py-3 text-xs text-rtc-mist">{formatarDataHora(item.criado_em)}</td>
        <td className="px-4 py-3">
          <p className="text-white">{item.usuario_nome || 'Sistema / visitante'}</p>
          <p className="text-xs text-rtc-mist/70">{item.email || '—'}</p>
        </td>
        <td className="px-4 py-3 text-white">{rotuloEvento(item.evento)}</td>
        <td className="px-4 py-3 text-xs text-rtc-mist">
          {item.entidade ? `${item.entidade} #${item.entidade_id}` : '—'}
        </td>
        <td className="px-4 py-3 text-xs text-rtc-mist">{item.ip || '—'}</td>
        <td className="px-4 py-3 text-right">
          <button type="button" onClick={onAlternar} className="text-xs font-semibold text-sky-300 hover:text-sky-200">
            {aberto ? 'Ocultar' : 'Detalhes'}
          </button>
        </td>
      </tr>
      {aberto && (
        <tr className="bg-white/5">
          <td colSpan={6} className="px-4 py-3">
            <pre className="scrollbar-fino max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-[var(--campo)] p-3 text-xs text-rtc-mist">
              {JSON.stringify(item.detalhes ?? {}, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}
