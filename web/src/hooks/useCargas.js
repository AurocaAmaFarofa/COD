import { useCallback, useEffect, useState } from 'react'
import * as cargasService from '../services/cargasService.js'

export function useCargas() {
  const [cargas, setCargas] = useState([])
  const [cancelamentos, setCancelamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [lista, cancelados] = await Promise.all([
        cargasService.listarCargas(),
        cargasService.listarCancelamentos(),
      ])
      setCargas(lista)
      setCancelamentos(cancelados)
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar as cargas.')
    } finally {
      setLoading(false)
    }
  }, [])

  const executar = useCallback(async (operacao, ...args) => {
    const resultado = await operacao(...args)
    await refresh()
    return resultado
  }, [refresh])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [refresh])

  return {
    cargas,
    cancelamentos,
    loading,
    error,
    refresh,
    criar: (dados) => executar(cargasService.criarCarga, dados),
    atualizar: (id, dados) => executar(cargasService.atualizarCarga, id, dados),
    mover: (id, destino) => executar(cargasService.moverCarga, id, destino),
    cancelar: (id, motivo) => executar(cargasService.cancelarCarga, id, motivo),
  }
}
