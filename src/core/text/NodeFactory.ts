import type { NodeData, GridConfig, NodeStyle } from '@core/types'
import { calculateNodeSize } from './Measure'

let __seq = 0
function genId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {}
  return `${Date.now().toString(36)}-${(__seq++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function makeNode(text: string, x: number, y: number, style: NodeStyle, config: GridConfig): NodeData {
  const size = calculateNodeSize(text, style, config)
  return { id: genId(), x, y, text, ...style, ...size }
}
