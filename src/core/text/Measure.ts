import type { GridConfig, NodeStyle } from '@core/types'

export function calculateNodeSize(text: string, style: NodeStyle, config: GridConfig) {
  const lines = text.split('\n')
  const maxAllowedWidth = config.maxNodeWidthUnits * config.baseUnit
  const charWidth = style.fontSize / 2
  const fullCharWidth = charWidth * 2

  let maxLineWidth = 0
  let totalVisualLines = 0

  lines.forEach(line => {
    let lineWidth = 0
    for (let i = 0; i < line.length; i++) {
      const isFullWidth = line.charCodeAt(i) > 255
      lineWidth += isFullWidth ? fullCharWidth : charWidth
    }
    if (lineWidth > maxAllowedWidth) {
      const linesNeeded = Math.ceil(lineWidth / maxAllowedWidth)
      totalVisualLines += linesNeeded
      maxLineWidth = maxAllowedWidth
    } else {
      totalVisualLines += 1
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth
    }
  })

  if (totalVisualLines === 0 && text.length === 0) totalVisualLines = 1

  const contentWidth = maxLineWidth + (config.paddingX * 2)
  const contentHeight = (totalVisualLines * config.lineHeight) + (config.paddingY * 2)

  const snappedWidth = Math.ceil(contentWidth / config.baseUnit) * config.baseUnit
  const snappedHeight = Math.ceil(contentHeight / config.baseUnit) * config.baseUnit

  return {
    width: Math.max(snappedWidth, config.baseUnit * 2),
    height: Math.max(snappedHeight, config.baseUnit * 2),
  }
}
