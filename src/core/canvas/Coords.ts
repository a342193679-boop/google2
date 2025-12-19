import type { Point } from '@core/types'

export function getCanvasPoint(rect: DOMRect, pan: Point, scale: number, clientX: number, clientY: number): Point {
  return {
    x: (clientX - rect.left - pan.x) / scale,
    y: (clientY - rect.top - pan.y) / scale,
  }
}
