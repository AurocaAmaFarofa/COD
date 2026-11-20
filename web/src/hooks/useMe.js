import { useCallback, useEffect, useState } from 'react'
import { getMe, sair as sairDaApi } from '../services/authService.js'

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

  // Recebe o perfil devolvido pelo login/cadastro.
  const definirUsuario = useCallback((perfil) => {
    setError('')
    setUsuario(perfil)
  }, [])

  const sair = useCallback(async () => {
    try {
      await sairDaApi()
    } finally {
      setUsuario(null)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [refresh])

  return { usuario, loading, error, refresh, definirUsuario, sair }
}
