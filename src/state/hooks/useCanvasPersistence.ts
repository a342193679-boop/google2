import { Dispatch, MutableRefObject } from 'react'
import type { CanvasState, NodeData } from '@core/types'
import { DEFAULT_CONFIG } from '@core/config'
import { expandNode } from '@core/nodeHelpers'
import { calculateNodeSize as measureNode } from '@core/text/Measure'
import { Action } from '@app/state/uiReducer'
import { IStorage } from '@core/io/Storage'

export function useCanvasPersistence(
  setNodes: Dispatch<React.SetStateAction<NodeData[]>>,
  dispatch: Dispatch<Action>,
  queueSnapshot: (s: CanvasState) => void,
  storage: MutableRefObject<IStorage>
) {

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

  const restoreFromJson = (text: string) => {
    try {
      const obj = JSON.parse(text)
      const expandedNodes = (obj.nodes || []).map((n: any) => expandNode(n, obj.config || DEFAULT_CONFIG))
      const next: CanvasState = {
        nodes: expandedNodes,
        config: obj.config || DEFAULT_CONFIG,
        scale: obj.scale ?? 3,
        pan: obj.pan || { x: 0, y: 0 },
        showDebugGrid: obj.showDebugGrid ?? false,
        selectedNodeIds: obj.selectedNodeIds || [],
        collisionEnabled: obj.collisionEnabled ?? true,
      }
      restoreStateImpl(next)
      queueSnapshot(next)
      return next
    } catch {
      return null
    }
  }

  const loadAndRestore = async () => {
    try {
      const text = await storage.current.loadText()
      const res = (text != null) ? restoreFromJson(text) : null
      return !!res
    } catch {
      return false
    }
  }

  return {
    restoreState: restoreStateImpl,
    restoreFromJson,
    loadAndRestore
  }
}
