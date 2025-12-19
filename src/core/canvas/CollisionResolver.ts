import type { Point } from '../types'
import type { NodeData } from '../types'

export function resolveDelta(nodes: NodeData[], selectedIds: Set<string>, delta: Point): Point {
  const selected = nodes.filter(n => selectedIds.has(n.id))
  if (selected.length === 0) return { x: delta.x, y: delta.y }
  
  const obstacles = nodes.filter(n => !selectedIds.has(n.id))
  if (obstacles.length === 0) return { x: delta.x, y: delta.y }

  const EPS = 0.0001
  const GRID_SIZE = 100 // Spatial grid cell size

  // --- Spatial Hash Implementation ---
  // Key: `${x},${y}` -> NodeData[]
  const grid = new Map<string, NodeData[]>()

  const addToGrid = (n: NodeData) => {
    // Determine the range of cells this node overlaps
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

  // Populate grid with obstacles only
  obstacles.forEach(addToGrid)

  const getPotentialColliders = (n: NodeData, dx: number, dy: number): NodeData[] => {
    const colliders = new Set<NodeData>()
    // Check range including the movement delta
    const x = Math.min(n.x, n.x + dx)
    const y = Math.min(n.y, n.y + dy)
    const w = n.width + Math.abs(dx)
    const h = n.height + Math.abs(dy)

    const startCol = Math.floor(x / GRID_SIZE)
    const endCol = Math.floor((x + w) / GRID_SIZE)
    const startRow = Math.floor(y / GRID_SIZE)
    const endRow = Math.floor((y + h) / GRID_SIZE)

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const cell = grid.get(`${c},${r}`)
        if (cell) {
          cell.forEach(o => colliders.add(o))
        }
      }
    }
    return Array.from(colliders)
  }
  // -----------------------------------

  let deltaX = delta.x
  let deltaY = delta.y

  if (deltaX !== 0) {
    let allowedX = deltaX
    if (deltaX > 0) {
      selected.forEach(s => {
        const nearby = getPotentialColliders(s, deltaX, 0)
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
      selected.forEach(s => {
        const nearby = getPotentialColliders(s, deltaX, 0)
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
    deltaX = allowedX
  }

  if (deltaY !== 0) {
    let allowedY = deltaY
    if (deltaY > 0) {
      selected.forEach(s => {
        const sXShifted = s.x + deltaX
        const nearby = getPotentialColliders(s, deltaX, deltaY) // Include X shift in lookup area? Actually we need to check if shifted s collides.
        // But getPotentialColliders uses current pos + delta.
        // For Y check, s is effectively at s.x + deltaX.
        // We can just query based on the final bounding box of the move.
        
        nearby.forEach(o => {
          const horOverlap = sXShifted + s.width > o.x + EPS && sXShifted < o.x + o.width - EPS
          if (horOverlap) {
            const sBottom = s.y + s.height
            const proposedBottom = sBottom + allowedY
            if (proposedBottom > o.y && sBottom <= o.y) {
              allowedY = Math.min(allowedY, o.y - sBottom)
            }
          }
        })
      })
    } else {
      selected.forEach(s => {
        const sXShifted = s.x + deltaX
        const nearby = getPotentialColliders(s, deltaX, deltaY)
        nearby.forEach(o => {
          const horOverlap = sXShifted + s.width > o.x + EPS && sXShifted < o.x + o.width - EPS
          if (horOverlap) {
            const proposedTop = s.y + allowedY
            const oBottom = o.y + o.height
            if (proposedTop < oBottom && s.y >= oBottom) {
              allowedY = Math.max(allowedY, oBottom - s.y)
            }
          }
        })
      })
    }
    deltaY = allowedY
  }
  return { x: deltaX, y: deltaY }
}
