import type { CanvasState } from '@core/types'
import { HistoryStack } from '@core/history/History'
import { IAutosave } from '@core/io/Autosave'
import { IStorage } from '@core/io/Storage'
import { SNAPSHOT_DEBOUNCE_MS } from '@app/state/constants'
import { compressNode } from '@core/nodeHelpers'
import { publishEvent } from '@app/plugins/events'

export type CoreSlice = {
  history: React.MutableRefObject<HistoryStack<CanvasState>>
  storage: React.MutableRefObject<IStorage>
  autosave: React.MutableRefObject<IAutosave>
  canUndo: boolean
  canRedo: boolean
  setCanUndo: (v: boolean) => void
  setCanRedo: (v: boolean) => void
  queueSnapshot: (s: CanvasState) => void
  undo: () => CanvasState | null
  redo: () => CanvasState | null
  undoApply: (restore?: (s: CanvasState) => void) => boolean
  redoApply: (restore?: (s: CanvasState) => void) => boolean
  save: (json: string) => Promise<void>
  saveAs: (json: string) => Promise<void>
  load: () => Promise<string>
  autosaveSet: (json: string) => void
  autosaveGet: () => string | null
}

export function createCoreSlice(
  history: React.MutableRefObject<HistoryStack<CanvasState>>,
  storage: React.MutableRefObject<IStorage>,
  autosave: React.MutableRefObject<IAutosave>,
  canUndo: boolean,
  setCanUndo: (v: boolean) => void,
  canRedo: boolean,
  setCanRedo: (v: boolean) => void,
  queueTimer: React.MutableRefObject<number | null>,
  batching: React.MutableRefObject<boolean>,
  pendingSnapshot: React.MutableRefObject<CanvasState | null>
): CoreSlice {

  const queueSnapshotInternal = (s: CanvasState) => {
    if (batching.current) { pendingSnapshot.current = s; return }
    if (queueTimer.current != null) window.clearTimeout(queueTimer.current)
    queueTimer.current = window.setTimeout(() => {
      history.current.push(s)
      setCanUndo(history.current.canUndo())
      setCanRedo(history.current.canRedo())
      const compressed = { ...s, nodes: s.nodes.map(compressNode) }
      autosave.current.set(JSON.stringify(compressed))
      queueTimer.current = null
      publishEvent('snapshotQueued', s)
    }, SNAPSHOT_DEBOUNCE_MS)
  }

  return {
    history,
    storage,
    autosave,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    queueSnapshot: queueSnapshotInternal,
    undo: () => history.current.undo(),
    redo: () => history.current.redoOne(),
    undoApply: (restore) => {
      const prev = history.current.undo()
      if (!prev) return false
      if (restore) restore(prev)
      return true
    },
    redoApply: (restore) => {
      const next = history.current.redoOne()
      if (!next) return false
      if (restore) restore(next)
      return true
    },
    save: async (json) => { await storage.current.saveText(json) },
    saveAs: async (json) => { await storage.current.saveAsText(json) },
    load: async () => storage.current.loadText(),
    autosaveSet: (json) => { autosave.current.set(json) },
    autosaveGet: () => autosave.current.get(),
  }
}
