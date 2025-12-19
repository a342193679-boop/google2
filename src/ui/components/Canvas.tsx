import React, { memo, useEffect } from 'react'
import type { NodeData, GridConfig } from '@core/types'
import { NodeItem } from './NodeItem'

type Props = {
  containerRef: React.RefObject<HTMLDivElement>
  baseGridStyle: React.CSSProperties
  showDebugGrid: boolean
  pan: { x: number; y: number }
  scale: number
  isPanning: boolean
  isSpacePressed: boolean
  nodes: NodeData[]
  selectedNodeIds: Set<string>
  editingNodeId: string | null
  config: GridConfig
  selectionBox: { x: number; y: number; w: number; h: number } | null
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
  onWheel: (e: React.WheelEvent) => void
  onNodeMouseDown: (e: React.MouseEvent, id: string) => void
  onNodeDoubleClick: (e: React.MouseEvent, id: string) => void
  onTextChange: (id: string, value: string) => void
  onTextAreaBlur: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

function CanvasImpl({
  containerRef,
  baseGridStyle,
  showDebugGrid,
  pan,
  scale,
  isPanning,
  isSpacePressed,
  nodes,
  selectedNodeIds,
  editingNodeId,
  config,
  selectionBox,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onDoubleClick,
  onWheel,
  onNodeMouseDown,
  onNodeDoubleClick,
  onTextChange,
  onTextAreaBlur,
  textareaRef,
}: Props) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollLeft !== 0) el.scrollLeft = 0
      if (el.scrollTop !== 0) el.scrollTop = 0
    }
    const onWheel = (e: WheelEvent) => {
      if (editingNodeId) {
        e.preventDefault()
        if (el.scrollLeft !== 0) el.scrollLeft = 0
        if (el.scrollTop !== 0) el.scrollTop = 0
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
    }
  }, [containerRef, editingNodeId])
  return (
    <div
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-white ${isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      style={{ overscrollBehavior: 'contain' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
    >
      <div className="absolute inset-0 pointer-events-none" style={baseGridStyle}></div>

      {showDebugGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: `${config.baseUnit * scale}px ${config.baseUnit * scale}px`,
            backgroundImage:
              `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />
      )}

      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        <div id="canvas-bg" className="absolute -inset-[10000px] z-0" />

        {nodes.map((node, index) => (
          <NodeItem
            key={node.id}
            node={node}
            index={index}
            isSelected={selectedNodeIds.has(node.id)}
            isEditing={editingNodeId === node.id}
            config={config}
            textareaRef={textareaRef}
            onMouseDown={onNodeMouseDown}
            onDoubleClick={onNodeDoubleClick}
            onTextChange={onTextChange}
            onTextAreaBlur={onTextAreaBlur}
            isPanning={isPanning}
            isSpacePressed={isSpacePressed}
          />
        ))}

        {selectionBox && (
          <div
            className="absolute border border-blue-500 bg-blue-200/20 pointer-events-none z-[999]"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.w,
              height: selectionBox.h,
              borderWidth: `${config.selectionLineWidth}px`,
            }}
          />
        )}
      </div>
    </div>
  )
}

const areEqual = (a: Props, b: Props) =>
  a.baseGridStyle === b.baseGridStyle &&
  a.showDebugGrid === b.showDebugGrid &&
  a.pan.x === b.pan.x && a.pan.y === b.pan.y &&
  a.scale === b.scale &&
  a.isPanning === b.isPanning &&
  a.isSpacePressed === b.isSpacePressed &&
  a.nodes === b.nodes &&
  a.selectedNodeIds === b.selectedNodeIds &&
  a.editingNodeId === b.editingNodeId &&
  a.config === b.config &&
  a.selectionBox === b.selectionBox &&
  a.onMouseDown === b.onMouseDown &&
  a.onMouseMove === b.onMouseMove &&
  a.onMouseUp === b.onMouseUp &&
  a.onMouseLeave === b.onMouseLeave &&
  a.onDoubleClick === b.onDoubleClick &&
  a.onWheel === b.onWheel &&
  a.onNodeMouseDown === b.onNodeMouseDown &&
  a.onNodeDoubleClick === b.onNodeDoubleClick &&
  a.onTextChange === b.onTextChange &&
  a.onTextAreaBlur === b.onTextAreaBlur &&
  a.textareaRef === b.textareaRef

export const Canvas = memo(CanvasImpl, areEqual)
