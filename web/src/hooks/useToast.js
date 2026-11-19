import { useCallback, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
    // TODO: definir regra do alerta com o cliente
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, notify, dismiss }
}
