import { useCallback, useEffect, useState } from 'react'
import { listarUsuarios } from '../services/authService.js'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsuarios(await listarUsuarios())
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [refresh])

  return { usuarios, loading, error, refresh }
}
