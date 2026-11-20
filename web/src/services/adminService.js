import { apiRequest } from './api.js'

// Monta a query string ignorando filtros vazios.
function query(params = {}) {
  const busca = new URLSearchParams(
    Object.entries(params).filter(([, valor]) => valor !== '' && valor !== undefined && valor !== null),
  )
  const texto = busca.toString()
  return texto ? `?${texto}` : ''
}

// Todas as rotas exigem administrador no servidor (/api/admin/*).
export const adminApi = {
  resumo: () => apiRequest('/admin/resumo'),
  modulos: () => apiRequest('/admin/modulos'),

  listarUsuarios: (busca = '') => apiRequest(`/admin/usuarios${query({ busca })}`),
  alterarUsuario: (id, dados) => apiRequest(`/admin/usuarios/${id}`, { method: 'PATCH', body: dados }),
  definirModulosUsuario: (id, dados) =>
    apiRequest(`/admin/usuarios/${id}/modulos`, { method: 'PUT', body: dados }),

  listarAllowlist: () => apiRequest('/admin/allowlist'),
  gerarConvite: (email) =>
    apiRequest(`/admin/allowlist/${encodeURIComponent(email)}/convite`, { method: 'POST' }),
  adicionarAllowlist: (dados) => apiRequest('/admin/allowlist', { method: 'POST', body: dados }),
  alterarAllowlist: (email, dados) =>
    apiRequest(`/admin/allowlist/${encodeURIComponent(email)}`, { method: 'PUT', body: dados }),
  removerAllowlist: (email, dados) =>
    apiRequest(`/admin/allowlist/${encodeURIComponent(email)}`, { method: 'DELETE', body: dados }),

  auditoria: (filtros) => apiRequest(`/admin/auditoria${query(filtros)}`),
  eventosAuditoria: () => apiRequest('/admin/auditoria/eventos'),

  tabelas: () => apiRequest('/admin/tabelas'),
  tabela: (nome, filtros) => apiRequest(`/admin/tabelas/${encodeURIComponent(nome)}${query(filtros)}`),
}

export function formatarDataHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })
}

// Rótulos amigáveis dos eventos gravados pelo back-end.
export const ROTULOS_EVENTOS = {
  login_ok: 'Login',
  login_negado: 'Login negado',
  bloqueio: 'Bloqueio por tentativas',
  cadastro: 'Conta criada',
  cadastro_negado: 'Cadastro negado',
  usuario_alterado: 'Usuário alterado',
  modulos_alterados: 'Módulos alterados',
  allowlist_adicionado: 'Adicionado à allowlist',
  allowlist_alterado: 'Allowlist alterada',
  allowlist_removido: 'Removido da allowlist',
  convite_gerado: 'Convite gerado',
  logout: 'Saiu do sistema',
}

export function rotuloEvento(evento) {
  return ROTULOS_EVENTOS[evento] ?? evento
}
