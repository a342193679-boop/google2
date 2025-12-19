import type { Dispatch } from 'react'
import type { GridConfig } from '@core/types'
import type { Action } from '@app/state/uiReducer'

export function createUiActions(dispatch: Dispatch<Action>, queueSnapshot: () => void) {
  const beginDrag = (start: { x: number; y: number }) => { dispatch({ type: 'DRAG_BEGIN', start }) }
  const dragFrame = (latest: { x: number; y: number }) => { dispatch({ type: 'DRAG_FRAME', latest }) }
  const endDrag = () => { dispatch({ type: 'DRAG_END' }) }
  const beginSelection = (start: { x: number; y: number }) => { dispatch({ type: 'SELECT_BEGIN', start }) }
  const updateSelection = (latest: { x: number; y: number }) => { dispatch({ type: 'SELECT_UPDATE', latest }) }
  const endSelection = () => { dispatch({ type: 'SELECT_END' }) }
  const setSelected = (ids: Set<string>) => { dispatch({ type: 'SELECT_SET_IDS', ids }) }
  const clearSelected = () => { dispatch({ type: 'SELECT_CLEAR_IDS' }) }
  const toggleSelected = (id: string) => { dispatch({ type: 'SELECT_TOGGLE_ID', id }) }
  const toggleCollision = () => { dispatch({ type: 'COLLISION_TOGGLE' }) }
  const setCollisionEnabled = (v: boolean) => { dispatch({ type: 'COLLISION_SET', v }) }
  const setConfig = (cfg: GridConfig) => { dispatch({ type: 'CONFIG_SET', cfg }); queueSnapshot() }
  const setShowDebugGrid = (v: boolean) => { dispatch({ type: 'SHOW_DEBUG_SET', v }); queueSnapshot() }
  const toggleShowDebugGrid = () => { dispatch({ type: 'SHOW_DEBUG_TOGGLE' }); queueSnapshot() }
  const toggleSnapOnRelease = () => { dispatch({ type: 'SNAP_RELEASE_TOGGLE' }) }
  const setSnapOnRelease = (v: boolean) => { dispatch({ type: 'SNAP_RELEASE_SET', v }) }
  const setSidebarOpen = (open: boolean) => { dispatch({ type: 'SIDEBAR_SET_OPEN', open }) }
  const setActiveTab = (tab: 'general' | 'node') => { dispatch({ type: 'ACTIVE_TAB_SET', tab }) }
  const setPanning = (v: boolean) => { dispatch({ type: 'PAN_MODE_SET', v }) }
  const setSpacePressed = (v: boolean) => { dispatch({ type: 'SPACE_SET', v }) }
  const setShortcutKey = (id: string, key: string) => { dispatch({ type: 'SHORTCUT_SET', id, key }) }
  const setComboShortcutKey = (id: string, key: string) => { dispatch({ type: 'SHORTCUT_COMBO_SET', id, key }) }
  const setRafId = (id: number) => { dispatch({ type: 'RAF_SET', id }) }
  const clearRafId = () => { dispatch({ type: 'RAF_CLEAR' }) }
  const startEditing = (id: string, pos: number | null) => { dispatch({ type: 'EDIT_START', id, pos }) }
  const stopEditing = () => { dispatch({ type: 'EDIT_STOP' }) }
  const consumeInitialCursor = () => { dispatch({ type: 'EDIT_CONSUME_CURSOR' }) }
  const setMousePos = (pos: { x: number; y: number }) => { dispatch({ type: 'MOUSE_POS_SET', pos }) }
  return {
    beginDrag,
    dragFrame,
    endDrag,
    beginSelection,
    updateSelection,
    endSelection,
    setSelected,
    clearSelected,
    toggleSelected,
    toggleCollision,
    setCollisionEnabled,
    setConfig,
    setShowDebugGrid,
    toggleShowDebugGrid,
    toggleSnapOnRelease,
    setSnapOnRelease,
    setSidebarOpen,
    setActiveTab,
    setPanning,
    setSpacePressed,
    setShortcutKey,
    setComboShortcutKey,
    setRafId,
    clearRafId,
    startEditing,
    stopEditing,
    consumeInitialCursor,
    setMousePos,
  }
}
