export type ShortcutCallbacks = {
  onSave?: () => void
  onSaveAs?: () => void
  onLoad?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onPlain?: Record<string, () => void>
}

export class ShortcutManager {
  private callbacks: ShortcutCallbacks
  private boundHandler: any
  private target: any
  private registered = false
  constructor(callbacks: ShortcutCallbacks, target?: any) {
    this.callbacks = callbacks
    this.boundHandler = this.handleKeyDown.bind(this)
    this.target = target ?? (typeof window !== 'undefined' ? window : null)
  }
  update(callbacks: ShortcutCallbacks) {
    this.callbacks = callbacks
    
    if (!this.registered) this.register()
  }
  register() {
    if (!this.target || this.registered) return
    this.target.addEventListener('keydown', this.boundHandler, { capture: true })
    this.registered = true
    console.log('[Shortcut] listener registered')
  }
  unregister() {
    if (!this.target || !this.registered) return
    this.target.removeEventListener('keydown', this.boundHandler, { capture: true } as any)
    this.registered = false
    console.log('[Shortcut] listener unregistered')
  }
  private handleKeyDown(e: KeyboardEvent) {
    const tgt = e.target as HTMLElement | null
    if (tgt) {
      const isInput = tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || (tgt as any).isContentEditable === true
      const isShortcutEdit = tgt.getAttribute('data-shortcut-edit') === 'true'
      if (isInput || isShortcutEdit) return
    }
    const k = e.key.toLowerCase()
    const mods: string[] = []
    if (e.ctrlKey) mods.push('ctrl')
    if (e.altKey) mods.push('alt')
    if (e.shiftKey) mods.push('shift')
    if (e.metaKey) mods.push('meta')
    const isModifierOnly = k === 'control' || k === 'shift' || k === 'alt' || k === 'meta'
    const parts = [...mods]
    if (!isModifierOnly && k) parts.push(k)
    const comboStr = parts.join('+')
    if (comboStr && this.callbacks.onPlain && this.callbacks.onPlain[comboStr]) {
      e.preventDefault(); console.log(`[Shortcut] combo:${comboStr}`); this.callbacks.onPlain[comboStr]!(); return
    }
    if (comboStr && this.callbacks.onPlain) {
      const known = Object.keys(this.callbacks.onPlain)
      if (known.length) console.log(`[Shortcut] combo unmatched:${comboStr}; known=[${known.join(',')}]`)
    }
    if (e.ctrlKey || e.metaKey) { return }
    if (this.callbacks.onPlain && this.callbacks.onPlain[k]) { e.preventDefault(); console.log(`[Shortcut] plain:${k}`); this.callbacks.onPlain[k]!(); return }
    if (this.callbacks.onPlain) {
      const known = Object.keys(this.callbacks.onPlain)
      if (known.length) console.log(`[Shortcut] plain ignored:${k}; known=[${known.join(',')}]`)
    }
  }
}
