import { describe, it, expect } from 'vitest'
import { reducer, buildInitialUI } from '@app/state/uiReducer'


describe('uiReducer', () => {
  it('toggles selecting state', () => {
    const s0 = buildInitialUI()
    const s1 = reducer(s0, { type: 'SELECT_BEGIN', start: { x: 10, y: 20 } })
    expect(s1.isSelecting).toBe(true)
    expect(s1.selectionBox).toEqual({ x: 10, y: 20, w: 0, h: 0 })
    const s2 = reducer(s1, { type: 'SELECT_UPDATE', latest: { x: 20, y: 30 } })
    expect(s2.selectionBox).toEqual({ x: 10, y: 20, w: 10, h: 10 })
    const s3 = reducer(s2, { type: 'SELECT_END' })
    expect(s3.isSelecting).toBe(false)
    expect(s3.selectionStart).toBeNull()
  })

  it('sets shortcut key and persists', () => {
    const s0 = buildInitialUI()
    const s1 = reducer(s0, { type: 'SHORTCUT_SET', id: 'gridToggle', key: 'x' })
    expect(s1.shortcutMap.gridToggle).toBe('x')
  })
})
