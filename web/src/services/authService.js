import { database, getMockUserId, setMockUserId } from '../data/data.js'
import { apiRequest, simularLatencia, USE_MOCK } from './api.js'

export async function getMe() {
  if (USE_MOCK) {
    await simularLatencia()
    return database.usuarios.find((usuario) => usuario.id === getMockUserId()) ?? null
  }
  return apiRequest('/me')
}

export async function listarUsuarios() {
  if (USE_MOCK) {
    await simularLatencia()
    return database.usuarios
  }
  return apiRequest('/usuarios')
}

export async function entrarComGoogle(usuarioId) {
  if (USE_MOCK) {
    await simularLatencia()
    if (!database.usuarios.some((usuario) => usuario.id === usuarioId)) {
      throw new Error('Usuário de demonstração não encontrado.')
    }
    setMockUserId(usuarioId)
    return getMe()
  }
  // Integração real: o backend valida a sessão Google e devolve o perfil em GET /me.
  await apiRequest('/auth/google', { method: 'POST' })
  return getMe()
}
