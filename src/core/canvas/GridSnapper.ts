import type { Point } from '../types'

export function snapDelta(delta: Point, anchor: Point, unit: number): Point {
  const snap = (d: number, origin: number) => {
    const target = origin + d
    const snapped = Math.round(target / unit) * unit
    return snapped - origin
  }
  return { x: snap(delta.x, anchor.x), y: snap(delta.y, anchor.y) }
}
