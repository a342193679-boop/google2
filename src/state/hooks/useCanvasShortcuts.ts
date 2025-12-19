import { MutableRefObject } from 'react'
import type { ShortcutCallbacks } from '@core/types'
import { ShortcutManager } from '@core/shortcuts/ShortcutManager'
import { createPlainShortcuts } from '@app/state/actions/shortcuts'
import { NodesSlice } from '../slices/NodesSlice'
import { UISlice } from '../slices/UISlice'

export function useCanvasShortcuts(
  shortcuts: MutableRefObject<ShortcutManager | null>,
  ui: { 
    shortcutMap: Record<string, string>;
    comboShortcutMap: Record<string, string>;
    editingNodeId: string | null 
  },
  nodesSlice: NodesSlice,
  uiSlice: UISlice
) {
  const registerShortcuts = (cbs: ShortcutCallbacks) => {
    if (!shortcuts.current) {
      shortcuts.current = new ShortcutManager(cbs)
      shortcuts.current.register()
    } else {
      shortcuts.current.update(cbs)
    }
  }

  const buildPlainShortcuts = (cbs: ShortcutCallbacks) => createPlainShortcuts({
    shortcutMap: ui.shortcutMap,
    comboShortcutMap: ui.comboShortcutMap,
    editingNodeId: ui.editingNodeId,
    toggleCollision: uiSlice.toggleCollision,
    toggleShowDebugGrid: uiSlice.toggleShowDebugGrid,
    alignSelectedLeft: nodesSlice.alignSelectedLeft,
    alignSelectedTop: nodesSlice.alignSelectedTop,
    alignSelectedRight: nodesSlice.alignSelectedRight,
    alignSelectedBottom: nodesSlice.alignSelectedBottom,
    distributeSelectedHorizontally: nodesSlice.distributeSelectedHorizontally,
    distributeSelectedVertically: nodesSlice.distributeSelectedVertically,
    ...cbs
  })

  return { registerShortcuts, buildPlainShortcuts }
}
