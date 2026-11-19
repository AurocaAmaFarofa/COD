import { useCallback, useEffect, useState } from 'react'
import { entrarComGoogle, getMe } from '../services/authService.js'

export function useMe() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsuario(await getMe())
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar o usuário.')
    } finally {
      setLoading(false)
    }
  }, [])

  const entrar = useCallback(async (usuarioId) => {
    setLoading(true)
    setError('')
    try {
      setUsuario(await entrarComGoogle(usuarioId))
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível entrar.')
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [refresh])

  return { usuario, loading, error, refresh, entrar }
}
