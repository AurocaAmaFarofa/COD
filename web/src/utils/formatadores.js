import { MODULOS_ATIVOS } from '../config/modulos.js'

export function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(data))
}

export function nomeModulo(id) {
  return MODULOS_ATIVOS.find((modulo) => modulo.id === id)?.nome ?? id
}

export function moeda(valor) {
  if (valor == null || valor === '') return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
}
