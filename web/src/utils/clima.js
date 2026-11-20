// Converte o código do Open-Meteo (padrão WMO) em uma categoria visual.
export function categoriaDoCodigoWmo(codigo) {
  if (codigo === 0 || codigo === 1) return 'sol'
  if (codigo === 2 || codigo === 3) return 'nuvem'
  if (codigo === 45 || codigo === 48) return 'nevoeiro'
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return 'chuva'
  if ((codigo >= 71 && codigo <= 77) || (codigo >= 85 && codigo <= 86)) return 'neve'
  if (codigo >= 95) return 'tempestade'
  return 'nuvem'
}

// Converte o symbol_code do MET Norway (ex.: "rain_showers_day", "clearsky_night") em categoria.
export function categoriaDoSimboloMetNo(simbolo = '') {
  if (simbolo.includes('thunder')) return 'tempestade'
  if (simbolo.includes('snow') || simbolo.includes('sleet')) return 'neve'
  if (simbolo.includes('rain') || simbolo.includes('drizzle')) return 'chuva'
  if (simbolo.includes('fog')) return 'nevoeiro'
  if (simbolo.startsWith('clearsky') || simbolo.startsWith('fair')) return 'sol'
  return 'nuvem'
}
