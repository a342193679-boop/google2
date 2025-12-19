import type { Dispatch } from 'react'
import type { GridConfig, NodeData } from '@core/types'
import type { Action, UIState } from '@app/state/uiReducer'
import { createUiActions } from '@app/state/actions/ui'
import { createCanvasActions } from '@app/state/actions/canvas'
import { publishEvent } from '@app/plugins/events'
import { selectNodesInBox } from '@core/geometry/Intersect'

export type UISlice = {
  ui: UIState
  beginDrag: (selectedIds: Set<string>, start: { x: number; y: number }) => void
  dragFrame: (latest: { x: number; y: number }) => void
  endDrag: () => void
  beginSelection: (start: { x: number; y: number }) => void
  updateSelection: (latest: { x: number; y: number }) => void
  endSelection: () => void
  setSelected: (ids: Set<string>) => void
  clearSelected: () => void
  toggleSelected: (id: string) => void
  toggleCollision: () => void
  setCollisionEnabled: (v: boolean) => void
  toggleSnapOnRelease: () => void
  setConfig: (cfg: GridConfig) => void
  setShowDebugGrid: (v: boolean) => void
  toggleShowDebugGrid: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: 'general' | 'node') => void
  setPanning: (v: boolean) => void
  setSpacePressed: (v: boolean) => void
  setShortcutKey: (id: string, key: string) => void
  setComboShortcutKey: (id: string, key: string) => void
  setRafId: (id: number) => void
  clearRafId: () => void
  startEditing: (id: string, initialPos: number | null) => void
  stopEditing: () => void
  consumeInitialCursor: () => void
  setMousePos: (pos: { x: number; y: number }) => void
  
  // Canvas Actions
  setPan: (p: { x: number; y: number }) => void
  setScale: (s: number) => void
  setPanScale: (p: { x: number; y: number }, s: number) => void
  zoomAtPoint: (rect: DOMRect, clientX: number, clientY: number, deltaY: number, min?: number, max?: number, speed?: number) => void
  focusTo: (containerW: number, containerH: number, nodes: NodeData[], selectedIds: Set<string>) => void
  getCanvasPoint: (rect: DOMRect, clientX: number, clientY: number) => { x: number; y: number }
  
  // Computed
  computeSelectionByBox: (nodes: NodeData[], box: { x: number; y: number; w: number; h: number }, prevSelected: Set<string>, additive: boolean) => Set<string>
}

export function createUISlice(
  ui: UIState,
  dispatch: Dispatch<Action>,
  queueSnapshot: () => void
): UISlice {
  const uiActions = createUiActions(dispatch, queueSnapshot)
  const canvasActions = createCanvasActions(dispatch, { pan: ui.pan, scale: ui.scale })

  return {
    ui,
    beginDrag: (_ids, start) => uiActions.beginDrag(start),
    dragFrame: (latest) => uiActions.dragFrame(latest),
    endDrag: () => uiActions.endDrag(),
    beginSelection: (start) => uiActions.beginSelection(start),
    updateSelection: (latest) => uiActions.updateSelection(latest),
    endSelection: () => uiActions.endSelection(),
    setSelected: (ids) => { uiActions.setSelected(ids); publishEvent('selectionChanged', { ids: Array.from(ids) }) },
    clearSelected: () => { uiActions.clearSelected() },
    toggleSelected: (id) => { uiActions.toggleSelected(id) },
    toggleCollision: uiActions.toggleCollision,
    setCollisionEnabled: uiActions.setCollisionEnabled,
    toggleSnapOnRelease: () => { uiActions.toggleSnapOnRelease() },
    setConfig: (cfg) => { uiActions.setConfig(cfg); publishEvent('configChanged', { cfg }) },
    setShowDebugGrid: uiActions.setShowDebugGrid,
    toggleShowDebugGrid: uiActions.toggleShowDebugGrid,
    setSidebarOpen: uiActions.setSidebarOpen,
    setActiveTab: uiActions.setActiveTab,
    setPanning: uiActions.setPanning,
    setSpacePressed: uiActions.setSpacePressed,
    setShortcutKey: uiActions.setShortcutKey,
    setComboShortcutKey: uiActions.setComboShortcutKey,
    setRafId: uiActions.setRafId,
    clearRafId: uiActions.clearRafId,
    startEditing: uiActions.startEditing,
    stopEditing: uiActions.stopEditing,
    consumeInitialCursor: uiActions.consumeInitialCursor,
    setMousePos: uiActions.setMousePos,

    setPan: canvasActions.setPan,
    setScale: canvasActions.setScale,
    setPanScale: canvasActions.setPanScale,
    zoomAtPoint: canvasActions.zoomAtPoint,
    focusTo: canvasActions.focusTo,
    getCanvasPoint: canvasActions.getCanvasPoint,

    computeSelectionByBox: (nodes, box, prevSelected, additive) => {
      const selected = selectNodesInBox(nodes, box)
      const next = new Set<string>(additive ? prevSelected : [])
      selected.forEach(id => next.add(id))
      return next
    },
  }
}
