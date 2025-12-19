import { memo } from 'react'
import type { NodeData, GridConfig } from '@core/types'

type Props = {
  node: NodeData
  index: number
  isSelected: boolean
  isEditing: boolean
  config: GridConfig
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onMouseDown: (e: React.MouseEvent, id: string) => void
  onDoubleClick: (e: React.MouseEvent, id: string) => void
  onTextChange: (id: string, value: string) => void
  onTextAreaBlur: () => void
  isPanning: boolean
  isSpacePressed: boolean
}

function NodeItemImpl({ node, index, isSelected, isEditing, config, textareaRef, onMouseDown, onDoubleClick, onTextChange, onTextAreaBlur, isPanning, isSpacePressed }: Props) {
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onDoubleClick={(e) => onDoubleClick(e, node.id)}
      draggable={false}
      className={`absolute group`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        backgroundColor: node.backgroundColor,
        borderRadius: `${config.borderRadius}px`,
        boxShadow: isSelected
          ? `inset 0 0 0 ${config.borderWidth}px ${node.textColor}, 0 0 0 ${config.selectionLineWidth}px #3b82f6`
          : config.showBorder
          ? `inset 0 0 0 ${config.borderWidth}px ${node.textColor}`
          : 'none',
        overflow: 'hidden',
        paddingTop: `${config.paddingY}px`,
        paddingBottom: `${config.paddingY}px`,
        paddingLeft: `${config.paddingX}px`,
        paddingRight: `${config.paddingX}px`,
        zIndex: isSelected ? 100 : index,
        cursor: isEditing ? 'text' : isPanning || isSpacePressed ? 'grab' : 'default',
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={node.text}
          onChange={(e) => onTextChange(node.id, e.target.value)}
          autoFocus
          onBlur={onTextAreaBlur}
          style={{
            fontFamily: config.fontFamily,
            fontSize: `${node.fontSize}px`,
            lineHeight: `${config.lineHeight}px`,
            textAlign: node.textAlign || 'left',
            padding: 0,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            letterSpacing: '0px',
            fontWeight: node.isBold ? 700 : 400,
            color: node.textColor,
            width: '100%',
            height: '100%',
            display: 'block',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            userSelect: 'text',
            cursor: 'text',
          }}
        />
      ) : (
        <div
          style={{
            fontFamily: config.fontFamily,
            fontSize: `${node.fontSize}px`,
            lineHeight: `${config.lineHeight}px`,
            textAlign: node.textAlign || 'left',
            padding: 0,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            letterSpacing: '0px',
            fontWeight: node.isBold ? 700 : 400,
            color: node.textColor,
            width: '100%',
            height: '100%',
            display: 'block',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            userSelect: 'none',
            cursor: 'inherit',
          }}
          draggable={false}
        >
          {node.text}
        </div>
      )}
    </div>
  )
}

const areEqual = (a: Props, b: Props) =>
  a.node === b.node &&
  a.index === b.index &&
  a.isSelected === b.isSelected &&
  a.isEditing === b.isEditing &&
  a.config === b.config &&
  a.isPanning === b.isPanning &&
  a.isSpacePressed === b.isSpacePressed &&
  a.onMouseDown === b.onMouseDown &&
  a.onDoubleClick === b.onDoubleClick &&
  a.onTextChange === b.onTextChange &&
  a.onTextAreaBlur === b.onTextAreaBlur

export const NodeItem = memo(NodeItemImpl, areEqual)
