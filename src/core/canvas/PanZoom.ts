import type { Point } from '@core/types'

export function zoomAtPoint(oldScale: number, pan: Point, rect: DOMRect, clientX: number, clientY: number, deltaY: number, min = 0.1, max = 10, speed = 0.001) {
  const zoomFactor = 1 - deltaY * speed
  let newScale = oldScale * zoomFactor
  newScale = Math.min(Math.max(min, newScale), max)
  const mouseX = clientX - rect.left
  const mouseY = clientY - rect.top
  const canvasX = (mouseX - pan.x) / oldScale
  const canvasY = (mouseY - pan.y) / oldScale
  const newPanX = mouseX - canvasX * newScale
  const newPanY = mouseY - canvasY * newScale
  return { scale: newScale, pan: { x: newPanX, y: newPanY } }
}
