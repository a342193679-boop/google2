import { useEffect, useState, useCallback } from 'react'
import { subscribeEvent } from '@app/plugins/events'

type Toast = { message: string; type: 'success' | 'error' | 'info' | 'loading' } | null

export function useToast() {
  const [toast, setToast] = useState<Toast>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'loading') => {
    setToast({ message, type })
    if (type !== 'loading') {
      window.setTimeout(() => setToast(null), 1600)
    }
  }, [])

  useEffect(() => {
    const unsub = subscribeEvent('notify', (p: any) => {
      if (!p || !p.message) return
      const t = (p.type === 'error' || p.type === 'warning') ? 'error' : (p.type || 'info')
      showToast(p.message, t)
    })
    return () => { try { unsub() } catch {} }
  }, [showToast])

  return { toast, showToast }
}

