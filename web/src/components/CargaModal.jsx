import { useMemo, useState } from 'react'
import { CAMPOS_CARGA } from '../config/camposCarga.js'
import { formatarData } from '../utils/formatadores.js'
import { camposObrigatoriosAusentes, usuarioPodeEditarModulo } from '../utils/regras.js'
import CampoCarga from './CampoCarga.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import ModalBase from './ModalBase.jsx'

export default function CargaModal({ carga, usuario, catalogos, operacoes, notify, onClose }) {
  const [draft, setDraft] = useState(carga)
  const [confirmacao, setConfirmacao] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const cliente = catalogos.clientes.find((item) => item.id === carga.cliente_id)
  const destinatario = catalogos.clientes.find((item) => item.id === carga.destinatario_id)
  const campos = CAMPOS_CARGA.comercial
  const editavel = usuarioPodeEditarModulo(usuario, 'comercial')
  const mudou = campos.some(({ id }) => draft[id] !== carga[id])

  const detalhes = useMemo(() => [
    ['Criada em', formatarData(carga.criada_em)],
    ['Cliente', cliente?.nome ?? '—'],
    ['Local de embarque', cliente?.locais.find((local) => local.id === carga.local_embarque_id)?.nome ?? '—'],
    ['Destinatário', destinatario?.nome ?? '—'],
    ['Data limite de entrega', formatarData(carga.data_limite_entrega)],
  ], [carga, cliente, destinatario])

  function alterarCampo(campo, valor) {
    setDraft((atual) => {
      if (campo === 'cliente_id') {
        return {
          ...atual,
          cliente_id: valor,
          local_embarque_id: '',
          padrao_embarque: '',
        }
      }
      if (campo === 'local_embarque_id') {
        const local = catalogos.clientes
          .find((item) => item.id === atual.cliente_id)
          ?.locais.find((item) => item.id === valor)
        return {
          ...atual,
          local_embarque_id: valor,
          padrao_embarque: local?.padrao ?? '',
        }
      }
      return { ...atual, [campo]: valor }
    })
    setFieldErrors((atual) => ({ ...atual, [campo]: '' }))
    setError('')
  }

  async function salvarComercial() {
    const ausentes = camposObrigatoriosAusentes(draft)
    if (ausentes.length) {
      setFieldErrors(Object.fromEntries(ausentes.map((campo) => [campo, 'Campo obrigatório.'])))
      return
    }

    const patch = Object.fromEntries(campos.map((field) => {
      const value = draft[field.id]
      return [
        field.id,
        ['number', 'currency'].includes(field.type)
          ? value === '' || value == null ? null : Number(value)
          : value,
      ]
    }))
    try {
      await operacoes.atualizar(carga.id, patch)
      notify('Alterações salvas.')
      setError('')
      setFieldErrors({})
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar as alterações.')
    }
  }

  async function cancelarCarga(motivo) {
    try {
      await operacoes.cancelar(carga.id, motivo)
      notify('Carga cancelada.')
      setConfirmacao(false)
      setError('')
      onClose()
    } catch (actionError) {
      setError(actionError.message || 'Não foi possível cancelar a carga.')
      throw actionError
    }
  }

  return (
    <>
      <ModalBase
        wide
        title={`${carga.id.toUpperCase()} · ${cliente?.nome ?? 'Carga'}`}
        subtitle={`Comercial · ${carga.status === 'cancelada' ? 'Cancelada' : 'Em andamento'}`}
        onClose={onClose}
      >
        <div className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {detalhes.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">Comercial</h3>
              <span className={`rounded-full px-2.5 py-1 text-[11px] ${editavel ? 'bg-sky-300/15 text-sky-200' : 'bg-white/5 text-slate-400'}`}>
                {editavel ? 'Pode editar' : 'Somente leitura'}
              </span>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {campos.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <CampoCarga
                    field={field}
                    value={draft[field.id]}
                    disabled={!editavel}
                    catalogos={catalogos}
                    carga={draft}
                    error={fieldErrors[field.id]}
                    onChange={(value) => alterarCampo(field.id, value)}
                  />
                </div>
              ))}
            </div>
            {editavel && mudou && (
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={salvarComercial} className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200">
                  Salvar Comercial
                </button>
              </div>
            )}
          </section>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>}

        <footer className="mt-6 flex justify-between gap-3 border-t border-white/10 pt-4">
          {editavel && carga.status !== 'cancelada' && (
            <button type="button" onClick={() => setConfirmacao(true)} className="rounded-lg border border-rose-300/30 px-3 py-2 text-sm text-rose-200 hover:bg-rose-400/10">Cancelar carga</button>
          )}
        </footer>
      </ModalBase>

      {confirmacao && (
        <ConfirmDialog
          title="Cancelar carga"
          message="Deseja mesmo cancelar?"
          reasonLabel="Motivo"
          confirmLabel="Cancelar carga"
          onCancel={() => setConfirmacao(false)}
          onConfirm={cancelarCarga}
        />
      )}
    </>
  )
}
