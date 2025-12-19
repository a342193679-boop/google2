import { useCallback } from 'react'
import type { NodeData, GridConfig } from '@core/types'
import { useToast } from '@app/hooks/useToast'
import { compressNode, expandNode } from '@core/nodeHelpers'
import { DEFAULT_CONFIG } from '@core/config'

type StoreLike = {
  nodes: NodeData[]
  ui: {
    selectedNodeIds: Set<string>
    pan: { x: number; y: number }
    scale: number
    config: GridConfig
    latestMousePos: { x: number; y: number }
  }
  addNodes: (nodes: NodeData[], select?: boolean) => void
  deleteSelected: () => void
  setSelected: (ids: Set<string>) => void
}

export function useClipboard(storeRef: React.MutableRefObject<StoreLike>, containerRef: React.RefObject<HTMLElement>) {
  const { showToast } = useToast()

  const copy = useCallback(async () => {
    const store = storeRef.current
    const selected = store.nodes.filter(n => store.ui.selectedNodeIds.has(n.id))
    if (selected.length === 0) return

    try {
      const compressed = selected.map(compressNode)
      const text = JSON.stringify(compressed, null, 2)
      await navigator.clipboard.writeText(text)
      showToast('已复制', 'success')
    } catch (e) {
      console.error(e)
      showToast('复制失败', 'error')
    }
  }, [storeRef, showToast])

  const cut = useCallback(async () => {
    const store = storeRef.current
    const selected = store.nodes.filter(n => store.ui.selectedNodeIds.has(n.id))
    if (selected.length === 0) return

    try {
      const compressed = selected.map(compressNode)
      const text = JSON.stringify(compressed, null, 2)
      await navigator.clipboard.writeText(text)
      store.deleteSelected()
      showToast('已剪切', 'success')
    } catch (e) {
      console.error(e)
      showToast('剪切失败', 'error')
    }
  }, [storeRef, showToast])

  const paste = useCallback(async () => {
    const store = storeRef.current
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return

      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        return // Not JSON, ignore
      }

      const rawNodes = Array.isArray(data) ? data : [data]
      const validNodes: NodeData[] = []
      
      // Basic validation
      for (const item of rawNodes) {
        if (typeof item === 'object' && item !== null && typeof item.text === 'string') {
          // It looks like a node
          validNodes.push(expandNode(item, store.ui.config || DEFAULT_CONFIG))
        }
      }

      if (validNodes.length === 0) return

      // Calculate center of nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const n of validNodes) {
        if (typeof n.x === 'number') {
          minX = Math.min(minX, n.x)
          maxX = Math.max(maxX, n.x + (n.width || 0))
        }
        if (typeof n.y === 'number') {
          minY = Math.min(minY, n.y)
          maxY = Math.max(maxY, n.y + (n.height || 0))
        }
      }
      if (!isFinite(minX)) { minX = 0; maxX = 0 }
      if (!isFinite(minY)) { minY = 0; maxY = 0 }

      // Calculate target position (center of nodes at mouse position)
      // If mouse is over canvas, use that. Otherwise use center of view.
      
      let targetX = 0
      let targetY = 0

      const rect = containerRef.current?.getBoundingClientRect()
      // Check if mouse is within canvas bounds (approximately)
      // Note: latestMousePos is clientX/Y from store (updated by useCanvasEvents)
      
      const mouse = store.ui.latestMousePos
      const inBounds = rect && 
        mouse.x >= rect.left && mouse.x <= rect.right &&
        mouse.y >= rect.top && mouse.y <= rect.bottom

      if (inBounds && rect) {
        // Convert mouse client coords to canvas coords
        targetX = (mouse.x - rect.left - store.ui.pan.x) / store.ui.scale
        targetY = (mouse.y - rect.top - store.ui.pan.y) / store.ui.scale
      } else {
        // Fallback to center of view
        const clientW = containerRef.current?.clientWidth || window.innerWidth
        const clientH = containerRef.current?.clientHeight || window.innerHeight
        targetX = (clientW / 2 - store.ui.pan.x) / store.ui.scale
        targetY = (clientH / 2 - store.ui.pan.y) / store.ui.scale
      }

      // Calculate center of the group of nodes
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      
      const dx = targetX - centerX
      const dy = targetY - centerY

      const newNodes = validNodes.map(n => ({
        ...n,
        id: `${Math.random().toString(36).slice(2, 9)}`, // Generate new ID
        x: (n.x || 0) + dx,
        y: (n.y || 0) + dy
      }))

      store.addNodes(newNodes, true)
      showToast(`已粘贴 ${newNodes.length} 个节点`, 'success')

    } catch (e) {
      console.error(e)
      showToast('粘贴失败', 'error')
    }
  }, [storeRef, containerRef, showToast])

  return { copy, cut, paste }
}
