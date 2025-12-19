import type { NodeStyle, NodeData, GridConfig } from '@core/types'

export type PluginCapabilities = {
  canvasOps: {
    setPan: (p: { x: number; y: number }) => void
    setScale: (s: number) => void
    setPanScale: (p: { x: number; y: number }, s: number) => void
    focusTo: (containerW: number, containerH: number, nodes: NodeData[], selectedIds: Set<string>) => void
    getCanvasPoint: (rect: DOMRect, clientX: number, clientY: number) => { x: number; y: number }
    zoomAtPoint: (rect: DOMRect, clientX: number, clientY: number, deltaY: number, min?: number, max?: number, speed?: number) => void
  }
  nodeOps: {
    createNodeAt: (text: string, x: number, y: number, style: NodeStyle, config: GridConfig) => NodeData
    createDefaultNodeAt: (text: string, x: number, y: number) => NodeData
    addNode: (node: NodeData, select?: boolean) => void
    deleteSelected: () => void
    updateNodeText: (id: string, newText: string, config: GridConfig) => void
    updateSelectedNodes: (updates: Partial<NodeStyle>, config: GridConfig) => void
    recalcAllNodeSizes: (config: GridConfig) => void
    snapSelectedToGrid: (config: GridConfig) => void
    endDragAndSnap: (config: GridConfig) => void
  }
  layoutOps: {
    alignSelectedLeft: () => void
    alignSelectedTop: () => void
    alignSelectedRight: () => void
    alignSelectedBottom: () => void
    distributeSelectedHorizontally: () => void
    distributeSelectedVertically: () => void
  }
  uiOps: {
    setSelected: (ids: Set<string>) => void
    clearSelected: () => void
    toggleSelected: (id: string) => void
    setShowDebugGrid: (v: boolean) => void
    toggleShowDebugGrid: () => void
    toggleSnapOnRelease: () => void
    toggleCollision: () => void
    setCollisionEnabled: (v: boolean) => void
    setSidebarOpen: (open: boolean) => void
    setActiveTab: (tab: 'general' | 'node') => void
  }
}

export function createCapabilities(store: any): PluginCapabilities {
  return {
    canvasOps: {
      setPan: (p) => store.setPan(p),
      setScale: (s) => store.setScale(s),
      setPanScale: (p, s) => store.setPanScale(p, s),
      focusTo: (cw, ch, nodes, ids) => store.focusTo(cw, ch, nodes, ids),
      getCanvasPoint: (rect, x, y) => store.getCanvasPoint(rect, x, y),
      zoomAtPoint: (rect, x, y, d, min, max, speed) => store.zoomAtPoint(rect, x, y, d, min, max, speed),
    },
    nodeOps: {
      createNodeAt: (text, x, y, style, cfg) => store.createNodeAt(text, x, y, style, cfg),
      createDefaultNodeAt: (text, x, y) => store.createDefaultNodeAt(text, x, y),
      addNode: (node, select) => store.addNode(node, select),
      deleteSelected: () => store.deleteSelected(),
      updateNodeText: (id, newText, cfg) => store.updateNodeText(id, newText, cfg),
      updateSelectedNodes: (updates, cfg) => store.updateSelectedNodes(updates, cfg),
      recalcAllNodeSizes: (cfg) => store.recalcAllNodeSizes(cfg),
      snapSelectedToGrid: (cfg) => store.snapSelectedToGrid(cfg),
      endDragAndSnap: (cfg) => store.endDragAndSnap(cfg),
    },
    layoutOps: {
      alignSelectedLeft: () => store.alignSelectedLeft(),
      alignSelectedTop: () => store.alignSelectedTop(),
      alignSelectedRight: () => store.alignSelectedRight(),
      alignSelectedBottom: () => store.alignSelectedBottom(),
      distributeSelectedHorizontally: () => store.distributeSelectedHorizontally(),
      distributeSelectedVertically: () => store.distributeSelectedVertically(),
    },
    uiOps: {
      setSelected: (ids) => store.setSelected(ids),
      clearSelected: () => store.clearSelected(),
      toggleSelected: (id) => store.toggleSelected(id),
      toggleSnapOnRelease: () => store.toggleSnapOnRelease(),
      setShowDebugGrid: (v) => store.setShowDebugGrid(v),
      toggleShowDebugGrid: () => store.toggleShowDebugGrid(),
      toggleCollision: () => store.toggleCollision(),
      setCollisionEnabled: (v) => store.setCollisionEnabled(v),
      setSidebarOpen: (open) => store.setSidebarOpen(open),
      setActiveTab: (tab) => store.setActiveTab(tab),
    },
  }
}

export function createCapabilitiesProxy(getStore: () => any): PluginCapabilities {
  return {
    canvasOps: {
      setPan: (p) => getStore().setPan(p),
      setScale: (s) => getStore().setScale(s),
      setPanScale: (p, s) => getStore().setPanScale(p, s),
      focusTo: (cw, ch, nodes, ids) => getStore().focusTo(cw, ch, nodes, ids),
      getCanvasPoint: (rect, x, y) => getStore().getCanvasPoint(rect, x, y),
      zoomAtPoint: (rect, x, y, d, min, max, speed) => getStore().zoomAtPoint(rect, x, y, d, min, max, speed),
    },
    nodeOps: {
      createNodeAt: (text, x, y, style, cfg) => getStore().createNodeAt(text, x, y, style, cfg),
      createDefaultNodeAt: (text, x, y) => getStore().createDefaultNodeAt(text, x, y),
      addNode: (node, select) => getStore().addNode(node, select),
      deleteSelected: () => getStore().deleteSelected(),
      updateNodeText: (id, newText, cfg) => getStore().updateNodeText(id, newText, cfg),
      updateSelectedNodes: (updates, cfg) => getStore().updateSelectedNodes(updates, cfg),
      recalcAllNodeSizes: (cfg) => getStore().recalcAllNodeSizes(cfg),
      snapSelectedToGrid: (cfg) => getStore().snapSelectedToGrid(cfg),
      endDragAndSnap: (cfg) => getStore().endDragAndSnap(cfg),
    },
    layoutOps: {
      alignSelectedLeft: () => getStore().alignSelectedLeft(),
      alignSelectedTop: () => getStore().alignSelectedTop(),
      alignSelectedRight: () => getStore().alignSelectedRight(),
      alignSelectedBottom: () => getStore().alignSelectedBottom(),
      distributeSelectedHorizontally: () => getStore().distributeSelectedHorizontally(),
      distributeSelectedVertically: () => getStore().distributeSelectedVertically(),
    },
    uiOps: {
      setSelected: (ids) => getStore().setSelected(ids),
      clearSelected: () => getStore().clearSelected(),
      toggleSelected: (id) => getStore().toggleSelected(id),
      toggleSnapOnRelease: () => getStore().toggleSnapOnRelease(),
      setShowDebugGrid: (v) => getStore().setShowDebugGrid(v),
      toggleShowDebugGrid: () => getStore().toggleShowDebugGrid(),
      toggleCollision: () => getStore().toggleCollision(),
      setCollisionEnabled: (v) => getStore().setCollisionEnabled(v),
      setSidebarOpen: (open) => getStore().setSidebarOpen(open),
      setActiveTab: (tab) => getStore().setActiveTab(tab),
    },
  }
}
