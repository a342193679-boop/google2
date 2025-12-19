import type { Point } from '../types'
import type { NodeData } from '../types'

export function resolveDelta(nodes: NodeData[], selectedIds: Set<string>, delta: Point): Point {
  const selectedNodes = nodes.filter(n => selectedIds.has(n.id))
  if (selectedNodes.length === 0) return { x: delta.x, y: delta.y }

  const obstacles = nodes.filter(n => !selectedIds.has(n.id))
  if (obstacles.length === 0) return { x: delta.x, y: delta.y }

  const EPS = 0.0001
  const GRID_SIZE = 100 // Spatial grid cell size

  // --- Spatial Hash Implementation (for obstacles) ---
  const grid = new Map<string, NodeData[]>()
  const addToGrid = (n: NodeData) => {
    const startCol = Math.floor(n.x / GRID_SIZE)
    const endCol = Math.floor((n.x + n.width) / GRID_SIZE)
    const startRow = Math.floor(n.y / GRID_SIZE)
    const endRow = Math.floor((n.y + n.height) / GRID_SIZE)
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const key = `${c},${r}`
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key)!.push(n)
      }
    }
  }
  obstacles.forEach(addToGrid)

  const getPotentialColliders = (box: { x: number; y: number; width: number; height: number }, dx: number, dy: number): NodeData[] => {
    const colliders = new Set<NodeData>()
    const x = Math.min(box.x, box.x + dx)
    const y = Math.min(box.y, box.y + dy)
    const w = box.width + Math.abs(dx)
    const h = box.height + Math.abs(dy)
    const startCol = Math.floor(x / GRID_SIZE)
    const endCol = Math.floor((x + w) / GRID_SIZE)
    const startRow = Math.floor(y / GRID_SIZE)
    const endRow = Math.floor((y + h) / GRID_SIZE)
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const cell = grid.get(`${c},${r}`)
        if (cell) cell.forEach(o => colliders.add(o))
      }
    }
    return Array.from(colliders)
  }
  // -----------------------------------

  // Work on copies of selected positions so we can simulate incremental movement
  type Box = { x: number; y: number; width: number; height: number }
  const selectedBoxes: Box[] = selectedNodes.map(s => ({ x: s.x, y: s.y, width: s.width, height: s.height }))

  // Single-step resolver: given current selectedBoxes and a small step {dx,dy}, compute allowed step that doesn't penetrate obstacles
  const resolveStep = (curSelected: Box[], step: Point): Point => {
    let dx = step.x
    let dy = step.y

    // X axis
    if (dx !== 0) {
      let allowedX = dx
      if (dx > 0) {
        curSelected.forEach(s => {
          const nearby = getPotentialColliders(s, dx, 0)
          nearby.forEach(o => {
            const vertOverlap = s.y + s.height > o.y + EPS && s.y < o.y + o.height - EPS
            if (vertOverlap) {
              const sRight = s.x + s.width
              const proposedRight = sRight + allowedX
              if (proposedRight > o.x && sRight <= o.x) {
                allowedX = Math.min(allowedX, o.x - sRight)
              }
            }
          })
        })
      } else {
        curSelected.forEach(s => {
          const nearby = getPotentialColliders(s, dx, 0)
          nearby.forEach(o => {
            const vertOverlap = s.y + s.height > o.y + EPS && s.y < o.y + o.height - EPS
            if (vertOverlap) {
              const proposedLeft = s.x + allowedX
              const oRight = o.x + o.width
              if (proposedLeft < oRight && s.x >= oRight) {
                allowedX = Math.max(allowedX, oRight - s.x)
              }
            }
          })
        })
      }
      dx = allowedX
    }

    // Apply X to boxes (for Y collision checks we must consider shifted X)
    const shiftedSelected = curSelected.map(s => ({ x: s.x + dx, y: s.y, width: s.width, height: s.height }))

    // Y axis
    if (dy !== 0) {
      let allowedY = dy
      if (dy > 0) {
        shiftedSelected.forEach((s, idx) => {
          const nearby = getPotentialColliders(s, dx, dy)
          nearby.forEach(o => {
            const horOverlap = s.x + s.width > o.x + EPS && s.x < o.x + o.width - EPS
            if (horOverlap) {
              const sBottom = curSelected[idx].y + curSelected[idx].height
              const proposedBottom = sBottom + allowedY
              if (proposedBottom > o.y && sBottom <= o.y) {
                allowedY = Math.min(allowedY, o.y - sBottom)
              }
            }
          })
        })
      } else {
        shiftedSelected.forEach((s, idx) => {
          const nearby = getPotentialColliders(s, dx, dy)
          nearby.forEach(o => {
            const horOverlap = s.x + s.width > o.x + EPS && s.x < o.x + o.width - EPS
            if (horOverlap) {
              const proposedTop = curSelected[idx].y + allowedY
              const oBottom = o.y + o.height
              if (proposedTop < oBottom && curSelected[idx].y >= oBottom) {
                allowedY = Math.max(allowedY, oBottom - curSelected[idx].y)
              }
            }
          })
        })
      }
      dy = allowedY
    }

    return { x: dx, y: dy }
  }

  // Determine number of sub-steps to avoid tunneling. We choose a conservative step size relative to GRID_SIZE.
  const maxDelta = Math.max(Math.abs(delta.x), Math.abs(delta.y))
  const STEP_SIZE = Math.max(1, Math.floor(GRID_SIZE / 4)) // e.g., 25 for GRID_SIZE=100
  const steps = Math.min(40, Math.max(1, Math.ceil(maxDelta / STEP_SIZE))) // cap to avoid huge loops

  const stepDx = delta.x / steps
  const stepDy = delta.y / steps

  let accumulated = { x: 0, y: 0 }

  for (let i = 0; i < steps; i++) {
    const allowed = resolveStep(selectedBoxes, { x: stepDx, y: stepDy })
    // Apply allowed step to selectedBoxes for next iteration
    selectedBoxes.forEach(b => { b.x += allowed.x; b.y += allowed.y })
    accumulated.x += allowed.x
    accumulated.y += allowed.y
    // If at some iteration both allowed components are effectively zero, we can early exit
    if (Math.abs(allowed.x) < EPS && Math.abs(allowed.y) < EPS) break
  }

  return accumulated
}
