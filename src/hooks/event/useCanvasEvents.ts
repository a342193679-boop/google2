import { useEffect, useMemo } from 'react'
import type { Point, NodeData } from '@core/types'
import { getCharIndexAtPosition as getCursorIndexCore } from '@core/canvas/TextCursor'
import type { Store } from '@app/state/CanvasStore'

type Refs = {
  containerRef: React.RefObject<HTMLDivElement>
  lastMousePosRef: React.MutableRefObject<Point>
  dragOffset: { x: number; y: number }
  setDragOffset: (v: { x: number; y: number }) => void
  hasMousePressedWhileSpaceRef?: React.MutableRefObject<boolean>
}

export function useCanvasEvents(
  storeRef: React.MutableRefObject<Store>, 
  refs: Refs,
  interactionState: { isPanning: boolean; isDragging: boolean; isSelecting: boolean }
) {
  const handleWheel = useMemo(() => (e: React.WheelEvent) => {
    const store = storeRef.current
    if (store.ui.editingNodeId) return
    if (!refs.containerRef.current) return
    const rect = refs.containerRef.current.getBoundingClientRect()
    store.zoomAtPoint(rect, e.clientX, e.clientY, e.deltaY, 0.1, 10, 0.001)
  }, [storeRef, refs])

  const handleMouseDown = useMemo(() => (e: React.MouseEvent) => {
    const store = storeRef.current
    const isBackground = (e.target as HTMLElement).id === 'canvas-bg'
    if (store.ui.isSpacePressed && refs.hasMousePressedWhileSpaceRef) refs.hasMousePressedWhileSpaceRef.current = true
    if (e.button === 1 || (store.ui.isSpacePressed && e.button === 0)) {
      e.preventDefault()
      store.setPanning(true)
      refs.setDragOffset({ x: e.clientX - store.ui.pan.x, y: e.clientY - store.ui.pan.y })
      return
    }
    if (isBackground && e.button === 0) {
      e.preventDefault()
      store.stopEditing()
      if (!e.shiftKey) store.clearSelected()
      const startPoint = store.getCanvasPoint(refs.containerRef.current!.getBoundingClientRect(), e.clientX, e.clientY)
      store.beginSelection(startPoint)
    }
  }, [storeRef, refs])

  // Internal Logic for Mouse Move (Shared by Window & Div)
  const onMoveInternal = (e: MouseEvent | React.MouseEvent) => {
    const store = storeRef.current
    store.setMousePos({ x: e.clientX, y: e.clientY })
    if (store.ui.isPanning) {
      e.preventDefault()
      store.setPan({ x: e.clientX - refs.dragOffset.x, y: e.clientY - refs.dragOffset.y })
      return
    }
    const canvasPos = store.getCanvasPoint(refs.containerRef.current!.getBoundingClientRect(), e.clientX, e.clientY)
    if (store.ui.isDragging && store.ui.selectedNodeIds.size > 0) {
      e.preventDefault()
      store.dragFrame(canvasPos)
      if (store.ui.rafId == null) {
        const id = requestAnimationFrame(() => {
          const step = store.applyDragFrame(
            canvasPos,
            refs.lastMousePosRef.current,
            store.ui.collisionEnabled
          )
          if (step.x !== 0 || step.y !== 0) {
             refs.lastMousePosRef.current = {
               x: refs.lastMousePosRef.current.x + step.x,
               y: refs.lastMousePosRef.current.y + step.y
             }
          }
          store.clearRafId()
        })
        store.setRafId(id)
      }
      return
    }
    if (store.ui.isSelecting && store.ui.selectionStart) {
      e.preventDefault()
      store.updateSelection({ x: canvasPos.x, y: canvasPos.y })
    }
  }

  const handleMouseMove = useMemo(() => (e: React.MouseEvent) => {
    onMoveInternal(e)
  }, [storeRef, refs])

  // Internal Logic for Mouse Up (Shared by Window & Div)
  const onUpInternal = (e: MouseEvent | React.MouseEvent) => {
    const store = storeRef.current
    store.setPanning(false)
    if (store.ui.isDragging) {
      if (store.ui.rafId != null) { cancelAnimationFrame(store.ui.rafId); store.clearRafId() }
      store.endDragAndSnap(store.ui.config)
    }
    if (store.ui.isSelecting && store.ui.selectionBox) {
      const sb = store.ui.selectionBox as { x: number; y: number; w: number; h: number }
      const newSelected = store.computeSelectionByBox(store.nodes, sb, store.ui.selectedNodeIds, (e as any).shiftKey)
      store.setSelected(newSelected)
      store.endSelection()
    }
  }

  const handleMouseUp = useMemo(() => (e: React.MouseEvent) => {
    onUpInternal(e)
  }, [storeRef])

  // --- Window Event Listeners for Dragging ---
  useEffect(() => {
    const { isPanning, isDragging, isSelecting } = interactionState
    if (isPanning || isDragging || isSelecting) {
      const onWinMove = (e: MouseEvent) => onMoveInternal(e)
      const onWinUp = (e: MouseEvent) => onUpInternal(e)
      
      window.addEventListener('mousemove', onWinMove)
      window.addEventListener('mouseup', onWinUp)
      return () => {
        window.removeEventListener('mousemove', onWinMove)
        window.removeEventListener('mouseup', onWinUp)
      }
    }
  }, [interactionState.isPanning, interactionState.isDragging, interactionState.isSelecting])


  const handleNodeMouseDown = useMemo(() => (e: React.MouseEvent, id: string) => {
    const store = storeRef.current
    e.stopPropagation()
    if (store.ui.editingNodeId !== id) e.preventDefault()
    if (store.ui.editingNodeId === id) return
    const newSelected = new Set(store.ui.selectedNodeIds)
    if ((e as any).shiftKey) {
      if (newSelected.has(id)) newSelected.delete(id)
      else newSelected.add(id)
      store.setSelected(newSelected)
    } else {
      if (!newSelected.has(id)) store.setSelected(new Set([id]))
    }
    const startPt = store.getCanvasPoint(refs.containerRef.current!.getBoundingClientRect(), (e as any).clientX, (e as any).clientY)
    refs.lastMousePosRef.current = startPt
    store.beginDrag(newSelected.size ? newSelected : new Set([id]), startPt)
    store.stopEditing()
  }, [storeRef, refs])

  const handleNodeDoubleClick = useMemo(() => (e: React.MouseEvent, id: string) => {
    const store = storeRef.current
    e.stopPropagation()
    const node = store.nodes.find(n => n.id === id)
    if (node) {
      const canvasPt = store.getCanvasPoint(refs.containerRef.current!.getBoundingClientRect(), (e as any).clientX, (e as any).clientY)
      const cursorIndex = getCursorIndexCore(node, canvasPt.x, canvasPt.y, store.ui.config)
      store.startEditing(id, cursorIndex)
      store.setSelected(new Set([id]))
    }
  }, [storeRef, refs])

  const handleCanvasDoubleClick = useMemo(() => (e: React.MouseEvent) => {
    const store = storeRef.current
    if ((e.target as HTMLElement).id === 'canvas-bg') {
      const canvasPos = store.getCanvasPoint(refs.containerRef.current!.getBoundingClientRect(), (e as any).clientX, (e as any).clientY)
      const defaultText = 'New'
      const newNode: NodeData = store.createDefaultNodeAt(
        defaultText,
        Math.round(canvasPos.x / store.ui.config.baseUnit) * store.ui.config.baseUnit,
        Math.round(canvasPos.y / store.ui.config.baseUnit) * store.ui.config.baseUnit,
      )
      store.addNode(newNode, true)
    }
  }, [storeRef, refs])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = storeRef.current
      if (e.code === 'Space' && !store.ui.isSpacePressed) {
        if (store.ui.editingNodeId) return
        e.preventDefault()
        store.setSpacePressed(true)
        if (refs.hasMousePressedWhileSpaceRef) refs.hasMousePressedWhileSpaceRef.current = false
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.ui.editingNodeId) return
        store.deleteSelected()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const store = storeRef.current
      if (e.code === 'Space') {
        if (store.ui.editingNodeId) return
        store.setSpacePressed(false)
        store.setPanning(false)
        if (refs.hasMousePressedWhileSpaceRef && !refs.hasMousePressedWhileSpaceRef.current) store.focusTo(refs.containerRef.current!.clientWidth, refs.containerRef.current!.clientHeight, store.nodes, store.ui.selectedNodeIds)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [storeRef, refs])

  return { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleNodeMouseDown, handleNodeDoubleClick, handleCanvasDoubleClick }
}
