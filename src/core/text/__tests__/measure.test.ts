import { describe, it, expect } from 'vitest'
import { calculateNodeSize } from '../Measure'
import type { GridConfig, NodeStyle } from '../../types'

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

const STYLE: NodeStyle = { backgroundColor: '#fff', textColor: '#000', fontSize: 10, isBold: false }

describe('calculateNodeSize', () => {
  it('returns minimum snapped size for empty text', () => {
    const size = calculateNodeSize('', STYLE, CFG)
    expect(size.width).toBeGreaterThanOrEqual(CFG.baseUnit * 2)
    expect(size.height).toBeGreaterThanOrEqual(CFG.baseUnit * 2)
  })

  it('increases height with newline', () => {
    const a = calculateNodeSize('line', STYLE, CFG)
    const b = calculateNodeSize('line\nline', STYLE, CFG)
    expect(b.height).toBeGreaterThan(a.height)
  })
})
