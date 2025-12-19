export type Point = { x: number; y: number }
export type Rect = { x: number; y: number; right: number; bottom: number }

export interface NodeStyle {
  backgroundColor: string
  textColor: string
  fontSize: number
  isBold: boolean
  textAlign?: 'left' | 'center' | 'right'
}

export type NodeData = {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
} & NodeStyle

export type GridConfig = {
  baseUnit: number
  lineHeight: number
  paddingX: number
  paddingY: number
  showBorder: boolean
  borderWidth: number
  borderRadius: number
  selectionLineWidth: number
  maxNodeWidthUnits: number
  fontFamily: string
  snapStep: number
}

export type CanvasState = {
  nodes: NodeData[]
  config: GridConfig
  scale: number
  pan: { x: number; y: number }
  showDebugGrid: boolean
  selectedNodeIds: string[]
  collisionEnabled: boolean
}

export interface ShortcutCallbacks {
  onSave?: () => void
  onSaveAs?: () => void
  onLoad?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
  [key: string]: (() => void) | undefined
}

