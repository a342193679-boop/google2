import type { GridConfig } from '@core/types'
import { DEFAULT_CONFIG } from '@core/config'
import { safeGetItem, safeSetItem } from '@core/io/LocalStorage'
import { SHORTCUT_KEY, SHORTCUT_COMBO_KEY } from '@app/state/constants'

export type UIState = {
  isDragging: boolean
  isSelecting: boolean
  selectionStart: { x: number; y: number } | null
  selectionBox: { x: number; y: number; w: number; h: number } | null
  rafId: number | null
  latestMousePos: { x: number; y: number }
  editingNodeId: string | null
  initialCursorPos: number | null
  pan: { x: number; y: number }
  scale: number
  selectedNodeIds: Set<string>
  collisionEnabled: boolean
  config: GridConfig
  showDebugGrid: boolean
  snapOnRelease: boolean
  sidebarOpen: boolean
  activeTab: 'general' | 'node'
  isPanning: boolean
  isSpacePressed: boolean
  shortcutMap: Record<string, string>
  comboShortcutMap: Record<string, string>
}

export type Action =
  | { type: 'DRAG_BEGIN'; start: { x: number; y: number } }
  | { type: 'DRAG_FRAME'; latest: { x: number; y: number } }
  | { type: 'DRAG_END' }
  | { type: 'SELECT_BEGIN'; start: { x: number; y: number } }
  | { type: 'SELECT_UPDATE'; latest: { x: number; y: number } }
  | { type: 'SELECT_END' }
  | { type: 'RAF_SET'; id: number }
  | { type: 'RAF_CLEAR' }
  | { type: 'EDIT_START'; id: string; pos: number | null }
  | { type: 'EDIT_STOP' }
  | { type: 'EDIT_CONSUME_CURSOR' }
  | { type: 'PAN_SET'; pan: { x: number; y: number } }
  | { type: 'SCALE_SET'; scale: number }
  | { type: 'PAN_SCALE_SET'; pan: { x: number; y: number }; scale: number }
  | { type: 'SELECT_SET_IDS'; ids: Set<string> }
  | { type: 'SELECT_CLEAR_IDS' }
  | { type: 'SELECT_TOGGLE_ID'; id: string }
  | { type: 'COLLISION_TOGGLE' }
  | { type: 'COLLISION_SET'; v: boolean }
  | { type: 'CONFIG_SET'; cfg: GridConfig }
  | { type: 'SHOW_DEBUG_SET'; v: boolean }
  | { type: 'SHOW_DEBUG_TOGGLE' }
  | { type: 'SNAP_RELEASE_TOGGLE' }
  | { type: 'SNAP_RELEASE_SET'; v: boolean }
  | { type: 'SIDEBAR_SET_OPEN'; open: boolean }
  | { type: 'ACTIVE_TAB_SET'; tab: 'general' | 'node' }
  | { type: 'PAN_MODE_SET'; v: boolean }
  | { type: 'SPACE_SET'; v: boolean }
  | { type: 'SHORTCUT_SET'; id: string; key: string }
  | { type: 'SHORTCUT_COMBO_SET'; id: string; key: string }
  | { type: 'MOUSE_POS_SET'; pos: { x: number; y: number } }

export const defaultShortcuts = { collisionToggle: 'c', gridToggle: 'g', alignLeft: 'a', alignTop: 't', alignRight: 'r', alignBottom: 'b', distributeH: 'h', distributeV: 'v' }
export const defaultComboShortcuts = { save: 'ctrl+s', saveAs: 'ctrl+shift+s', load: 'ctrl+o', undo: 'ctrl+z', redo: 'ctrl+y', copy: 'ctrl+c', cut: 'ctrl+x', paste: 'ctrl+v' }

export function loadShortcutMap(): Record<string, string> {
  const raw = safeGetItem(SHORTCUT_KEY)
  if (!raw) return defaultShortcuts
  try {
    const obj = JSON.parse(raw)
    return { ...defaultShortcuts, ...obj }
  } catch {
    return defaultShortcuts
  }
}

export function loadComboShortcutMap(): Record<string, string> {
  const raw = safeGetItem(SHORTCUT_COMBO_KEY)
  if (!raw) return defaultComboShortcuts
  try {
    const obj = JSON.parse(raw)
    return { ...defaultComboShortcuts, ...obj }
  } catch {
    return defaultComboShortcuts
  }
}

export function buildInitialUI(): UIState {
  return {
    isDragging: false,
    isSelecting: false,
    selectionStart: null,
    selectionBox: null,
    rafId: null,
    latestMousePos: { x: 0, y: 0 },
    editingNodeId: null,
    initialCursorPos: null,
    pan: { x: 50, y: 50 },
    scale: 3,
    selectedNodeIds: new Set<string>(),
    collisionEnabled: true,
    config: DEFAULT_CONFIG,
    showDebugGrid: false,
    snapOnRelease: true,
    sidebarOpen: true,
    activeTab: 'general',
    isPanning: false,
    isSpacePressed: false,
    shortcutMap: loadShortcutMap(),
    comboShortcutMap: loadComboShortcutMap(),
  }
}

export function reducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case 'DRAG_BEGIN':
      return { ...state, isDragging: true, latestMousePos: action.start }
    case 'DRAG_FRAME':
      return { ...state, latestMousePos: action.latest }
    case 'DRAG_END':
      return { ...state, isDragging: false }
    case 'SELECT_BEGIN':
      return { ...state, isSelecting: true, selectionStart: action.start, selectionBox: { x: action.start.x, y: action.start.y, w: 0, h: 0 } }
    case 'SELECT_UPDATE': {
      if (!state.selectionStart) return state
      const x = Math.min(state.selectionStart.x, action.latest.x)
      const y = Math.min(state.selectionStart.y, action.latest.y)
      const w = Math.abs(action.latest.x - state.selectionStart.x)
      const h = Math.abs(action.latest.y - state.selectionStart.y)
      return { ...state, latestMousePos: action.latest, selectionBox: { x, y, w, h } }
    }
    case 'SELECT_END':
      return { ...state, isSelecting: false, selectionStart: null }
    case 'RAF_SET':
      return { ...state, rafId: action.id }
    case 'RAF_CLEAR':
      return { ...state, rafId: null }
    case 'EDIT_START':
      return { ...state, editingNodeId: action.id, initialCursorPos: action.pos }
    case 'EDIT_STOP':
      return { ...state, editingNodeId: null }
    case 'EDIT_CONSUME_CURSOR':
      return { ...state, initialCursorPos: null }
    case 'PAN_SET':
      return { ...state, pan: action.pan }
    case 'SCALE_SET':
      return { ...state, scale: action.scale }
    case 'PAN_SCALE_SET':
      return { ...state, pan: action.pan, scale: action.scale }
    case 'SELECT_SET_IDS':
      return { ...state, selectedNodeIds: new Set(action.ids) }
    case 'SELECT_CLEAR_IDS':
      return { ...state, selectedNodeIds: new Set() }
    case 'SELECT_TOGGLE_ID': {
      const next = new Set(state.selectedNodeIds)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selectedNodeIds: next }
    }
    case 'COLLISION_TOGGLE':
      return { ...state, collisionEnabled: !state.collisionEnabled }
    case 'COLLISION_SET':
      return { ...state, collisionEnabled: action.v }
    case 'CONFIG_SET':
      return { ...state, config: action.cfg }
    case 'SHOW_DEBUG_SET':
      return { ...state, showDebugGrid: action.v }
    case 'SHOW_DEBUG_TOGGLE':
      return { ...state, showDebugGrid: !state.showDebugGrid }
    case 'SNAP_RELEASE_TOGGLE':
      return { ...state, snapOnRelease: !state.snapOnRelease }
    case 'SNAP_RELEASE_SET':
      return { ...state, snapOnRelease: action.v }
    case 'SIDEBAR_SET_OPEN':
      return { ...state, sidebarOpen: action.open }
    case 'ACTIVE_TAB_SET':
      return { ...state, activeTab: action.tab }
    case 'PAN_MODE_SET':
      return { ...state, isPanning: action.v }
    case 'SPACE_SET':
      return { ...state, isSpacePressed: action.v }
    case 'SHORTCUT_SET': {
      const map = { ...state.shortcutMap, [action.id]: action.key }
      safeSetItem(SHORTCUT_KEY, JSON.stringify(map))
      return { ...state, shortcutMap: map }
    }
    case 'SHORTCUT_COMBO_SET': {
      const map = { ...state.comboShortcutMap, [action.id]: action.key }
      safeSetItem(SHORTCUT_COMBO_KEY, JSON.stringify(map))
      return { ...state, comboShortcutMap: map }
    }
    case 'MOUSE_POS_SET':
      return { ...state, latestMousePos: action.pos }
    default:
      return state
  }
}
