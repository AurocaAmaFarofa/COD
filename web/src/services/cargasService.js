import { database } from '../data/data.js'
import { STATUS_CARGA } from '../config/modulos.js'
import { apiRequest, simularLatencia, USE_MOCK } from './api.js'
import { getMe } from './authService.js'
import {
  exigir,
  validarCancelamento,
  validarCriacaoCarga,
  validarEdicaoCarga,
} from '../utils/regras.js'

const copiarCarga = (carga) => ({ ...carga })
const buscarNoMock = (id) => {
  const carga = database.cargas.find((item) => item.id === id)
  exigir(carga, 'Carga não encontrada.')
  return carga
}

export async function listarCargas({ incluirArquivadas = false } = {}) {
  if (USE_MOCK) {
    await simularLatencia()
    return database.cargas
      .filter((carga) => incluirArquivadas || carga.status !== STATUS_CARGA.CANCELADA)
      .map(copiarCarga)
  }
  return apiRequest(`/cargas${incluirArquivadas ? '?incluir_arquivadas=true' : ''}`)
}

export async function buscarCarga(id) {
  if (USE_MOCK) {
    await simularLatencia()
    return copiarCarga(buscarNoMock(id))
  }
  return apiRequest(`/cargas/${id}`)
}

export async function criarCarga(dados) {
  const usuario = await getMe()
  validarCriacaoCarga(usuario, dados)
  if (USE_MOCK) {
    const local = database.locais_embarque.find((item) => item.id === dados.local_embarque_id)
    exigir(local?.cliente_id === dados.cliente_id, 'O local de embarque deve pertencer ao cliente selecionado.')
    exigir(database.clientes.some((item) => item.id === dados.destinatario_id), 'Selecione um destinatário válido.')
    await simularLatencia()
    const novaCarga = {
      id: `car-${Date.now()}`,
      ...dados,
      peso_toneladas: dados.peso_toneladas === '' || dados.peso_toneladas == null
        ? null
        : Number(dados.peso_toneladas),
      padrao_embarque: local.padrao ?? '',
      modulo_atual: 'comercial',
      status: STATUS_CARGA.EM_ANDAMENTO,
      criada_em: new Date().toISOString(),
      atualizada_em: new Date().toISOString(),
    }
    database.cargas.unshift(novaCarga)
    return copiarCarga(novaCarga)
  }
  // Integração real: POST /cargas; backend registra criada_em e modulo_atual.
  return apiRequest('/cargas', { method: 'POST', body: dados })
}

export async function atualizarCarga(id, dados) {
  const usuario = await getMe()
  if (USE_MOCK) {
    const carga = buscarNoMock(id)
    validarEdicaoCarga(usuario, carga, dados)
    const patch = { ...dados }
    if (patch.local_embarque_id) {
      const local = database.locais_embarque.find((item) => item.id === patch.local_embarque_id)
      exigir(local?.cliente_id === (dados.cliente_id ?? carga.cliente_id), 'O local de embarque deve pertencer ao cliente selecionado.')
      if (Object.prototype.hasOwnProperty.call(patch, 'padrao_embarque')) {
        patch.padrao_embarque = local.padrao ?? ''
      }
    }
    if (patch.destinatario_id) {
      exigir(database.clientes.some((item) => item.id === patch.destinatario_id), 'Selecione um destinatário válido.')
    }
    await simularLatencia()
    Object.assign(carga, patch, { atualizada_em: new Date().toISOString() })
    return copiarCarga(carga)
  }
  return apiRequest(`/cargas/${id}`, { method: 'PATCH', body: dados })
}

export async function cancelarCarga(id, motivo = '') {
  const usuario = await getMe()
  validarCancelamento(usuario)
  if (USE_MOCK) {
    const carga = buscarNoMock(id)
    await simularLatencia()
    carga.status = STATUS_CARGA.CANCELADA
    carga.motivo_cancelamento = motivo.trim()
    carga.atualizada_em = new Date().toISOString()
    return copiarCarga(carga)
  }
  return apiRequest(`/cargas/${id}/cancelar`, { method: 'POST', body: { motivo } })
}
