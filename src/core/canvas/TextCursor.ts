import type { NodeData, GridConfig } from '@core/types'

export function getCharIndexAtPosition(node: NodeData, canvasX: number, canvasY: number, config: GridConfig): number {
  const localX = canvasX - node.x - config.paddingX
  const localY = canvasY - node.y - config.paddingY
  const maxAllowedWidth = config.maxNodeWidthUnits * config.baseUnit
  const charWidth = node.fontSize / 2
  const fullCharWidth = charWidth * 2
  const lines: number[] = []
  let i = 0
  const text = node.text || ''
  while (i < text.length) {
    let w = 0
    const start = i
    while (i < text.length) {
      const ch = text[i]
      const isFull = text.charCodeAt(i) > 255
      const cw = isFull ? fullCharWidth : charWidth
      if (ch === '\n') { i++; break }
      if (w + cw > maxAllowedWidth) break
      w += cw
      i++
    }
    lines.push(i - start)
    if (text[start] === '\n') lines[lines.length - 1] = 0
  }
  if (lines.length === 0) lines.push(0)
  let lineIndex = Math.floor(localY / config.lineHeight)
  if (lineIndex < 0) lineIndex = 0
  if (lineIndex >= lines.length) lineIndex = lines.length - 1
  const xTarget = Math.max(0, localX)
  let within = 0
  let acc = 0
  const startOffset = lines.slice(0, lineIndex).reduce((a, b) => a + b, 0)
  for (let k = 0; k < lines[lineIndex]; k++) {
    const idx = startOffset + k
    const isFull = text.charCodeAt(idx) > 255
    const cw = isFull ? fullCharWidth : charWidth
    if (acc + cw / 2 >= xTarget) { within = k; break }
    acc += cw
    within = k + 1
  }
  const pos = startOffset + within
  return Math.max(0, Math.min(pos, text.length))
}
