import type { NodeData } from '@core/types'

export function computeFocus(containerW: number, containerH: number, nodes: NodeData[], selectedIds: Set<string>, padding = 100) {
  let targets = nodes.filter(n => selectedIds.has(n.id))
  if (targets.length === 0) targets = nodes
  if (targets.length === 0) return { scale: 1, pan: { x: 0, y: 0 } }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  targets.forEach(n => {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  })
  const contentW = Math.max(maxX - minX, 1)
  const contentH = Math.max(maxY - minY, 1)
  const centerX = minX + contentW / 2
  const centerY = minY + contentH / 2
  const scaleX = (containerW - padding) / contentW
  const scaleY = (containerH - padding) / contentH
  let scale = Math.min(scaleX, scaleY)
  scale = Math.min(Math.max(scale, 0.1), 4)
  const panX = (containerW / 2) - (centerX * scale)
  const panY = (containerH / 2) - (centerY * scale)
  return { scale, pan: { x: panX, y: panY } }
}
