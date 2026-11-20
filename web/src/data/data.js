import { dataLocalISO } from '../utils/datas.js'

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

const deslocarDias = (dias) => dataLocalISO(new Date(Date.now() + dias * 86400000))

const carga = (id, rota, peso_toneladas, { criadaHaDias, embarqueEmDias, modulo = 'comercial', frete = 6200 }) => {
  const local = locais_embarque[0]
  return {
    id,
    cliente_id: 'cli-01',
    local_embarque_id: local.id,
    destinatario_id: 'cli-01',
    dia_embarque: deslocarDias(embarqueEmDias),
    tolerancia_carregamento: '',
    data_limite_entrega: deslocarDias(embarqueEmDias + 5),
    tipo_carga: 'Paletizada',
    tipo_carroceria: 'Sider',
    peso_toneladas,
    frete_empresa: frete,
    frete_motorista: 5000,
    pedagio_tipo: 'incluso',
    valor_pedagio: '',
    rota,
    icms_tipo: 'incluso',
    aliquota_icms: 12,
    taxa_descarga: '',
    valor_descarga: 0,
    padrao_embarque: local.padrao,
    modulo_atual: modulo,
    criada_em: new Date(Date.now() - criadaHaDias * 86400000).toISOString(),
    atualizada_em: new Date().toISOString(),
  }
}

export const cargas = [
  carga('car-1001', 'Porto Velho, RO - Manaus, AM', 28, { criadaHaDias: 1, embarqueEmDias: 0, frete: 6200 }),
  carga('car-1002', 'Porto Velho, RO - Cuiabá, MT', 26, { criadaHaDias: 2, embarqueEmDias: 0, frete: 5800, modulo: 'contratacao' }),
  carga('car-1003', 'Porto Velho, RO - Goiânia, GO', 30, { criadaHaDias: 3, embarqueEmDias: 2, frete: 7400 }),
  carga('car-1004', 'Porto Velho, RO - Belém, PA', 27, { criadaHaDias: 4, embarqueEmDias: 4, frete: 8100 }),
]

// Cargas canceladas são excluídas do sistema (RF14); este registro só alimenta o dashboard.
export const cancelamentos = []

export const database = {
  clientes,
  locais_embarque,
  cargas,
  cancelamentos,
}
