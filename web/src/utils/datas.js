// Data no formato AAAA-MM-DD no fuso local (evita o deslocamento de dia do toISOString em UTC).
export function dataLocalISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function prefixoMes(data) {
  return dataLocalISO(data).slice(0, 7)
}

export function mesAnterior(data) {
  return new Date(data.getFullYear(), data.getMonth() - 1, 1)
}
