import { useCallback, useEffect, useState } from 'react'
import * as cargasService from '../services/cargasService.js'

export function useCargas() {
  const [cargas, setCargas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCargas(await cargasService.listarCargas())
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
    // TODO: ativar polling periódico quando a API suportar atualização concorrente.
  }, [refresh])

  return {
    cargas,
    loading,
    error,
    refresh,
    criar: (dados) => executar(cargasService.criarCarga, dados),
    atualizar: (id, dados) => executar(cargasService.atualizarCarga, id, dados),
    cancelar: (id, motivo) => executar(cargasService.cancelarCarga, id, motivo),
  }
}
