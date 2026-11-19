import { useState } from 'react'
import { CAMPOS_CARGA } from '../config/camposCarga.js'
import CampoCarga from './CampoCarga.jsx'
import ModalBase from './ModalBase.jsx'

const dadosVazios = {
  cliente_id: '',
  local_embarque_id: '',
  destinatario_id: '',
  dia_embarque: '',
  tolerancia_carregamento: '',
  data_limite_entrega: '',
  tipo_carga: '',
  tipo_carroceria: '',
  peso_toneladas: '',
  frete_empresa: '',
  frete_motorista: '',
  pedagio_tipo: '',
  valor_pedagio: '',
  rota: '',
  icms_tipo: '',
  aliquota_icms: '',
  taxa_descarga: '',
  valor_descarga: '',
  padrao_embarque: '',
}

export default function NovaCargaModal({ catalogos, onClose, onCreate }) {
  const [dados, setDados] = useState(dadosVazios)
  const [erros, setErros] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function alterarCampo(campo, valor) {
    if (campo === 'cliente_id') {
      setDados((atual) => ({
        ...atual,
        cliente_id: valor,
        local_embarque_id: '',
        padrao_embarque: '',
      }))
    } else if (campo === 'local_embarque_id') {
      const local = catalogos.clientes
        .find((item) => item.id === dados.cliente_id)
        ?.locais.find((item) => item.id === valor)
      setDados((atual) => ({
        ...atual,
        local_embarque_id: valor,
        padrao_embarque: local?.padrao ?? '',
      }))
    } else {
      setDados((atual) => ({ ...atual, [campo]: valor }))
    }
    setErros((atual) => ({ ...atual, [campo]: '' }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    const ausentes = CAMPOS_CARGA.comercial
      .filter((field) => field.required && !String(dados[field.id] ?? '').trim())
      .map((field) => field.id)
    if (ausentes.length) {
      setErros(Object.fromEntries(ausentes.map((campo) => [campo, 'Campo obrigatório.'])))
      return
    }
    setErros({})
    setError('')
    setLoading(true)
    try {
      const dadosNormalizados = { ...dados }
      for (const campo of ['peso_toneladas', 'frete_empresa', 'frete_motorista', 'valor_pedagio', 'aliquota_icms', 'valor_descarga']) {
        dadosNormalizados[campo] = dados[campo] === '' ? null : Number(dados[campo])
      }
      await onCreate(dadosNormalizados)
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível criar a carga.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title="Nova carga" subtitle="Preencha os dados comerciais para iniciar a operação." onClose={onClose}>
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {CAMPOS_CARGA.comercial.map((field) => (
            <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <CampoCarga
                field={field}
                value={dados[field.id]}
                error={erros[field.id]}
                disabled={false}
                catalogos={catalogos}
                carga={dados}
                onChange={(value) => alterarCampo(field.id, value)}
              />
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Cancelar</button>
          <button type="submit" disabled={loading || !catalogos.clientes.length} className="rounded-lg bg-sky-300 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar carga'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
