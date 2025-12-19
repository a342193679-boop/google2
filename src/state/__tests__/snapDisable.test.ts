import { describe, it, expect } from 'vitest'
import { createNodeActions } from '@app/state/actions/nodes'

function node(id: string, x: number, y: number, w = 50, h = 20) {
  return { id, x, y, width: w, height: h, text: '', fontSize: 12, isBold: false, textColor: '#000', backgroundColor: '#fff' } as any
}

describe('snap disable', () => {
  it('endDragAndSnap respects snapStep=0', () => {
    let cfg = { baseUnit: 10, lineHeight: 18, maxNodeWidthUnits: 80, borderWidth: 1, borderRadius: 4, paddingX: 4, paddingY: 2, selectionLineWidth: 1, showBorder: true, snapStep: 0 } as any
    let current = [node('a', 13, 17)]
    const ui = { selectedNodeIds: new Set(['a']), config: cfg, snapOnRelease: true }
    const setNodes = (updater: any) => { current = updater(current) }
    const actions = createNodeActions({
      ui,
      nodes: current,
      setNodes,
      measureNode: (_t: any, s: any, _c: any) => ({ width: s.width, height: s.height }),
      makeNode: (_t: any, x: any, y: any, _s: any, _c: any) => node('x', x, y),
      queueSnapshot: () => {},
      buildSnapshot: () => ({}),
      dispatch: () => {},
      DEFAULT_NODE_STYLE: {} as any,
    })
    actions.endDragAndSnap(cfg)
    expect(current[0].x).toBe(13)
    expect(current[0].y).toBe(17)
  })
})
