import { apiRequest } from './api.js'

// Perfil do usuário logado (RF16). Retorna null quando não há sessão.
export async function getMe() {
  try {
    return await apiRequest('/me')
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

export async function entrarComSenha(email, senha) {
  const { usuario } = await apiRequest('/auth/login', { method: 'POST', body: { email, senha } })
  return usuario
}

export async function cadastrarComSenha({ nome, email, senha }) {
  const { usuario } = await apiRequest('/auth/cadastro', { method: 'POST', body: { nome, email, senha } })
  return usuario
}

// credential = ID token entregue pelo botão do Google. Se o e-mail estiver
// liberado e ainda não tiver conta, o back-end cria a conta nesse momento.
export async function entrarComGoogle(credential) {
  const { usuario } = await apiRequest('/auth/google', { method: 'POST', body: { credential } })
  return usuario
}

export async function sair() {
  await apiRequest('/auth/logout', { method: 'POST' })
}

let configPromise
export function getAuthConfig() {
  configPromise ??= apiRequest('/auth/config').catch((error) => {
    configPromise = undefined
    throw error
  })
  return configPromise
}
