import type { NodeData, Point } from '@core/types'
import type { Dispatch } from 'react'
import type { Action } from '@app/state/uiReducer'
import { zoomAtPoint as coreZoomAtPoint } from '@core/canvas/PanZoom'
import { getCanvasPoint as coreGetCanvasPoint } from '@core/canvas/Coords'
import { computeFocus } from '@core/canvas/Focus'

export function createCanvasActions(dispatch: Dispatch<Action>, ui: {
  pan: Point
  scale: number
}) {
  const setPan = (p: Point) => { dispatch({ type: 'PAN_SET', pan: p }) }
  const setScale = (s: number) => { dispatch({ type: 'SCALE_SET', scale: s }) }
  const setPanScale = (p: Point, s: number) => { dispatch({ type: 'PAN_SCALE_SET', pan: p, scale: s }) }
  const zoomAtPoint = (rect: DOMRect, clientX: number, clientY: number, deltaY: number, min = 0.1, max = 10, speed = 0.001) => {
    const res = coreZoomAtPoint(ui.scale, ui.pan, rect, clientX, clientY, deltaY, min, max, speed)
    dispatch({ type: 'PAN_SCALE_SET', pan: res.pan, scale: res.scale })
  }
  const focusTo = (containerW: number, containerH: number, nodes: NodeData[], selectedIds: Set<string>) => {
    const res = computeFocus(containerW, containerH, nodes, selectedIds)
    dispatch({ type: 'PAN_SCALE_SET', pan: res.pan, scale: res.scale })
  }
  const getCanvasPoint = (rect: DOMRect, clientX: number, clientY: number) => coreGetCanvasPoint(rect, ui.pan, ui.scale, clientX, clientY)
  return { setPan, setScale, setPanScale, zoomAtPoint, focusTo, getCanvasPoint }
}
