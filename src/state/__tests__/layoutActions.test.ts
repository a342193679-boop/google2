import { describe, it, expect } from 'vitest'
import { createLayoutActions } from '@app/state/actions/layout'

function node(id: string, x: number, y: number, w = 50, h = 20) {
  return { id, x, y, width: w, height: h, text: '', fontSize: 12, isBold: false, textColor: '#000', backgroundColor: '#fff' } as any
}

describe('layout actions', () => {
  it('alignSelectedRight moves left node to max right edge', () => {
    const nodes = [node('a', 0, 0, 50, 20), node('b', 100, 0, 50, 20)]
    let current = nodes.slice()
    const ui = { selectedNodeIds: new Set(['a','b']) }
    const setNodes = (updater: any) => { current = updater(current) }
    const actions = createLayoutActions({ ui, nodes: current, setNodes, queueSnapshot: () => {} })
    actions.alignSelectedRight()
    // maxRight = b.x + b.width = 150; a.x should be 150 - 50 = 100
    const a = current.find(n => n.id === 'a')!
    const b = current.find(n => n.id === 'b')!
    expect(a.x).toBe(100)
    expect(b.x).toBe(100)
  })
})
