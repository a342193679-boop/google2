import type { ReactNode } from 'react'

export type ToolbarActionRenderer = (props: {
  isPanning: boolean
  onSelectMode: () => void
  onPanMode: () => void
  onDelete: () => void
  onSave: () => void
  onSaveAs: () => void
  onLoad: () => void
  collisionEnabled: boolean
  onToggleCollision: () => void
  snapOnRelease: boolean
}) => ReactNode

export type SidebarPanelRenderer = (props: any) => ReactNode

type ToolbarEntry = { render: ToolbarActionRenderer; group?: string }
type SidebarEntry = { render: SidebarPanelRenderer }
type ShortcutConfigEntry = { id: string; label: string; group?: string }

const toolbarActions: ToolbarEntry[] = []
const sidebarPanels: SidebarEntry[] = []
const shortcutConfigs: ShortcutConfigEntry[] = []

export function registerToolbarAction(r: ToolbarActionRenderer, group?: string) {
  const e = { render: r, group }
  toolbarActions.push(e)
  return () => { const i = toolbarActions.indexOf(e); if (i >= 0) toolbarActions.splice(i, 1) }
}
export function listToolbarActions() { return toolbarActions.slice() }
export function registerSidebarPanel(r: SidebarPanelRenderer) {
  const e = { render: r }
  sidebarPanels.push(e)
  return () => { const i = sidebarPanels.indexOf(e); if (i >= 0) sidebarPanels.splice(i, 1) }
}
export function listSidebarPanels() { return sidebarPanels.map(e => e.render) }

export function registerShortcutConfig(entry: ShortcutConfigEntry) {
  const e = { ...entry }
  shortcutConfigs.push(e)
  return () => { const i = shortcutConfigs.indexOf(e); if (i >= 0) shortcutConfigs.splice(i, 1) }
}
export function listShortcutConfigs() { return shortcutConfigs.slice() }
