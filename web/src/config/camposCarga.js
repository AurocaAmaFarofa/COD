import { CAMPOS_OBRIGATORIOS_CARGA } from './camposObrigatoriosCarga.js'

const comercial = [
  { id: 'cliente_id', label: 'Cliente', type: 'cliente' },
  { id: 'local_embarque_id', label: 'Local de embarque', type: 'local' },
  { id: 'destinatario_id', label: 'Destinatário', type: 'cliente' },
  { id: 'dia_embarque', label: 'Dia do embarque', type: 'date' },
  {
    id: 'tolerancia_carregamento',
    label: 'Tolerância (data limite de carregamento)',
    type: 'date',
  },
  { id: 'data_limite_entrega', label: 'Data limite de entrega', type: 'date' },
  {
    id: 'tipo_carga',
    label: 'Tipo de carga',
    type: 'select',
    options: ['Paletizada', 'Sacaria', 'Big Bag'],
  },
  {
    id: 'tipo_carroceria',
    label: 'Tipo de carroceria',
    type: 'select',
    options: ['Sider', 'Graneleiro', 'Grade Baixa', 'Baú'],
  },
  { id: 'peso_toneladas', label: 'Peso da carga', type: 'number' },
  { id: 'frete_empresa', label: 'Frete empresa', type: 'currency' },
  { id: 'frete_motorista', label: 'Frete motorista', type: 'currency' },
  {
    id: 'pedagio_tipo',
    label: 'Pedágio',
    type: 'select',
    options: ['incluso', '+ pedágio'],
  },
  { id: 'valor_pedagio', label: 'Valor do pedágio', type: 'currency' },
  { id: 'rota', label: 'Rota', type: 'text' },
  {
    id: 'icms_tipo',
    label: 'ICMS',
    type: 'select',
    options: ['incluso', '+ ICMS'],
  },
  { id: 'aliquota_icms', label: 'Alíquota', type: 'number' },
  { id: 'taxa_descarga', label: 'Taxa de descarga', type: 'text' },
  { id: 'valor_descarga', label: 'Valor da descarga', type: 'currency' },
  {
    id: 'padrao_embarque',
    label: 'Padrão de embarque',
    type: 'textarea',
    readOnly: true,
  },
].map((field) => ({
  ...field,
  required: CAMPOS_OBRIGATORIOS_CARGA[field.id],
}))

export const CAMPOS_CARGA = {
  comercial,
}
