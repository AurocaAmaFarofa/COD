import { useEffect, useState } from 'react'
import { adminApi, formatarDataHora, rotuloEvento } from '../../services/adminService.js'

// Lista os eventos de auditoria de um alvo (ex.: um usuário ou uma entrada da allowlist).
export default function AdminHistorico({ entidade, entidadeId, recarregarKey = 0 }) {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false
    adminApi
      .auditoria({ entidade, entidade_id: entidadeId, limite: 30 })
      .then((resposta) => {
        if (!cancelado) setItens(resposta.itens)
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message)
      })
    return () => {
      cancelado = true
    }
  }, [entidade, entidadeId, recarregarKey])

  if (erro) return <p className="text-sm text-rose-300">{erro}</p>
  if (!itens) return <p className="text-sm text-rtc-mist">Carregando...</p>
  if (!itens.length) return <p className="text-sm text-rtc-mist">Nenhum registro ainda.</p>

  return (
    <ol className="scrollbar-fino max-h-80 space-y-2 overflow-y-auto pr-1">
      {itens.map((item) => (
        <li key={item.id} className="cartao rounded-xl bg-white/5 px-3 py-2 text-xs">
          <p className="font-semibold text-white">{rotuloEvento(item.evento)}</p>
          <p className="text-rtc-mist">
            {formatarDataHora(item.criado_em)} · por {item.usuario_nome || item.email || 'sistema'}
          </p>
          {item.detalhes?.motivo && <p className="mt-1 text-rtc-mist">Motivo: {item.detalhes.motivo}</p>}
        </li>
      ))}
    </ol>
  )
}
