import React, { createContext, useContext, useMemo, useRef, useState, useReducer, useEffect } from 'react'
import type { NodeData, GridConfig, Point, NodeStyle } from '@core/types'
import { DEFAULT_CONFIG, DEFAULT_NODE_STYLE } from '@core/config'
import { computeDragStep } from '@core/canvas/DragStep'
import type { CanvasState } from '@core/types'
import { HistoryStack } from '@core/history/History'
import { createStorage, IStorage } from '@core/io/Storage'
import { ShortcutManager } from '@core/shortcuts/ShortcutManager'
import { selectNodesInBox } from '@core/geometry/Intersect'
import { computeFocus } from '@core/canvas/Focus'
import { zoomAtPoint as coreZoomAtPoint } from '@core/canvas/PanZoom'
import { getCanvasPoint as coreGetCanvasPoint } from '@core/canvas/Coords'
import { makeNode } from '@core/text/NodeFactory'
import { calculateNodeSize as measureNode } from '@core/text/Measure'
import { reducer as uiReducer, buildInitialUI } from '@app/state/uiReducer'
import { createAutosave, IAutosave } from '@core/io/Autosave'
import { AUTOSAVE_KEY, SHORTCUT_KEY } from '@app/state/constants'
import { safeSetItem } from '@core/io/LocalStorage'

type ShortcutCallbacks = {
  onSave: () => void
  onSaveAs: () => void
  onLoad: () => void
  onUndo: () => void
  onRedo: () => void
  onPlain?: Record<string, () => void>
}

type Store = {
  nodes: NodeData[]
  setNodes: (updater: (prev: NodeData[]) => NodeData[]) => void
  restoreState: (s: CanvasState) => void
  restoreFromJson: (text: string) => CanvasState | null
  pushHistory: (state: CanvasState) => void
  undo: () => CanvasState | null
  redo: () => CanvasState | null
  undoApply: () => boolean
  redoApply: () => boolean
  canUndo: boolean
  canRedo: boolean
  save: (json: string) => Promise<void>
  saveAs: (json: string) => Promise<void>
  load: () => Promise<string>
  loadAndRestore: () => Promise<boolean>
  autosaveSet: (json: string) => void
  autosaveGet: () => string | null
  registerShortcuts: (cbs: ShortcutCallbacks) => void
  queueSnapshot: (state: CanvasState) => void
  beginDrag: (selectedIds: Set<string>, start: { x: number; y: number }) => void
  dragFrame: (latest: { x: number; y: number }) => void
  endDrag: () => void
  beginSelection: (start: { x: number; y: number }) => void
  updateSelection: (latest: { x: number; y: number }) => void
  endSelection: () => void
  setPan: (p: { x: number; y: number }) => void
  setScale: (s: number) => void
  setPanScale: (p: { x: number; y: number }, s: number) => void
  zoomAtPoint: (rect: DOMRect, clientX: number, clientY: number, deltaY: number, min?: number, max?: number, speed?: number) => void
  focusTo: (containerW: number, containerH: number, nodes: NodeData[], selectedIds: Set<string>) => void
  getCanvasPoint: (rect: DOMRect, clientX: number, clientY: number) => { x: number; y: number }
  computeSelectionByBox: (nodes: NodeData[], box: { x: number; y: number; w: number; h: number }, prevSelected: Set<string>, additive: boolean) => Set<string>
  setSelected: (ids: Set<string>) => void
  clearSelected: () => void
  toggleSelected: (id: string) => void
  deleteSelected: () => void
  toggleCollision: () => void
  setCollisionEnabled: (v: boolean) => void
  updateSelectedNodes: (updates: Partial<NodeStyle>, config: GridConfig) => void
  updateNodeText: (id: string, newText: string, config: GridConfig) => void
  recalcAllNodeSizes: (config: GridConfig) => void
  createNodeAt: (text: string, x: number, y: number, style: NodeStyle, config: GridConfig) => NodeData
  createDefaultNodeAt: (text: string, x: number, y: number) => NodeData
  snapSelectedToGrid: (config: GridConfig) => void
  setConfig: (cfg: GridConfig) => void
  setShowDebugGrid: (v: boolean) => void
  toggleShowDebugGrid: () => void
  addNode: (node: NodeData, select?: boolean) => void
  endDragAndSnap: (config: GridConfig) => void
  alignSelectedLeft: () => void
  alignSelectedTop: () => void
  alignSelectedRight: () => void
  alignSelectedBottom: () => void
  distributeSelectedHorizontally: () => void
  distributeSelectedVertically: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: 'general' | 'node') => void
  setPanning: (v: boolean) => void
  setSpacePressed: (v: boolean) => void
  setShortcutKey: (id: string, key: string) => void
  buildPlainShortcuts: () => Record<string, () => void>
  ui: {
    isDragging: boolean
    isSelecting: boolean
    selectionStart: { x: number; y: number } | null
    selectionBox: { x: number; y: number; w: number; h: number } | null
    rafId: number | null
    latestMousePos: { x: number; y: number }
    editingNodeId: string | null
    initialCursorPos: number | null
    pan: { x: number; y: number }
    scale: number
    selectedNodeIds: Set<string>
    collisionEnabled: boolean
    config: GridConfig
    showDebugGrid: boolean
    sidebarOpen: boolean
    activeTab: 'general' | 'node'
    isPanning: boolean
    isSpacePressed: boolean
    shortcutMap: Record<string, string>
  }
  setRafId: (id: number) => void
  clearRafId: () => void
  startEditing: (id: string, initialPos: number | null) => void
  stopEditing: () => void
  consumeInitialCursor: () => void
  applyDragFrame: (
    nodes: NodeData[],
    selectedIds: Set<string>,
    config: GridConfig,
    collisionEnabled: boolean,
    lastMousePos: Point,
    updateNodes: (updater: (prev: NodeData[]) => NodeData[]) => void,
    setLastMousePos: (p: Point) => void,
  ) => void
}

const Ctx = createContext<Store | null>(null)

export function CanvasProvider({ children, storage: storageProp, autosave: autosaveProp, shortcutManager }: { children: React.ReactNode; storage?: IStorage; autosave?: IAutosave; shortcutManager?: ShortcutManager }) {
  const history = useRef(new HistoryStack<CanvasState>(100))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const storage = useRef<IStorage>(storageProp ?? createStorage())
  const autosave = useRef<IAutosave>(autosaveProp ?? createAutosave(AUTOSAVE_KEY))
  const shortcuts = useRef<ShortcutManager | null>(shortcutManager ?? null)
  const queueTimer = useRef<number | null>(null)
  const [nodes, setNodes] = useState<NodeData[]>([])

  const [ui, dispatch] = useReducer(uiReducer, buildInitialUI())

  useEffect(() => {
    return () => { shortcuts.current?.unregister() }
  }, [])

  const buildSnapshot = (): CanvasState => ({ nodes, config: ui.config, scale: ui.scale, pan: ui.pan, showDebugGrid: ui.showDebugGrid, selectedNodeIds: Array.from(ui.selectedNodeIds), collisionEnabled: ui.collisionEnabled })
  const batching = useRef(false)
  const pendingSnapshot = useRef<CanvasState | null>(null)
  const queueSnapshotInternal = (s: CanvasState) => {
    if (batching.current) { pendingSnapshot.current = s; return }
    if (queueTimer.current != null) window.clearTimeout(queueTimer.current)
    queueTimer.current = window.setTimeout(() => {
      history.current.push(s)
      setCanUndo(history.current.canUndo())
      setCanRedo(history.current.canRedo())
      autosave.current.set(JSON.stringify(s))
      queueTimer.current = null
    }, 300)
  }

  const restoreStateImpl = (s: CanvasState) => {
    const seen = new Set<string>()
    const fixed = s.nodes.map(n => {
      let id = n.id
      if (seen.has(id)) id = `${id}-${Math.random().toString(36).slice(2,6)}`
      seen.add(id)
      const size = measureNode(n.text, n, s.config)
      return { ...n, id, ...size }
    })
    setNodes(() => fixed)
    dispatch({ type: 'PAN_SCALE_SET', pan: s.pan, scale: s.scale })
    dispatch({ type: 'SELECT_SET_IDS', ids: new Set(s.selectedNodeIds) })
    dispatch({ type: 'COLLISION_SET', v: s.collisionEnabled })
    dispatch({ type: 'CONFIG_SET', cfg: s.config })
    dispatch({ type: 'SHOW_DEBUG_SET', v: s.showDebugGrid })
  }

  const store: Store = useMemo(() => ({
    nodes,
    setNodes: (updater) => { setNodes(prev => updater(prev)) },
    restoreState: (s: CanvasState) => { restoreStateImpl(s) },
    restoreFromJson: (text: string) => {
      try {
        const obj = JSON.parse(text)
        const next: CanvasState = {
          nodes: obj.nodes || [],
          config: obj.config || DEFAULT_CONFIG,
          scale: obj.scale ?? 3,
          pan: obj.pan || { x: 0, y: 0 },
          showDebugGrid: obj.showDebugGrid ?? false,
          selectedNodeIds: obj.selectedNodeIds || [],
          collisionEnabled: obj.collisionEnabled ?? true,
        }
        restoreStateImpl(next)
        queueSnapshotInternal(next)
        return next
      } catch {
        return null
      }
    },
    pushHistory: (s: CanvasState) => {
      history.current.push(s)
      setCanUndo(history.current.canUndo())
      setCanRedo(history.current.canRedo())
    },
    undo: () => history.current.undo(),
    redo: () => history.current.redoOne(),
    undoApply: () => {
      const prev = history.current.undo()
      if (!prev) return false
      restoreStateImpl(prev)
      return true
    },
    redoApply: () => {
      const next = history.current.redoOne()
      if (!next) return false
      restoreStateImpl(next)
      return true
    },
    canUndo,
    canRedo,
    save: async (json: string) => { await storage.current.saveText(json) },
    saveAs: async (json: string) => { await storage.current.saveAsText(json) },
    load: async () => storage.current.loadText(),
    loadAndRestore: async () => {
      try {
        const text = await storage.current.loadText()
        const res = (text != null) ? store.restoreFromJson(text) : null
        return !!res
      } catch {
        return false
      }
    },
    autosaveSet: (json: string) => { autosave.current.set(json) },
    autosaveGet: () => autosave.current.get(),
    registerShortcuts: (cbs: ShortcutCallbacks) => {
      if (!shortcuts.current) {
        shortcuts.current = new ShortcutManager(cbs)
        shortcuts.current.register()
      } else {
        shortcuts.current.update(cbs)
      }
    },
    beginBatch: () => { batching.current = true },
    endBatch: () => { batching.current = false; if (pendingSnapshot.current) { const s = pendingSnapshot.current; pendingSnapshot.current = null; queueSnapshotInternal(s) } },
    batchRun: (fn: () => void) => { batching.current = true; try { fn() } finally { batching.current = false; if (pendingSnapshot.current) { const s = pendingSnapshot.current; pendingSnapshot.current = null; queueSnapshotInternal(s) } } },
    queueSnapshot: (s: CanvasState) => { queueSnapshotInternal(s) },
    beginDrag: (_ids, start) => { dispatch({ type: 'DRAG_BEGIN', start }) },
    dragFrame: (latest) => { dispatch({ type: 'DRAG_FRAME', latest }) },
    endDrag: () => { dispatch({ type: 'DRAG_END' }) },
    beginSelection: (start) => { dispatch({ type: 'SELECT_BEGIN', start }) },
    updateSelection: (latest) => { dispatch({ type: 'SELECT_UPDATE', latest }) },
    endSelection: () => { dispatch({ type: 'SELECT_END' }) },
    setPan: (p) => { dispatch({ type: 'PAN_SET', pan: p }) },
    setScale: (s) => { dispatch({ type: 'SCALE_SET', scale: s }) },
    setPanScale: (p, s) => { dispatch({ type: 'PAN_SCALE_SET', pan: p, scale: s }) },
    zoomAtPoint: (rect, clientX, clientY, deltaY, min = 0.1, max = 10, speed = 0.001) => {
      const res = coreZoomAtPoint(ui.scale, ui.pan, rect, clientX, clientY, deltaY, min, max, speed)
      dispatch({ type: 'PAN_SCALE_SET', pan: res.pan, scale: res.scale })
    },
    focusTo: (containerW, containerH, nodes, selectedIds) => {
      const res = computeFocus(containerW, containerH, nodes, selectedIds)
      dispatch({ type: 'PAN_SCALE_SET', pan: res.pan, scale: res.scale })
    },
    getCanvasPoint: (rect, clientX, clientY) => coreGetCanvasPoint(rect, ui.pan, ui.scale, clientX, clientY),
    computeSelectionByBox: (nodes, box, prevSelected, additive) => {
      const selected = selectNodesInBox(nodes, box)
      const next = new Set<string>(additive ? prevSelected : [])
      selected.forEach(id => next.add(id))
      return next
    },
    setSelected: (ids) => { dispatch({ type: 'SELECT_SET_IDS', ids }) },
    clearSelected: () => { dispatch({ type: 'SELECT_CLEAR_IDS' }) },
    toggleSelected: (id) => { dispatch({ type: 'SELECT_TOGGLE_ID', id }) },
    deleteSelected: () => {
      const ids = ui.selectedNodeIds
      setNodes(prev => prev.filter(n => !ids.has(n.id)))
      dispatch({ type: 'SELECT_CLEAR_IDS' })
      queueSnapshotInternal(buildSnapshot())
    },
    toggleCollision: () => { dispatch({ type: 'COLLISION_TOGGLE' }) },
    setCollisionEnabled: (v) => { dispatch({ type: 'COLLISION_SET', v }) },
    updateSelectedNodes: (updates, config) => {
      setNodes(prev => prev.map(node => {
        if (ui.selectedNodeIds.has(node.id)) {
          const newStyle = { ...node, ...updates }
          const newSize = measureNode(node.text, newStyle, config)
          return { ...newStyle, ...newSize }
        }
        return node
      }))
      queueSnapshotInternal(buildSnapshot())
    },
    updateNodeText: (id, newText, config) => {
      setNodes(prev => prev.map(n => {
        if (n.id === id) {
          const size = measureNode(newText, n, config)
          return { ...n, text: newText, ...size }
        }
        return n
      }))
      queueSnapshotInternal(buildSnapshot())
    },
    recalcAllNodeSizes: (config) => {
      setNodes(prev => prev.map(node => {
        const size = measureNode(node.text, node, config)
        return { ...node, ...size }
      }))
      queueSnapshotInternal(buildSnapshot())
    },
    createNodeAt: (text, x, y, style, config) => {
      const node = makeNode(text, x, y, style, config)
      return node
    },
    createDefaultNodeAt: (text, x, y) => {
      return makeNode(text, x, y, { ...DEFAULT_NODE_STYLE }, ui.config)
    },
    snapSelectedToGrid: (config) => {
      setNodes(prev => prev.map(n => (
        ui.selectedNodeIds.has(n.id)
          ? { ...n, x: Math.round(n.x / config.baseUnit) * config.baseUnit, y: Math.round(n.y / config.baseUnit) * config.baseUnit }
          : n
      )))
      queueSnapshotInternal(buildSnapshot())
    },
    addNode: (node, select = false) => {
      const existing = new Set(nodes.map(n => n.id))
      let n = node
      if (existing.has(n.id)) {
        n = { ...n, id: `${n.id}-${Math.random().toString(36).slice(2,6)}` }
      }
      setNodes(prev => [...prev, n])
      if (select) dispatch({ type: 'SELECT_SET_IDS', ids: new Set([node.id]) })
      queueSnapshotInternal(buildSnapshot())
    },
    endDragAndSnap: (config) => {
      dispatch({ type: 'DRAG_END' })
      setNodes(prev => prev.map(n => (
        ui.selectedNodeIds.has(n.id)
          ? { ...n, x: Math.round(n.x / config.baseUnit) * config.baseUnit, y: Math.round(n.y / config.baseUnit) * config.baseUnit }
          : n
      )))
      queueSnapshotInternal(buildSnapshot())
    },
    alignSelectedLeft: () => {
      const ids = ui.selectedNodeIds
      if (ids.size === 0) return
      let minX = Infinity
      nodes.forEach(n => { if (ids.has(n.id)) minX = Math.min(minX, n.x) })
      setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, x: minX } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    alignSelectedTop: () => {
      const ids = ui.selectedNodeIds
      if (ids.size === 0) return
      let minY = Infinity
      nodes.forEach(n => { if (ids.has(n.id)) minY = Math.min(minY, n.y) })
      setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, y: minY } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    alignSelectedRight: () => {
      const ids = ui.selectedNodeIds
      if (ids.size === 0) return
      let maxRight = -Infinity
      nodes.forEach(n => { if (ids.has(n.id)) maxRight = Math.max(maxRight, n.x + n.width) })
      setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, x: maxRight - n.width } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    alignSelectedBottom: () => {
      const ids = ui.selectedNodeIds
      if (ids.size === 0) return
      let maxBottom = -Infinity
      nodes.forEach(n => { if (ids.has(n.id)) maxBottom = Math.max(maxBottom, n.y + n.height) })
      setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, y: maxBottom - n.height } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    distributeSelectedHorizontally: () => {
      const ids = Array.from(ui.selectedNodeIds)
      if (ids.length <= 2) return
      const selectedNodes = nodes.filter(n => ui.selectedNodeIds.has(n.id)).sort((a,b)=>a.x - b.x)
      const first = selectedNodes[0]
      const last = selectedNodes[selectedNodes.length - 1]
      const totalWidth = selectedNodes.reduce((sum,n)=>sum + n.width, 0)
      const span = (last.x + last.width) - first.x
      const space = span - totalWidth
      const gaps = selectedNodes.length - 1
      const gap = gaps > 0 ? space / gaps : 0
      let currentX = first.x + first.width + gap
      const newMap = new Map<string, number>()
      for (let i = 1; i < selectedNodes.length - 1; i++) {
        const n = selectedNodes[i]
        newMap.set(n.id, currentX)
        currentX += n.width + gap
      }
      setNodes(prev => prev.map(n => (newMap.has(n.id) ? { ...n, x: newMap.get(n.id)! } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    distributeSelectedVertically: () => {
      const ids = Array.from(ui.selectedNodeIds)
      if (ids.length <= 2) return
      const selectedNodes = nodes.filter(n => ui.selectedNodeIds.has(n.id)).sort((a,b)=>a.y - b.y)
      const first = selectedNodes[0]
      const last = selectedNodes[selectedNodes.length - 1]
      const totalHeight = selectedNodes.reduce((sum,n)=>sum + n.height, 0)
      const span = (last.y + last.height) - first.y
      const space = span - totalHeight
      const gaps = selectedNodes.length - 1
      const gap = gaps > 0 ? space / gaps : 0
      let currentY = first.y + first.height + gap
      const newMap = new Map<string, number>()
      for (let i = 1; i < selectedNodes.length - 1; i++) {
        const n = selectedNodes[i]
        newMap.set(n.id, currentY)
        currentY += n.height + gap
      }
      setNodes(prev => prev.map(n => (newMap.has(n.id) ? { ...n, y: newMap.get(n.id)! } : n)))
      queueSnapshotInternal(buildSnapshot())
    },
    setConfig: (cfg: GridConfig) => { dispatch({ type: 'CONFIG_SET', cfg }); queueSnapshotInternal(buildSnapshot()); },
    setShowDebugGrid: (v: boolean) => { dispatch({ type: 'SHOW_DEBUG_SET', v }); queueSnapshotInternal(buildSnapshot()); },
    toggleShowDebugGrid: () => { dispatch({ type: 'SHOW_DEBUG_TOGGLE' }); queueSnapshotInternal(buildSnapshot()); },
    setSidebarOpen: (open: boolean) => { dispatch({ type: 'SIDEBAR_SET_OPEN', open }) },
    setActiveTab: (tab: 'general' | 'node') => { dispatch({ type: 'ACTIVE_TAB_SET', tab }) },
    setPanning: (v: boolean) => { dispatch({ type: 'PAN_MODE_SET', v }) },
    setSpacePressed: (v: boolean) => { dispatch({ type: 'SPACE_SET', v }) },
    setShortcutKey: (id: string, key: string) => {
      const map = { ...ui.shortcutMap, [id]: key }
      safeSetItem(SHORTCUT_KEY, JSON.stringify(map))
      dispatch({ type: 'SHORTCUT_SET', id, key })
    },
    buildPlainShortcuts: () => {
      const m = ui.shortcutMap
      const map: Record<string, () => void> = {}
      map[m.collisionToggle] = () => { dispatch({ type: 'COLLISION_TOGGLE' }) }
      map[m.gridToggle] = () => { dispatch({ type: 'SHOW_DEBUG_TOGGLE' }) }
      map[m.alignLeft] = () => { if (!ui.editingNodeId) store.alignSelectedLeft() }
      map[m.alignTop] = () => { if (!ui.editingNodeId) store.alignSelectedTop() }
      map[m.alignRight] = () => { if (!ui.editingNodeId) store.alignSelectedRight() }
      map[m.alignBottom] = () => { if (!ui.editingNodeId) store.alignSelectedBottom() }
      map[m.distributeH] = () => { if (!ui.editingNodeId) store.distributeSelectedHorizontally() }
      map[m.distributeV] = () => { if (!ui.editingNodeId) store.distributeSelectedVertically() }
      return map
    },
    ui,
    setRafId: (id) => { dispatch({ type: 'RAF_SET', id }) },
    clearRafId: () => { dispatch({ type: 'RAF_CLEAR' }) },
    startEditing: (id, initialPos) => { dispatch({ type: 'EDIT_START', id, pos: initialPos }) },
    stopEditing: () => { dispatch({ type: 'EDIT_STOP' }) },
    consumeInitialCursor: () => { dispatch({ type: 'EDIT_CONSUME_CURSOR' }) },
    applyDragFrame: (nodes, selectedIds, config, collisionEnabled, lastMousePos, updateNodes, setLastMousePos) => {
      const step = computeDragStep(nodes, selectedIds, { x: ui.latestMousePos.x - lastMousePos.x, y: ui.latestMousePos.y - lastMousePos.y }, nodes.filter(n => selectedIds.has(n.id)), config, collisionEnabled)
      if (step.x !== 0 || step.y !== 0) {
        updateNodes(prev => prev.map(n => (selectedIds.has(n.id) ? { ...n, x: n.x + step.x, y: n.y + step.y } : n)))
        setLastMousePos({ x: lastMousePos.x + step.x, y: lastMousePos.y + step.y })
      }
    },
  }), [canUndo, canRedo, ui, nodes])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCanvasStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('CanvasStore not found')
  return v
}
