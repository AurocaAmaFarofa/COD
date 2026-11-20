import { useState } from 'react'
import { MODULOS_ATIVOS } from '../config/modulos.js'
import CargaCard from '../components/CargaCard.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { usuarioPodeEditarModulo, validarMovimento } from '../utils/regras.js'

function movimentoPermitido(usuario, carga, destino) {
  try {
    validarMovimento(usuario, carga, destino)
    return true
  } catch {
    return false
  }
}

export default function KanbanPage({ cargas, catalogos, usuario, loading, error, onCreate, onOpen, onMover, notify }) {
  const [arrastando, setArrastando] = useState(null)
  const [colunaAlvo, setColunaAlvo] = useState(null)
  const [devolucao, setDevolucao] = useState(null)

  function concluirMovimento(carga, destino) {
    if (carga.modulo_atual === 'contratacao' && destino === 'comercial') {
      setDevolucao({ carga, destino })
      return
    }
    onMover(carga.id, destino).then(() => notify(`Carga ${carga.id.toUpperCase()} movida.`)).catch((erro) => notify(erro.message, 'error'))
  }

  function soltar(event, destino) {
    event.preventDefault()
    setColunaAlvo(null)
    if (!arrastando || arrastando.modulo_atual === destino) return
    if (!movimentoPermitido(usuario, arrastando, destino)) {
      notify('Esta carga não pode ser movida para essa coluna.', 'error')
      return
    }
    concluirMovimento(arrastando, destino)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-300">Operação logística</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Kanban de cargas</h1>
          <p className="mt-2 text-sm text-rtc-mist/75">Arraste a carga para o módulo seguinte. Você só move cargas do seu módulo.</p>
        </div>
        {usuarioPodeEditarModulo(usuario, 'comercial') && (
          <button type="button" onClick={onCreate} className="rounded-full bg-gradient-to-r from-rtc-blue to-rtc-blue/70 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rtc-navy/50 transition hover:brightness-110">
            + Nova carga
          </button>
        )}
      </header>

      {error && <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {loading && <p className="text-sm text-rtc-mist/70">Atualizando cargas...</p>}

      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2">
        {MODULOS_ATIVOS.map((modulo) => {
          const cargasDaColuna = cargas.filter((carga) => carga.modulo_atual === modulo.id)
          const alvoValido = arrastando && arrastando.modulo_atual !== modulo.id && movimentoPermitido(usuario, arrastando, modulo.id)
          const alvoInvalido = arrastando && arrastando.modulo_atual !== modulo.id && !alvoValido
          const emAlvo = colunaAlvo === modulo.id

          return (
            <section
              key={modulo.id}
              onDragOver={(event) => {
                if (!alvoValido) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
              }}
              onDragEnter={() => alvoValido && setColunaAlvo(modulo.id)}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setColunaAlvo(null)
              }}
              onDrop={(event) => soltar(event, modulo.id)}
              className={`vidro min-w-[265px] rounded-3xl p-3 transition-all duration-200 ${
                emAlvo ? 'ring-2 ring-sky-300/70 bg-rtc-blue/20' : ''
              } ${alvoInvalido ? 'opacity-70' : ''}`}
            >
              <header className="mb-3 flex items-center justify-between gap-2 px-2 pt-1">
                <h2 className="text-sm font-bold text-white">{modulo.nome}</h2>
                <span className="grid h-7 min-w-7 place-items-center rounded-full bg-white/15 px-2 text-xs font-bold text-white">{cargasDaColuna.length}</span>
              </header>
              <div className="space-y-3">
                {cargasDaColuna.map((carga) => (
                  <CargaCard
                    key={carga.id}
                    carga={carga}
                    cliente={catalogos.clientes.find((item) => item.id === carga.cliente_id)}
                    podeArrastar={usuarioPodeEditarModulo(usuario, carga.modulo_atual)}
                    arrastando={arrastando?.id === carga.id}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', carga.id)
                      setArrastando(carga)
                    }}
                    onDragEnd={() => {
                      setArrastando(null)
                      setColunaAlvo(null)
                    }}
                    onClick={() => onOpen(carga.id)}
                  />
                ))}
                {!cargasDaColuna.length && (
                  <p className={`rounded-2xl border border-dashed px-3 py-8 text-center text-xs ${emAlvo ? 'border-sky-300 text-sky-200' : 'border-white/15 text-rtc-mist/60'}`}>
                    {emAlvo ? 'Solte aqui' : 'Nenhuma carga neste módulo'}
                  </p>
                )}
                {emAlvo && cargasDaColuna.length > 0 && (
                  <p className="rounded-2xl border border-dashed border-sky-300/60 px-3 py-3 text-center text-xs text-sky-200">Solte aqui</p>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {devolucao && (
        <ConfirmDialog
          title="Devolver carga ao Comercial"
          message={`Deseja devolver a carga ${devolucao.carga.id.toUpperCase()} ao Comercial? Ela volta apenas com as informações do Comercial.`}
          reasonLabel="Motivo (opcional)"
          confirmLabel="Devolver carga"
          onCancel={() => setDevolucao(null)}
          onConfirm={async () => {
            try {
              await onMover(devolucao.carga.id, devolucao.destino)
              notify(`Carga ${devolucao.carga.id.toUpperCase()} devolvida ao Comercial.`)
              setDevolucao(null)
            } catch (erro) {
              notify(erro.message, 'error')
              throw erro
            }
          }}
        />
      )}
    </section>
  )
}
