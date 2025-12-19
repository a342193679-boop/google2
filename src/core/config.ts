import type { GridConfig, NodeStyle } from './types'

export const DEFAULT_CONFIG: GridConfig = {
  baseUnit: 5,
  lineHeight: 15,
  paddingX: 2.5,
  paddingY: 0,
  showBorder: true,
  borderWidth: 0.2,
  borderRadius: 3,
  selectionLineWidth: 0.5,
  maxNodeWidthUnits: 80,
  fontFamily: '"Sarasa Mono SC", "Sarasa Mono TC", "Inconsolata", monospace',
  snapStep: 1,
}

export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontSize: 10,
  isBold: false,
  textAlign: 'left',
}
