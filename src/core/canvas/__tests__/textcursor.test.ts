import { describe, it, expect } from 'vitest'
import { getCharIndexAtPosition } from '../../canvas/TextCursor'
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

function node(text: string): NodeData {
  return { id: 'n', x: 0, y: 0, width: 200, height: 100, text, backgroundColor: '#fff', textColor: '#000', fontSize: 10, isBold: false }
}

describe('getCharIndexAtPosition', () => {
  it('locates within first line for half-width chars', () => {
    const n = node('abcd')
    const idx = getCharIndexAtPosition(n, 10, 10, CFG)
    expect(idx).toBeGreaterThanOrEqual(0)
  })

  it('handles newline segmentation', () => {
    const n = node('ab\ncd')
    const idx = getCharIndexAtPosition(n, 10, CFG.lineHeight + 2, CFG)
    expect(idx).toBeGreaterThan(2)
  })
})
