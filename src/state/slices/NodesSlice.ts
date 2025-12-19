import React from 'react'
import type { Dispatch } from 'react'
import type { NodeData, GridConfig, NodeStyle, Point } from '@core/types'
import type { Action } from '@app/state/uiReducer'
import { createNodeActions } from '@app/state/actions/nodes'
import { createLayoutActions } from '@app/state/actions/layout'
import { makeNode } from '@core/text/NodeFactory'
import { calculateNodeSize as measureNode } from '@core/text/Measure'
import { computeDragStep } from '@core/canvas/DragStep'
import { DEFAULT_NODE_STYLE } from '@core/config'

export type NodesSlice = {
  nodes: NodeData[]
  setNodes: (updater: (prev: NodeData[]) => NodeData[]) => void
  addNode: (node: NodeData, select?: boolean) => void
  addNodes: (nodes: NodeData[], select?: boolean) => void
  deleteSelected: () => void
  updateSelectedNodes: (updates: Partial<NodeStyle>, config: GridConfig) => void
  updateNodeText: (id: string, newText: string, config: GridConfig) => void
  recalcAllNodeSizes: (config: GridConfig) => void
  createNodeAt: (text: string, x: number, y: number, style: NodeStyle, config: GridConfig) => NodeData
  createDefaultNodeAt: (text: string, x: number, y: number) => NodeData
  snapSelectedToGrid: (config: GridConfig) => void
  endDragAndSnap: (config: GridConfig) => void
  alignSelectedLeft: () => void
  alignSelectedTop: () => void
  alignSelectedRight: () => void
  alignSelectedBottom: () => void
  distributeSelectedHorizontally: () => void
  distributeSelectedVertically: () => void
  applyDragFrame: (
    currentMousePos: Point,
    lastMousePos: Point,
    collisionEnabled: boolean
  ) => Point
}

export function createNodesSlice(
  nodes: NodeData[],
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>,
  ui: { selectedNodeIds: Set<string>; config: GridConfig; snapOnRelease: boolean },
  dispatch: Dispatch<Action>,
  queueSnapshot: () => void,
  buildSnapshot: () => any
): NodesSlice {
  const nodeActions = createNodeActions({
    ui,
    nodes,
    setNodes: (updater) => setNodes(prev => updater(prev)),
    measureNode: (text, style, cfg) => measureNode(text, style, cfg),
    makeNode,
    computeDragStep,
    queueSnapshot,
    buildSnapshot,
    dispatch,
    DEFAULT_NODE_STYLE
  })

  const layoutActions = createLayoutActions({
    ui,
    nodes,
    setNodes: (updater) => setNodes(prev => updater(prev)),
    queueSnapshot
  })

  return {
    nodes,
    setNodes: (updater) => setNodes(prev => updater(prev)),
    addNode: nodeActions.addNode,
    addNodes: nodeActions.addNodes,
    deleteSelected: nodeActions.deleteSelected,
    updateSelectedNodes: nodeActions.updateSelectedNodes,
    updateNodeText: nodeActions.updateNodeText,
    recalcAllNodeSizes: nodeActions.recalcAllNodeSizes,
    createNodeAt: nodeActions.createNodeAt,
    createDefaultNodeAt: nodeActions.createDefaultNodeAt,
    snapSelectedToGrid: nodeActions.snapSelectedToGrid,
    endDragAndSnap: nodeActions.endDragAndSnap,
    alignSelectedLeft: layoutActions.alignSelectedLeft,
    alignSelectedTop: layoutActions.alignSelectedTop,
    alignSelectedRight: layoutActions.alignSelectedRight,
    alignSelectedBottom: layoutActions.alignSelectedBottom,
    distributeSelectedHorizontally: layoutActions.distributeSelectedHorizontally,
    distributeSelectedVertically: layoutActions.distributeSelectedVertically,
    applyDragFrame: nodeActions.applyDragFrame,
  }
}
