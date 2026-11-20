import { useEffect, useState } from 'react'
import { adminApi, formatarDataHora } from '../../services/adminService.js'

const LIMITE = 50
const ehData = (coluna) => /(_em|_at)$/.test(coluna)

function formatarCelula(valor, coluna) {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (ehData(coluna)) return formatarDataHora(valor)
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}

// Leitura de todas as tabelas liberadas pelo servidor. Somente leitura: alterações ficam
// nas abas próprias, que gravam no log.
export default function AdminDados() {
  const [tabelas, setTabelas] = useState([])
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [resposta, setResposta] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    adminApi
      .tabelas()
      .then(({ itens }) => {
        setTabelas(itens)
        setNome(itens[0]?.nome ?? '')
      })
      .catch((error) => setErro(error.message))
  }, [])

  useEffect(() => {
    if (!nome) return
    let cancelado = false
    setCarregando(true)
    setErro('')
    adminApi
      .tabela(nome, { pagina, limite: LIMITE })
      .then((dados) => {
        if (!cancelado) setResposta(dados)
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message)
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [nome, pagina])

  const totalPaginas = Math.max(1, Math.ceil((resposta?.total ?? 0) / LIMITE))

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-xs text-rtc-mist">
          Tabela
          <select
            value={nome}
            onChange={(event) => {
              setPagina(1)
              setNome(event.target.value)
            }}
            className="mt-1.5 block rounded-lg border border-white/15 bg-[var(--campo)] px-3 py-2 text-sm text-white outline-none focus:border-sky-300"
          >
            {tabelas.map((tabela) => (
              <option key={tabela.nome} value={tabela.nome}>{tabela.titulo}</option>
            ))}
          </select>
        </label>
        <p className="text-xs text-rtc-mist/70">
          {resposta ? `${resposta.total} registro(s) · somente leitura` : ''}
          {carregando ? ' · carregando...' : ''}
        </p>
      </div>

      {erro && <p role="alert" className="text-sm text-rose-300">{erro}</p>}

      {resposta && (
        <>
          <div className="flex items-center justify-end gap-2 text-xs text-rtc-mist/70">
            <button type="button" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)} className="rounded-lg bg-white/10 px-3 py-1.5 disabled:opacity-40">Anterior</button>
            <span>{pagina} / {totalPaginas}</span>
            <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)} className="rounded-lg bg-white/10 px-3 py-1.5 disabled:opacity-40">Próxima</button>
          </div>
          <div className="scrollbar-fino overflow-x-auto cartao rounded-2xl">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-[var(--campo)] uppercase tracking-wide text-rtc-mist/70">
                <tr>
                  {resposta.colunas.map((coluna) => (
                    <th key={coluna} className="whitespace-nowrap px-3 py-2.5 font-semibold">{coluna}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resposta.linhas.length === 0 && (
                  <tr><td colSpan={resposta.colunas.length || 1} className="px-4 py-6 text-center text-rtc-mist">Tabela vazia.</td></tr>
                )}
                {resposta.linhas.map((linha, indice) => (
                  <tr key={indice} className="border-t border-white/10">
                    {resposta.colunas.map((coluna) => (
                      <td key={coluna} className="max-w-xs truncate px-3 py-2 text-rtc-mist" title={formatarCelula(linha[coluna], coluna)}>
                        {formatarCelula(linha[coluna], coluna)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
