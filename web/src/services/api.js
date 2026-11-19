export const USE_MOCK = true
const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Falha na API (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

export function simularLatencia(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
