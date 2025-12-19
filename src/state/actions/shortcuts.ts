import { listShortcutConfigs } from '@app/plugins/ui'

export function createPlainShortcuts(options: {
  shortcutMap: Record<string, string>
  comboShortcutMap?: Record<string, string>
  editingNodeId: string | null
  toggleCollision: () => void
  toggleShowDebugGrid: () => void
  alignSelectedLeft: () => void
  alignSelectedTop: () => void
  alignSelectedRight: () => void
  alignSelectedBottom: () => void
  distributeSelectedHorizontally: () => void
  distributeSelectedVertically: () => void
  onSave?: () => void
  onSaveAs?: () => void
  onLoad?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
}) {
  const m = options.shortcutMap
  const norm = (k?: string) => (k || '').toLowerCase().trim()
  const map: Record<string, () => void> = {}
  const add = (key: string | undefined, fn: () => void) => {
    const kk = norm(key)
    if (!kk) return
    map[kk] = fn
  }
  add(m.collisionToggle, () => { console.log('[Shortcut] plain:c'); options.toggleCollision() })
  add(m.gridToggle, () => { console.log('[Shortcut] plain:g'); options.toggleShowDebugGrid() })
  const cfgIds = new Set(listShortcutConfigs().map(e => e.id))
  if (cfgIds.has('alignLeft')) add(m.alignLeft, () => { if (!options.editingNodeId) options.alignSelectedLeft() })
  if (cfgIds.has('alignTop')) add(m.alignTop, () => { if (!options.editingNodeId) options.alignSelectedTop() })
  if (cfgIds.has('alignRight')) add(m.alignRight, () => { if (!options.editingNodeId) options.alignSelectedRight() })
  if (cfgIds.has('alignBottom')) add(m.alignBottom, () => { if (!options.editingNodeId) options.alignSelectedBottom() })
  if (cfgIds.has('distributeH')) add(m.distributeH, () => { if (!options.editingNodeId) options.distributeSelectedHorizontally() })
  if (cfgIds.has('distributeV')) add(m.distributeV, () => { if (!options.editingNodeId) options.distributeSelectedVertically() })
  const cm = options.comboShortcutMap || {}
  const addCombo = (key: string | undefined, fn: (() => void) | undefined) => {
    const kk = norm(key)
    if (!kk || !fn) return
    map[kk] = fn
  }
  addCombo(cm.save, options.onSave)
  addCombo(cm.saveAs, options.onSaveAs)
  addCombo(cm.load, options.onLoad)
  addCombo(cm.undo, options.onUndo)
  addCombo(cm.redo, options.onRedo)
  addCombo(cm.copy, options.onCopy)
  addCombo(cm.cut, options.onCut)
  addCombo(cm.paste, options.onPaste)
  console.log('[Shortcut] plain registered:', Object.keys(map).join(','))
  return map
}
