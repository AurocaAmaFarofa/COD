import { database } from '../data/data.js'
import { apiRequest, simularLatencia, USE_MOCK } from './api.js'
import { exigir, validarCliente } from '../utils/regras.js'

const novoId = () => `cli-${Date.now()}-${database.clientes.length + 1}`

export async function listarClientes() {
  if (USE_MOCK) {
    await simularLatencia()
    return database.clientes.map((cliente) => ({
      ...cliente,
      locais: database.locais_embarque.filter((local) => local.cliente_id === cliente.id),
    }))
  }
  return apiRequest('/clientes')
}

export async function criarCliente(dados) {
  validarCliente(dados, dados.locais)
  if (USE_MOCK) {
    await simularLatencia()
    const cliente = {
      id: novoId(),
      nome: dados.nome.trim(),
      cnpj: dados.cnpj.trim(),
      template: dados.template?.trim() ?? '',
      remetente: Boolean(dados.remetente),
      destinatario: Boolean(dados.destinatario),
    }
    database.clientes.push(cliente)
    dados.locais.filter((local) => local.nome?.trim()).forEach((local, index) => {
      database.locais_embarque.push({
        id: `${cliente.id}-loc-${index + 1}`,
        cliente_id: cliente.id,
        nome: local.nome.trim(),
        endereco: local.endereco?.trim() ?? '',
        padrao: local.padrao?.trim() ?? '',
      })
    })
    return cliente
  }
  // Integração real: POST /clientes com locais no corpo; a API retorna o cliente criado.
  return apiRequest('/clientes', { method: 'POST', body: dados })
}

export async function atualizarCliente(id, dados) {
  validarCliente(dados, dados.locais)
  if (USE_MOCK) {
    await simularLatencia()
    const index = database.clientes.findIndex((cliente) => cliente.id === id)
    exigir(index >= 0, 'Cliente não encontrado.')
    const locaisEmUso = database.cargas
      .filter((carga) => carga.cliente_id === id)
      .map((carga) => carga.local_embarque_id)
    exigir(
      locaisEmUso.every((localId) => dados.locais.some((local) => local.id === localId)),
      'Não é possível remover um local usado por uma carga existente.',
    )
    database.clientes[index] = {
      ...database.clientes[index],
      nome: dados.nome.trim(),
      cnpj: dados.cnpj.trim(),
      template: dados.template?.trim() ?? '',
      remetente: Boolean(dados.remetente),
      destinatario: Boolean(dados.destinatario),
    }
    database.locais_embarque = database.locais_embarque.filter((local) => local.cliente_id !== id)
    dados.locais.filter((local) => local.nome?.trim()).forEach((local, localIndex) => {
      database.locais_embarque.push({
        id: local.id ?? `${id}-loc-${Date.now()}-${localIndex + 1}`,
        cliente_id: id,
        nome: local.nome.trim(),
        endereco: local.endereco?.trim() ?? '',
        padrao: local.padrao?.trim() ?? '',
      })
    })
    return database.clientes[index]
  }
  return apiRequest(`/clientes/${id}`, { method: 'PUT', body: dados })
}

export async function removerCliente(id) {
  if (USE_MOCK) {
    await simularLatencia()
    exigir(!database.cargas.some((carga) => carga.cliente_id === id), 'Não é possível remover um cliente com cargas relacionadas.')
    database.clientes = database.clientes.filter((cliente) => cliente.id !== id)
    database.locais_embarque = database.locais_embarque.filter((local) => local.cliente_id !== id)
    return
  }
  return apiRequest(`/clientes/${id}`, { method: 'DELETE' })
}
