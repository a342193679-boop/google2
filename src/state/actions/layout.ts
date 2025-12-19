import type { NodeData } from '@core/types'

export function createLayoutActions(options: {
  ui: { selectedNodeIds: Set<string> }
  nodes: NodeData[]
  setNodes: (updater: (prev: NodeData[]) => NodeData[]) => void
  queueSnapshot: () => void
}) {
  const { ui, nodes, setNodes, queueSnapshot } = options

  const alignSelectedLeft = () => {
    const ids = ui.selectedNodeIds
    if (ids.size === 0) return
    let minX = Infinity
    nodes.forEach(n => { if (ids.has(n.id)) minX = Math.min(minX, n.x) })
    setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, x: minX } : n)))
    queueSnapshot()
  }

  const alignSelectedTop = () => {
    const ids = ui.selectedNodeIds
    if (ids.size === 0) return
    let minY = Infinity
    nodes.forEach(n => { if (ids.has(n.id)) minY = Math.min(minY, n.y) })
    setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, y: minY } : n)))
    queueSnapshot()
  }

  const alignSelectedRight = () => {
    const ids = ui.selectedNodeIds
    if (ids.size === 0) return
    let maxRight = -Infinity
    nodes.forEach(n => { if (ids.has(n.id)) maxRight = Math.max(maxRight, n.x + n.width) })
    setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, x: maxRight - n.width } : n)))
    queueSnapshot()
  }

  const alignSelectedBottom = () => {
    const ids = ui.selectedNodeIds
    if (ids.size === 0) return
    let maxBottom = -Infinity
    nodes.forEach(n => { if (ids.has(n.id)) maxBottom = Math.max(maxBottom, n.y + n.height) })
    setNodes(prev => prev.map(n => (ids.has(n.id) ? { ...n, y: maxBottom - n.height } : n)))
    queueSnapshot()
  }

  const distributeSelectedHorizontally = () => {
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
    queueSnapshot()
  }

  const distributeSelectedVertically = () => {
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
    queueSnapshot()
  }

  return {
    alignSelectedLeft,
    alignSelectedTop,
    alignSelectedRight,
    alignSelectedBottom,
    distributeSelectedHorizontally,
    distributeSelectedVertically,
  }
}

