// Cargas e clientes ainda usam dados simulados; autenticação já usa a API real.
export const USE_MOCK = true
// Em dev o Vite repassa /api para o back-end (vite.config.js); em produção o Nginx faz isso.
const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (!response.ok) {
    const texto = await response.text()
    let mensagem = texto
    try {
      mensagem = JSON.parse(texto).erro ?? texto
    } catch {
      // resposta não é JSON
    }
    throw new ApiError(mensagem || `Falha na API (${response.status})`, response.status)
  }

  if (response.status === 204) return null
  return response.json()
}

export function simularLatencia(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
