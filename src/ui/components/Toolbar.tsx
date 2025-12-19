import { memo } from 'react'
import { Trash2, Save, FolderOpen, Shield, Settings } from 'lucide-react'
import { listToolbarActions } from '@app/plugins/ui'

type Props = {
  isPanning: boolean
  onSelectMode: () => void
  onPanMode: () => void
  onDelete: () => void
  onSave: () => void
  onSaveAs: () => void
  onLoad: () => void
  collisionEnabled: boolean
  onToggleCollision: () => void
  onOpenSettings: () => void
  snapOnRelease: boolean
}

function ToolbarImpl({ isPanning, onSelectMode, onPanMode, onDelete, onSave, onSaveAs, onLoad, collisionEnabled, onToggleCollision, onOpenSettings, snapOnRelease }: Props) {
  return (
    <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-20 shadow-sm shrink-0">
      
      <button className={`w-9 h-9 rounded-md mb-2 transition-colors border flex items-center justify-center ${collisionEnabled ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-400 hover:text-gray-600 border-gray-200 shadow-sm'}`} onClick={onToggleCollision} title="碰撞">
        <span className="relative inline-block">
          <Shield size={16} />
          {!collisionEnabled && (
            <svg className="absolute inset-0" viewBox="0 0 20 20">
              <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            </svg>
          )}
        </span>
      </button>
      <div className="h-px w-8 bg-gray-200 my-2"></div>
      <button className="w-9 h-9 rounded-md mb-2 bg-white text-gray-400 hover:text-red-500 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
      <div className="h-px w-9 bg-gray-200 my-1"></div>
      <button className="w-9 h-9 rounded-md mb-2 bg-white text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={onSave} title="保存 (Ctrl+S)">
        <Save size={16} />
      </button>
      <button className="w-9 h-9 rounded-md mb-2 bg-white text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={onSaveAs} title="另存为 (Ctrl+Shift+S)">
        <span className="relative inline-block">
          <Save size={16} />
          <svg className="absolute -right-0.5 -top-0.5" width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill="currentColor" opacity="0.25" />
            <line x1="5" y1="2.5" x2="5" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </button>
      <button className="w-9 h-9 rounded-md mb-2 bg白 text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={onLoad} title="加载 (Ctrl+O)">
        <FolderOpen size={16} />
      </button>
      {(() => {
        const entries = listToolbarActions()
        if (entries.length === 0) return null
        let prevGroup: string | undefined = undefined
        const blocks: any[] = []
        blocks.push(<div key="sep-builtin" className="h-px w-9 bg-gray-200 my-1" />)
        entries.forEach((e, idx) => {
          if (prevGroup != null && e.group !== prevGroup) {
            blocks.push(<div key={`sep-${idx}`} className="h-px w-9 bg-gray-200 my-1" />)
          }
          blocks.push(<div key={`btn-${idx}`} className="mt-2">{e.render({ isPanning, onSelectMode, onPanMode, onDelete, onSave, onSaveAs, onLoad, collisionEnabled, onToggleCollision, snapOnRelease })}</div>)
          prevGroup = e.group
        })
        return blocks
      })()}
      <div className="mt-auto" />
      <div className="h-px w-9 bg-gray-200 my-1"></div>
      <button className="w-9 h-9 rounded-md mb-2 bg白 text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={onOpenSettings} title="设置">
        <Settings size={16} />
      </button>
    </div>
  )
}

const areEqual = (a: Props, b: Props) =>
  a.isPanning === b.isPanning &&
  a.collisionEnabled === b.collisionEnabled &&
  a.onSelectMode === b.onSelectMode &&
  a.onPanMode === b.onPanMode &&
  a.onDelete === b.onDelete &&
  a.onSave === b.onSave &&
  a.onSaveAs === b.onSaveAs &&
  a.onLoad === b.onLoad &&
  a.onToggleCollision === b.onToggleCollision
  && a.onOpenSettings === b.onOpenSettings
  && a.snapOnRelease === b.snapOnRelease

export const Toolbar = memo(ToolbarImpl, areEqual)
