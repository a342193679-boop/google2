import { describe, it, expect, beforeEach } from 'vitest'
import { ShortcutManager } from '@core/shortcuts/ShortcutManager'

describe('ShortcutManager', () => {
  let sm: ShortcutManager
  let logs: string[]
  beforeEach(() => {
    logs = []
    ;(console as any).log = (msg: string) => { logs.push(msg) }
    sm = new ShortcutManager({
      onPlain: {
        'ctrl+s': () => logs.push('save-cb'),
        'ctrl+shift+s': () => logs.push('saveas-cb'),
        'ctrl+o': () => logs.push('load-cb'),
        'ctrl+z': () => logs.push('undo-cb'),
        'ctrl+shift+z': () => logs.push('redo-cb'),
        'ctrl+y': () => logs.push('redo-cb'),
        'a': () => logs.push('plain-a')
      }
    })
  })

  function fire(key: string, opts: any = {}) {
    ;(sm as any).handleKeyDown({ key, preventDefault() {}, ctrlKey: !!opts.ctrlKey, metaKey: !!opts.metaKey, shiftKey: !!opts.shiftKey })
  }

  it('triggers save with Ctrl+S and logs', () => {
    fire('s', { ctrlKey: true })
    expect(logs).toContain('[Shortcut] combo:ctrl+s')
    expect(logs).toContain('save-cb')
  })

  it('triggers saveAs with Ctrl+Shift+S and logs', () => {
    fire('s', { ctrlKey: true, shiftKey: true })
    expect(logs).toContain('[Shortcut] combo:ctrl+shift+s')
    expect(logs).toContain('saveas-cb')
  })

  it('triggers load with Ctrl+O and logs', () => {
    fire('o', { ctrlKey: true })
    expect(logs).toContain('[Shortcut] combo:ctrl+o')
    expect(logs).toContain('load-cb')
  })

  it('triggers undo with Ctrl+Z and redo with Ctrl+Shift+Z', () => {
    fire('z', { ctrlKey: true })
    fire('z', { ctrlKey: true, shiftKey: true })
    expect(logs).toContain('[Shortcut] combo:ctrl+z')
    expect(logs).toContain('[Shortcut] combo:ctrl+shift+z')
  })

  it('triggers redo with Ctrl+Y', () => {
    fire('y', { ctrlKey: true })
    expect(logs).toContain('[Shortcut] combo:ctrl+y')
    expect(logs).toContain('redo-cb')
  })

  it('triggers plain shortcut', () => {
    fire('a')
    expect(logs).toContain('[Shortcut] combo:a')
    expect(logs).toContain('plain-a')
  })
})
