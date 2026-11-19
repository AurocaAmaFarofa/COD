import { STATUS_CARGA } from '../config/modulos.js'

export const usuarios = [
  {
    id: 'usr-comercial',
    nome: 'Marina Costa',
    email: 'marina@rtc.local',
    modulos: ['comercial'],
    avatar: 'MC',
  },
]

export const clientes = [
  {
    id: 'cli-01',
    nome: 'Moinho Vitória',
    cnpj: '12.345.678/0001-90',
    template: 'Caminhão limpo, lona sem rasgos e caçamba sem odores.',
  },
]

export const locais_embarque = [
  {
    id: 'loc-01',
    cliente_id: 'cli-01',
    nome: 'Unidade Porto Velho',
    endereco: 'Porto Velho, RO',
    padrao: 'Lona sem rasgos.',
  },
]

const carga = (
  id,
  cliente_id,
  local_embarque_id,
  rota,
  peso_toneladas,
  dias,
) => {
  const dataHoje = new Date().toISOString().slice(0, 10)
  const dataEntrega = new Date(Date.now() + 5 * 86400000)
    .toISOString()
    .slice(0, 10)
  const local = locais_embarque.find((item) => item.id === local_embarque_id)
  return {
    id,
    cliente_id,
    local_embarque_id,
    destinatario_id: cliente_id,
    dia_embarque: dataHoje,
    tolerancia_carregamento: '',
    data_limite_entrega: dataEntrega,
    tipo_carga: 'Paletizada',
    tipo_carroceria: 'Sider',
    peso_toneladas,
    frete_empresa: 6200,
    frete_motorista: 5000,
    pedagio_tipo: 'incluso',
    valor_pedagio: '',
    rota,
    icms_tipo: 'incluso',
    aliquota_icms: 12,
    taxa_descarga: '',
    valor_descarga: 0,
    padrao_embarque: local?.padrao ?? '',
    modulo_atual: 'comercial',
    status: STATUS_CARGA.EM_ANDAMENTO,
    motivo_cancelamento: '',
    criada_em: new Date(Date.now() - dias * 86400000).toISOString(),
    atualizada_em: new Date().toISOString(),
  }
}

export const cargas = [
  carga(
    'car-1001',
    'cli-01',
    'loc-01',
    'Porto Velho, RO - Manaus, AM',
    28,
    1,
  ),
]

export const database = {
  usuarios,
  clientes,
  locais_embarque,
  cargas,
}

let mockUserId = usuarios[0].id

export function getMockUserId() {
  return mockUserId
}

export function setMockUserId(userId) {
  mockUserId = userId
}
