import { useEffect, useState } from 'react'
import { categoriaDoCodigoWmo, categoriaDoSimboloMetNo } from '../utils/clima.js'

// Clima atual na localização do próprio usuário (permissão do navegador).
// Se a localização falhar, usa a aproximada pelo IP.
// Se o Open-Meteo estiver fora (ele retorna 503 às vezes), usa o MET Norway.
// Só coordenadas são enviadas aos serviços.
const ATUALIZA_A_CADA_MS = 10 * 60 * 1000

async function comTentativas(funcao, tentativas = 2) {
  let ultimoErro
  for (let i = 0; i < tentativas; i += 1) {
    try {
      return await funcao()
    } catch (erro) {
      ultimoErro = erro
    }
  }
  throw ultimoErro
}

async function climaOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`open-meteo ${resposta.status}`)
  const dados = await resposta.json()
  return {
    temperatura: Math.round(dados.current.temperature_2m),
    categoria: categoriaDoCodigoWmo(dados.current.weather_code),
  }
}

async function climaMetNo(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`met.no ${resposta.status}`)
  const dados = await resposta.json()
  const agora = dados.properties.timeseries[0]
  return {
    temperatura: Math.round(agora.data.instant.details.air_temperature),
    categoria: categoriaDoSimboloMetNo(agora.data.next_1_hours?.summary?.symbol_code),
  }
}

async function buscarClima(lat, lon) {
  try {
    return await comTentativas(() => climaOpenMeteo(lat, lon))
  } catch {
    return comTentativas(() => climaMetNo(lat, lon))
  }
}

async function buscarCidade(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=pt-BR&lat=${lat}&lon=${lon}`
    const resposta = await fetch(url)
    const dados = await resposta.json()
    const endereco = dados.address ?? {}
    return endereco.city ?? endereco.town ?? endereco.village ?? endereco.municipality ?? ''
  } catch {
    return ''
  }
}

function localizacaoPeloNavegador() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('sem geolocalização'))
    navigator.geolocation.getCurrentPosition(
      (posicao) => resolve({ lat: posicao.coords.latitude, lon: posicao.coords.longitude }),
      reject,
      { timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  })
}

async function localizacaoPeloIp() {
  const resposta = await fetch('https://ipapi.co/json/')
  const dados = await resposta.json()
  return { lat: dados.latitude, lon: dados.longitude, cidade: dados.city ?? '' }
}

export function useClima() {
  const [clima, setClima] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false

    async function atualizar() {
      try {
        let local
        try {
          local = await localizacaoPeloNavegador()
        } catch {
          local = await localizacaoPeloIp()
        }
        const [tempo, cidade] = await Promise.all([
          buscarClima(local.lat, local.lon),
          local.cidade ? Promise.resolve(local.cidade) : buscarCidade(local.lat, local.lon),
        ])
        if (!cancelado) {
          setClima({ ...tempo, cidade })
          setErro('')
        }
      } catch (falha) {
        if (!cancelado) {
          setClima(null)
          setErro(falha.message || 'erro')
        }
      }
    }

    atualizar()
    const intervalo = setInterval(atualizar, ATUALIZA_A_CADA_MS)
    return () => {
      cancelado = true
      clearInterval(intervalo)
    }
  }, [])

  return { clima, erro }
}
