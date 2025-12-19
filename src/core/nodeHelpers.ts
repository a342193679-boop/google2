import { DEFAULT_NODE_STYLE } from '@core/config'
import { calculateNodeSize } from '@core/text/Measure'
import type { NodeData, GridConfig } from '@core/types'

export function compressNode(node: NodeData): Partial<NodeData> {
  const res: any = { ...node }
  
  // Remove defaults
  if (res.backgroundColor === DEFAULT_NODE_STYLE.backgroundColor) delete res.backgroundColor
  if (res.textColor === DEFAULT_NODE_STYLE.textColor) delete res.textColor
  if (res.fontSize === DEFAULT_NODE_STYLE.fontSize) delete res.fontSize
  if (res.isBold === DEFAULT_NODE_STYLE.isBold) delete res.isBold
  if (res.textAlign === DEFAULT_NODE_STYLE.textAlign) delete res.textAlign
  
  // Remove calculated dimensions
  delete res.width
  delete res.height
  
  return res
}

export function expandNode(node: Partial<NodeData>, config: GridConfig): NodeData {
  const full: any = {
    ...DEFAULT_NODE_STYLE,
    ...node,
  }
  
  // Ensure required basics
  if (!full.id) full.id = Math.random().toString(36).slice(2, 9)
  if (typeof full.x !== 'number') full.x = 0
  if (typeof full.y !== 'number') full.y = 0
  if (typeof full.text !== 'string') full.text = ''

  // Calculate size based on (potentially default) style
  const size = calculateNodeSize(full.text, full, config)
  full.width = size.width
  full.height = size.height
  
  return full as NodeData
}
