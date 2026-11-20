import { database } from '../data/data.js'
import { apiRequest, simularLatencia, USE_MOCK } from './api.js'
import { getMe } from './authService.js'
import {
  exigir,
  validarCancelamento,
  validarCriacaoCarga,
  validarEdicaoCarga,
  validarMovimento,
} from '../utils/regras.js'

const copiarCarga = (carga) => ({ ...carga })
const buscarNoMock = (id) => {
  const carga = database.cargas.find((item) => item.id === id)
  exigir(carga, 'Carga não encontrada.')
  return carga
}

// Cargas em andamento (as finalizadas e canceladas saem desta lista, RF07 e RF14).
export async function listarCargas() {
  if (USE_MOCK) {
    await simularLatencia()
    return database.cargas.map(copiarCarga)
  }
  return apiRequest('/cargas')
}

// Registro das cargas canceladas, usado pelo dashboard (a carga em si é excluída, RF14).
export async function listarCancelamentos() {
  if (USE_MOCK) {
    await simularLatencia()
    return database.cancelamentos.map((item) => ({ ...item }))
  }
  return apiRequest('/cargas/cancelamentos')
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

// Arrastar a carga entre colunas. O back-end deve validar de novo (RN08).
export async function moverCarga(id, destino) {
  const usuario = await getMe()
  if (USE_MOCK) {
    const carga = buscarNoMock(id)
    validarMovimento(usuario, carga, destino)
    await simularLatencia()
    carga.modulo_atual = destino
    carga.atualizada_em = new Date().toISOString()
    return copiarCarga(carga)
  }
  return apiRequest(`/cargas/${id}/mover`, { method: 'POST', body: { modulo: destino } })
}

// RF14: a carga é excluída do sistema; o cancelamento fica registrado para o dashboard.
export async function cancelarCarga(id, motivo = '') {
  const usuario = await getMe()
  validarCancelamento(usuario)
  if (USE_MOCK) {
    const carga = buscarNoMock(id)
    await simularLatencia()
    database.cancelamentos.unshift({
      id: carga.id,
      cliente_id: carga.cliente_id,
      frete_empresa: carga.frete_empresa,
      motivo: motivo.trim(),
      cancelado_em: new Date().toISOString(),
    })
    database.cargas.splice(database.cargas.indexOf(carga), 1)
    return { id }
  }
  return apiRequest(`/cargas/${id}/cancelar`, { method: 'POST', body: { motivo } })
}
