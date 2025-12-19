import type { GridConfig, NodeData, NodeStyle, Point } from '@core/types'
import type { Dispatch } from 'react'
import type { Action } from '@app/state/uiReducer'

export function createNodeActions(options: {
  ui: {
    selectedNodeIds: Set<string>
    config: GridConfig
    snapOnRelease: boolean
  }
  nodes: NodeData[]
  setNodes: (updater: (prev: NodeData[]) => NodeData[]) => void
  measureNode: (text: string, style: NodeStyle, config: GridConfig) => { width: number; height: number }
  makeNode: (text: string, x: number, y: number, style: NodeStyle, config: GridConfig) => NodeData
  computeDragStep: (
    nodes: NodeData[],
    selectedIds: Set<string>,
    delta: Point,
    config: GridConfig,
    collisionEnabled: boolean
  ) => Point
  queueSnapshot: () => void
  buildSnapshot: () => any
  dispatch: Dispatch<Action>
  DEFAULT_NODE_STYLE: NodeStyle
}) {
  const { ui, nodes, setNodes, measureNode, makeNode, computeDragStep, queueSnapshot, dispatch, DEFAULT_NODE_STYLE } = options

  const updateSelectedNodes = (updates: Partial<NodeStyle>, config: GridConfig) => {
    setNodes(prev => prev.map(node => {
      if (ui.selectedNodeIds.has(node.id)) {
        const newStyle = { ...node, ...updates }
        const newSize = measureNode(node.text, newStyle, config)
        return { ...newStyle, ...newSize }
      }
      return node
    }))
    queueSnapshot()
  }

  const updateNodeText = (id: string, newText: string, config: GridConfig) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const size = measureNode(newText, n, config)
        return { ...n, text: newText, ...size }
      }
      return n
    }))
    queueSnapshot()
  }

  const recalcAllNodeSizes = (config: GridConfig) => {
    setNodes(prev => prev.map(node => {
      const size = measureNode(node.text, node, config)
      return { ...node, ...size }
    }))
    queueSnapshot()
  }

  const createNodeAt = (text: string, x: number, y: number, style: NodeStyle, config: GridConfig) => {
    const node = makeNode(text, x, y, style, config)
    return node
  }

  const createDefaultNodeAt = (text: string, x: number, y: number) => {
    return makeNode(text, x, y, { ...DEFAULT_NODE_STYLE }, ui.config)
  }

  const addNode = (node: NodeData, select = false) => {
    const existing = new Set(nodes.map(n => n.id))
    let n = node
    if (existing.has(n.id)) {
      n = { ...n, id: `${n.id}-${Math.random().toString(36).slice(2,6)}` }
    }
    setNodes(prev => [...prev, n])
    if (select) dispatch({ type: 'SELECT_SET_IDS', ids: new Set([n.id]) })
    queueSnapshot()
  }

  const addNodes = (newNodes: NodeData[], select = false) => {
    const existing = new Set(nodes.map(n => n.id))
    const toAdd = newNodes.map(n => {
      let id = n.id
      if (existing.has(id)) {
        id = `${id}-${Math.random().toString(36).slice(2,6)}`
      }
      return { ...n, id }
    })
    setNodes(prev => [...prev, ...toAdd])
    if (select) dispatch({ type: 'SELECT_SET_IDS', ids: new Set(toAdd.map(n => n.id)) })
    queueSnapshot()
  }

  const deleteSelected = () => {
    const ids = ui.selectedNodeIds
    setNodes(prev => prev.filter(n => !ids.has(n.id)))
    dispatch({ type: 'SELECT_CLEAR_IDS' })
    queueSnapshot()
  }

  const snapSelectedToGrid = (config: GridConfig) => {
    const unit = config.baseUnit
    setNodes(prev => prev.map(n => (
      ui.selectedNodeIds.has(n.id)
        ? { ...n, x: Math.round(n.x / unit) * unit, y: Math.round(n.y / unit) * unit }
        : n
    )))
    queueSnapshot()
  }

  const endDragAndSnap = (config: GridConfig) => {
    dispatch({ type: 'DRAG_END' })
    if (!ui.snapOnRelease) return
    if (config.snapStep === 0) return
    const unit = config.baseUnit
    setNodes(prev => prev.map(n => (
      ui.selectedNodeIds.has(n.id)
        ? { ...n, x: Math.round(n.x / unit) * unit, y: Math.round(n.y / unit) * unit }
        : n
    )))
    queueSnapshot()
  }

  const applyDragFrame = (currentMousePos: Point, lastMousePos: Point, collisionEnabled: boolean): Point => {
    const step = computeDragStep(
      nodes, 
      ui.selectedNodeIds, 
      { x: currentMousePos.x - lastMousePos.x, y: currentMousePos.y - lastMousePos.y }, 
      ui.config, 
      collisionEnabled
    )
    if (step.x !== 0 || step.y !== 0) {
      setNodes(prev => prev.map(n => (ui.selectedNodeIds.has(n.id) ? { ...n, x: n.x + step.x, y: n.y + step.y } : n)))
    }
    return step
  }

  return {
    updateSelectedNodes,
    updateNodeText,
    recalcAllNodeSizes,
    createNodeAt,
    createDefaultNodeAt,
    addNode,
    addNodes,
    deleteSelected,
    snapSelectedToGrid,
    endDragAndSnap,
    applyDragFrame,
  }
}
