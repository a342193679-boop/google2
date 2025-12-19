import { useRef, useState, useReducer, useEffect, useMemo, useCallback } from 'react'
import type { CanvasState, NodeData, ShortcutCallbacks } from '@core/types'
import { HistoryStack } from '@core/history/History'
import { createStorage, IStorage } from '@core/io/Storage'
import { ShortcutManager } from '@core/shortcuts/ShortcutManager'
import { reducer as uiReducer, buildInitialUI } from '@app/state/uiReducer'
import { createAutosave, IAutosave } from '@core/io/Autosave'
import { AUTOSAVE_KEY } from '@app/state/constants'

// Slices
import { createCoreSlice, CoreSlice } from './slices/CoreSlice'
import { createNodesSlice, NodesSlice } from './slices/NodesSlice'
import { createUISlice, UISlice } from './slices/UISlice'

// Hooks
import { useCanvasPersistence } from './hooks/useCanvasPersistence'
import { useCanvasShortcuts } from './hooks/useCanvasShortcuts'

export type Store = CoreSlice & NodesSlice & UISlice & {
  restoreState: (s: CanvasState) => void
  restoreFromJson: (text: string) => CanvasState | null
  loadAndRestore: () => Promise<boolean>
  registerShortcuts: (cbs: ShortcutCallbacks) => void
  buildPlainShortcuts: (cbs: ShortcutCallbacks) => Record<string, () => void>
  getSnapshot: () => CanvasState
}

type UseCanvasLogicProps = {
  storage?: IStorage
  autosave?: IAutosave
  shortcutManager?: ShortcutManager
}

export function useCanvasLogic({ storage: storageProp, autosave: autosaveProp, shortcutManager }: UseCanvasLogicProps): Store {
  // --- Core Refs ---
  const history = useRef(new HistoryStack<CanvasState>(100))
  const storage = useRef<IStorage>(storageProp ?? createStorage())
  const autosave = useRef<IAutosave>(autosaveProp ?? createAutosave(AUTOSAVE_KEY))
  const shortcuts = useRef<ShortcutManager | null>(shortcutManager ?? null)
  const queueTimer = useRef<number | null>(null)
  const batching = useRef(false)
  const pendingSnapshot = useRef<CanvasState | null>(null)

  // --- State ---
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [ui, dispatch] = useReducer(uiReducer, buildInitialUI())

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      shortcuts.current?.unregister()
      if (queueTimer.current != null) {
        window.clearTimeout(queueTimer.current)
        queueTimer.current = null
      }
    }
  }, [])

  // --- Helpers ---
  const buildSnapshot = useCallback((): CanvasState => ({ 
    nodes, 
    config: ui.config, 
    scale: ui.scale, 
    pan: ui.pan, 
    showDebugGrid: ui.showDebugGrid, 
    selectedNodeIds: Array.from(ui.selectedNodeIds), 
    collisionEnabled: ui.collisionEnabled 
  }), [nodes, ui])

  // --- Slices ---
  const coreSlice = useMemo(() => createCoreSlice(
    history, storage, autosave, 
    canUndo, setCanUndo, canRedo, setCanRedo, 
    queueTimer, batching, pendingSnapshot
  ), [canUndo, canRedo])

  const persistence = useCanvasPersistence(setNodes, dispatch, coreSlice.queueSnapshot, storage)
  const persistenceMemo = useMemo(() => persistence, [persistence.restoreState, persistence.restoreFromJson, persistence.loadAndRestore])

  const nodesSlice = useMemo(() => createNodesSlice(
    nodes, setNodes, 
    { selectedNodeIds: ui.selectedNodeIds, config: ui.config, snapOnRelease: ui.snapOnRelease }, 
    dispatch, 
    () => coreSlice.queueSnapshot(buildSnapshot()),
    buildSnapshot
  ), [nodes, ui.selectedNodeIds, ui.config, ui.snapOnRelease, coreSlice, buildSnapshot])

  const uiSlice = useMemo(() => createUISlice(
    ui, dispatch, 
    () => coreSlice.queueSnapshot(buildSnapshot())
  ), [ui, coreSlice, buildSnapshot])
  
  const { registerShortcuts, buildPlainShortcuts } = useCanvasShortcuts(
    shortcuts, 
    { 
      shortcutMap: ui.shortcutMap, 
      comboShortcutMap: ui.comboShortcutMap, 
      editingNodeId: ui.editingNodeId 
    }, 
    nodesSlice, 
    uiSlice
  )

  const shortcutsMemo = useMemo(() => ({ registerShortcuts, buildPlainShortcuts }), [registerShortcuts, buildPlainShortcuts])

  // --- Store Composition ---
  const store: Store = useMemo(() => ({
    ...coreSlice,
    ...nodesSlice,
    ...uiSlice,
    ...persistenceMemo,
    ...shortcutsMemo,
    getSnapshot: buildSnapshot,
    // Override undo/redo apply to use restoreStateImpl
    undoApply: () => coreSlice.undoApply(persistenceMemo.restoreState),
    redoApply: () => coreSlice.redoApply(persistenceMemo.restoreState),
  }), [
    coreSlice,
    nodesSlice,
    uiSlice,
    persistenceMemo,
    shortcutsMemo,
    buildSnapshot
  ])

  return store
}
