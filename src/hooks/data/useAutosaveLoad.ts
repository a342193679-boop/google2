import { useEffect } from 'react'
import type { CanvasState } from '@core/types'

type StoreLike = {
  autosaveGet: () => string | null
  restoreFromJson: (text: string) => CanvasState | null
}

export function useAutosaveLoad(storeRef: React.MutableRefObject<StoreLike>, applyFromJson?: (text: string) => void) {
  useEffect(() => {
    const saved = storeRef.current.autosaveGet()
    if (saved) {
      if (applyFromJson) applyFromJson(saved)
      else storeRef.current.restoreFromJson(saved)
    }
  }, [storeRef, applyFromJson])
}

