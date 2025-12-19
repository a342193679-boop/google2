import { describe, it, expect } from 'vitest'
import { computeDragStep } from '../../canvas/DragStep'
import type { GridConfig, NodeData } from '../../types'

const CFG: GridConfig = {
  baseUnit: 5,
  lineHeight: 15,
  paddingX: 2.5,
  paddingY: 0,
  showBorder: true,
  borderWidth: 0.2,
  borderRadius: 3,
  selectionLineWidth: 0.5,
  maxNodeWidthUnits: 80,
  fontFamily: 'mono',
  snapStep: 1,
}

function node(id: string, x: number, y: number, w = 50, h = 20): NodeData {
  return { id, x, y, width: w, height: h, text: '', backgroundColor: '#fff', textColor: '#000', fontSize: 10, isBold: false }
}

describe('computeDragStep', () => {
  it('snaps by baseUnit*snapStep without obstacles', () => {
    const nodes = [node('a', 0, 0)]
    const selected = new Set(['a'])
    const step = computeDragStep(nodes, selected, { x: 7, y: 0 }, CFG, false)
    expect(step.x).toBe(5)
    expect(step.y).toBe(0)
  })

  it('respects obstacles on right side', () => {
    const nodes = [node('a', 0, 0), node('b', 60, 0)]
    const selected = new Set(['a'])
    const step = computeDragStep(nodes, selected, { x: 20, y: 0 }, CFG, true)
    // a width is 50, so a.right=50; obstacle at x=60 ⇒ allowed up to 10
    expect(step.x).toBe(10)
  })

  it('resolves per-node collisions when multiple nodes selected (min across nodes)', () => {
    const nodes = [
      node('a', 0, 0),        // right=50, obstacle o1 at x=60 → allow 10
      node('c', 120, 0),      // right=170, obstacle o2 at x=190 → allow 20
      node('o1', 60, 0),
      node('o2', 190, 0),
    ]
    const selected = new Set(['a', 'c'])
    const step = computeDragStep(nodes, selected, { x: 25, y: 0 }, CFG, true)
    expect(step.x).toBe(10)
    expect(step.y).toBe(0)
  })

})
