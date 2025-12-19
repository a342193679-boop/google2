import React, { createContext, useContext } from 'react'
import { IStorage } from '@core/io/Storage'
import { ShortcutManager } from '@core/shortcuts/ShortcutManager'
import { IAutosave } from '@core/io/Autosave'
import { useCanvasLogic, Store } from './useCanvasLogic'

export type { Store }

const Ctx = createContext<Store | null>(null)

export function CanvasProvider({ children, storage, autosave, shortcutManager }: { children: React.ReactNode; storage?: IStorage; autosave?: IAutosave; shortcutManager?: ShortcutManager }) {
  const store = useCanvasLogic({ storage, autosave, shortcutManager })
  
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCanvasStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('CanvasStore not found')
  return v
}
