import type { Point } from '@core/types'
import type { NodeData, GridConfig } from '@core/types'
import { resolveDelta } from './CollisionResolver'
 

export function computeDragStep(nodes: NodeData[], selectedIds: Set<string>, delta: Point, config: GridConfig, collisionEnabled: boolean): Point {
  const unit = config.baseUnit * config.snapStep
  const desired = unit > 0 ? { x: Math.round(delta.x / unit) * unit, y: Math.round(delta.y / unit) * unit } : delta
  const final = collisionEnabled ? resolveDelta(nodes, selectedIds, desired) : desired
  return final
}
