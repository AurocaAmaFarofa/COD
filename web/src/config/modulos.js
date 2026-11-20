export const MODULOS = [
  { id: 'comercial', nome: 'Comercial', habilitado: true },
  { id: 'contratacao', nome: 'Contratação', habilitado: true },
  { id: 'gr', nome: 'Gerenciamento de Risco', habilitado: false },
  { id: 'embarque', nome: 'Embarque', habilitado: false },
  { id: 'documental', nome: 'Documental', habilitado: false },
]

export const MODULOS_ATIVOS = MODULOS.filter((modulo) => modulo.habilitado)

export const STATUS_CARGA = {
  EM_ANDAMENTO: 'em_andamento',
  CANCELADA: 'cancelada',
}
