import type { NodeData } from '@core/types'

export function rectIntersects(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  const ar = a.x + a.w
  const ab = a.y + a.h
  const br = b.x + b.w
  const bb = b.y + b.h
  return a.x < br && ar > b.x && a.y < bb && ab > b.y
}

export function selectNodesInBox(nodes: NodeData[], box: { x: number; y: number; w: number; h: number }) {
  const res = new Set<string>()
  nodes.forEach(n => {
    if (rectIntersects(box, { x: n.x, y: n.y, w: n.width, h: n.height })) res.add(n.id)
  })
  return res
}
