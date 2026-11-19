import { useCallback, useEffect, useState } from 'react'
import { listarClientes } from '../services/clientesService.js'

export function useCatalogos() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setClientes(await listarClientes())
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os cadastros.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [refresh])

  return { clientes, loading, error, refresh }
}
