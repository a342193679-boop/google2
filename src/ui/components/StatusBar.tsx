
type Props = {
  selectedCount: number
  scale: number
  canUndo: boolean
  canRedo: boolean
}

import { memo } from 'react'

function StatusBarImpl({ selectedCount, scale, canUndo, canRedo }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 px-4 py-2 rounded-full text-xs shadow-sm flex gap-6 font-mono text-gray-600 z-30 pointer-events-none select-none">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Select</span>
        <span className="font-bold text-blue-600">{selectedCount}</span>
      </div>
      <div className="w-px h-4 bg-gray-200"></div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Scale</span>
        <span className="font-bold text-blue-600">{(scale * 100).toFixed(0)}%</span>
      </div>
      <div className="w-px h-4 bg-gray-200"></div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Undo</span>
        <span className={`font-bold ${canUndo ? 'text-blue-600' : 'text-gray-300'}`}>{canUndo ? 'Ready' : 'None'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Redo</span>
        <span className={`font-bold ${canRedo ? 'text-blue-600' : 'text-gray-300'}`}>{canRedo ? 'Ready' : 'None'}</span>
      </div>
    </div>
  )
}

const areEqual = (a: Props, b: Props) =>
  a.selectedCount === b.selectedCount && a.scale === b.scale && a.canUndo === b.canUndo && a.canRedo === b.canRedo

export const StatusBar = memo(StatusBarImpl, areEqual)
