import { memo, useState, useEffect } from 'react'
import { X, Keyboard, Puzzle } from 'lucide-react'
import { listShortcutConfigs } from '@app/plugins/ui'
import { publishEvent } from '@app/plugins/events'
import { defaultComboShortcuts } from '@app/state/uiReducer'
import { defaultShortcuts } from '@app/state/uiReducer'
import { listPlugins, enablePlugin, disablePlugin, uninstallPlugin, installPlugin, installPluginFromUrl } from '@app/plugins/registry'
import { alignSnapPlugin } from '@app/plugins/examples/AlignSnapPlugin'

type Props = {
  isOpen: boolean
  onClose: () => void
  shortcutMap: Record<string, string>
  comboShortcutMap?: Record<string, string>
  setShortcutKey: (id: string, key: string) => void
  setComboShortcutKey?: (id: string, key: string) => void
}

function SettingsModalImpl({ isOpen, onClose, shortcutMap, comboShortcutMap, setShortcutKey, setComboShortcutKey }: Props) {
  const [tab, setTab] = useState<'shortcuts' | 'plugins'>('shortcuts')
  const [plugins, setPlugins] = useState<{ id: string; enabled: boolean; meta?: { name: string; version: string; description?: string } }[]>([])
  const [installUrl, setInstallUrl] = useState('')
  useEffect(() => { if (isOpen) setPlugins(listPlugins()) }, [isOpen])
  if (!isOpen) return null
  const parseCombo = (v: string) => {
    const parts = (v || '').split('+').filter(Boolean)
    const flags = { ctrl: false, shift: false, alt: false, meta: false, key: '' }
    parts.forEach(p => {
      const t = p.toLowerCase()
      if (t === 'ctrl') flags.ctrl = true
      else if (t === 'shift') flags.shift = true
      else if (t === 'alt') flags.alt = true
      else if (t === 'meta') flags.meta = true
      else flags.key = t
    })
    return flags
  }
  const combineCombo = (f: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string }) => {
    const parts: string[] = []
    if (f.ctrl) parts.push('ctrl')
    if (f.shift) parts.push('shift')
    if (f.alt) parts.push('alt')
    if (f.meta) parts.push('meta')
    if (f.key) parts.push(f.key.toLowerCase())
    return parts.join('+')
  }
  const ResetIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H6V3L1 8L6 13V10H8C11.31 10 14 12.69 14 16C14 19.31 11.31 22 8 22C4.69 22 2 19.31 2 16H0C0 20.42 3.58 24 8 24C12.42 24 16 20.42 16 16C16 11.58 12.42 8 8 8Z" fill="currentColor"/>
    </svg>
  )
  const Toggle = ({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) => (
    <button className={`px-2 h-6 rounded-full text-[11px] ${on ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => onChange(!on)}>{label}</button>
  )
  const ShortcutRow = ({ id, label, variant }: { id: string; label: string; variant?: 'plugin' | 'default' }) => {
    const flags = parseCombo(shortcutMap[id] || '')
    const currentKey = (shortcutMap[id] || '').toLowerCase()
    const otherKeys = Object.entries(shortcutMap).filter(([k]) => k !== id).map(([,v]) => (v||'').toLowerCase())
    const hasConflict = !!currentKey && otherKeys.includes(currentKey)
    const setFlags = (next: Partial<typeof flags>) => {
      const merged = { ...flags, ...next }
      const nextKey = combineCombo(merged)
      const keys = Object.entries(shortcutMap).filter(([k]) => k !== id).map(([,v]) => (v||'').toLowerCase())
      const conflict = nextKey && keys.includes(nextKey)
      if (conflict) { publishEvent('notify', { type: 'error', message: `快捷键与其它功能冲突: ${nextKey}` }); return }
      setShortcutKey(id, nextKey)
    }
    return (
      <div className={`flex items-center gap-1 pr-2 border rounded-md px-2 py-2 shadow-sm ${hasConflict ? 'bg-red-700 border-red-700 text-white' : (variant==='plugin' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white')}`}>
        <div className="text-xs text-gray-800 w-16 shrink-0">{label}</div>
        <div className="flex items-center gap-1 flex-1">
          <Toggle on={flags.ctrl} label="Ctrl" onChange={(v)=>setFlags({ ctrl: v })} />
          <Toggle on={flags.shift} label="Shift" onChange={(v)=>setFlags({ shift: v })} />
          <Toggle on={flags.alt} label="Alt" onChange={(v)=>setFlags({ alt: v })} />
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-600">Key:</span>
            <input data-shortcut-edit="true" value={flags.key} onKeyDown={(e)=>{const k=e.key.toLowerCase(); const isMod=k==='control'||k==='shift'||k==='alt'||k==='meta'; if (!isMod) { e.preventDefault(); setFlags({ key: k }) } }} onChange={(e)=>setFlags({ key: e.target.value.toLowerCase() })} className="border border-gray-200 rounded px-2 h-6 text-xs w-12" />
          </div>
          <button className="w-6 h-6 ml-2 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={()=>setShortcutKey(id, (defaultShortcuts as any)[id] || '')}><ResetIcon/></button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[1280px] max-w-[80vw]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="text-sm font-medium">设置</div>
          <button className="p-2 text-gray-500 hover:text-gray-800" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab('shortcuts')} className={`flex-1 py-2 text-xs ${tab==='shortcuts'?'text-blue-600 bg-blue-50':'text-gray-600 hover:bg-gray-50'}`}><span className="inline-flex items-center gap-1"><Keyboard size={12}/> 快捷键</span></button>
          <button onClick={() => setTab('plugins')} className={`flex-1 py-2 text-xs ${tab==='plugins'?'text-blue-600 bg-blue-50':'text-gray-600 hover:bg-gray-50'}`}><span className="inline-flex items-center gap-1"><Puzzle size={12}/> 插件</span></button>
        </div>
        <div className="p-4">
          {tab === 'shortcuts' && (
            <div className="grid grid-cols-4 gap-x-3 gap-y-3">
              <ShortcutRow id="collisionToggle" label="碰撞" />
              <ShortcutRow id="gridToggle" label="网格" />
              {(() => {
                const cm = comboShortcutMap || {}
                const Row = ({ id, label }: { id: string; label: string }) => {
                  const flags = parseCombo(cm[id] || '')
                  const cur = (cm[id] || '').toLowerCase()
                  const comboOthers = Object.entries(cm).filter(([k]) => k !== id).map(([,v]) => (v||'').toLowerCase())
                  const plainAll = Object.values(shortcutMap).map(v => (v||'').toLowerCase())
                  const hasConflict = !!cur && (comboOthers.includes(cur) || plainAll.includes(cur))
                  const setFlags = (next: Partial<typeof flags>) => {
                    const merged = { ...flags, ...next }
                    const nextKey = combineCombo(merged)
                    const keysPlain = Object.values(shortcutMap).map(v => (v||'').toLowerCase())
                    const keysCombo = Object.entries(cm).filter(([k]) => k !== id).map(([,v]) => (v||'').toLowerCase())
                    const conflict = nextKey && (keysCombo.includes(nextKey) || keysPlain.includes(nextKey))
                    if (conflict) { publishEvent('notify', { type: 'error', message: `组合快捷键冲突: ${nextKey}` }); return }
                    setComboShortcutKey?.(id, nextKey)
                  }
                  return (
                    <div className={`flex items-center gap-1 pr-2 border rounded-md px-2 py-2 shadow-sm ${hasConflict ? 'bg-red-700 border-red-700 text-white' : 'border-gray-200 bg-white'}`}>
                      <div className="text-xs text-gray-800 w-16 shrink-0">{label}</div>
                      <div className="flex items-center gap-1 flex-1">
                        <Toggle on={flags.ctrl} label="Ctrl" onChange={(v)=>setFlags({ ctrl: v })} />
                        <Toggle on={flags.shift} label="Shift" onChange={(v)=>setFlags({ shift: v })} />
                        <Toggle on={flags.alt} label="Alt" onChange={(v)=>setFlags({ alt: v })} />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-600">Key:</span>
                          <input data-shortcut-edit="true" value={flags.key} onKeyDown={(e)=>{const k=e.key.toLowerCase(); const isMod=k==='control'||k==='shift'||k==='alt'||k==='meta'; if (!isMod) { e.preventDefault(); setFlags({ key: k }) } }} onChange={(e)=>setFlags({ key: e.target.value.toLowerCase() })} className="border border-gray-200 rounded px-2 h-6 text-xs w-12" />
                        </div>
                        <button className="w-6 h-6 ml-2 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={()=>setComboShortcutKey?.(id, (defaultComboShortcuts as any)[id] || '')}><ResetIcon/></button>
                      </div>
                    </div>
                  )
                }
                return (
                  <>
                    <Row id="save" label="保存" />
                    <Row id="saveAs" label="另存" />
                    <Row id="load" label="加载" />
                    <Row id="undo" label="撤销" />
                    <Row id="redo" label="重做" />
                  </>
                )
              })()}
              {listShortcutConfigs().map(e => (
                <ShortcutRow key={e.id} id={e.id} label={e.label} variant="plugin" />
              ))}
            </div>
          )}
          {tab === 'plugins' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600">已安装插件</div>
              <div className="space-y-2">
                {plugins.length === 0 && <div className="text-xs text-gray-400">暂无插件</div>}
                {plugins.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="font-mono">{p.meta?.name || p.id} <span className="text-gray-400">{p.meta?.version}</span></div>
                      <span className={`px-2 py-0.5 rounded ${p.enabled ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{p.enabled ? '启用中' : '禁用中'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!p.enabled ? (
                        <button className="px-2 py-1 rounded bg-green-600 text-white" onClick={() => { enablePlugin(p.id); setPlugins(listPlugins()) }}>启用</button>
                      ) : (
                        <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => { disablePlugin(p.id); setPlugins(listPlugins()) }}>禁用</button>
                      )}
                      <button className="px-2 py-1 rounded bg-yellow-500 text-white" onClick={() => { uninstallPlugin(p.id); setPlugins(listPlugins()) }}>卸载</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-xs text-gray-600">安装插件（URL）</div>
              <div className="flex items-center gap-2">
                <input value={installUrl} onChange={(e)=>setInstallUrl(e.target.value)} placeholder="https://.../plugin.js" className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                <button className="px-2 py-1 rounded bg-black text-white text-xs" onClick={async () => { if (!installUrl) return; try { await installPluginFromUrl(installUrl); setInstallUrl(''); setPlugins(listPlugins()) } catch {} }}>安装</button>
              </div>
              <div className="text-xs text-gray-500">模块需导出默认 `Plugin` 对象或命名导出 `plugin`</div>
              <div className="text-xs text-gray-600">安装示例</div>
              <button className="px-2 py-1 rounded bg-black text-white text-xs" onClick={() => { installPlugin(alignSnapPlugin); setPlugins(listPlugins()) }}>安装 AlignSnap</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const areEqual = (a: Props, b: Props) => a.isOpen === b.isOpen && a.onClose === b.onClose && a.shortcutMap === b.shortcutMap && a.setShortcutKey === b.setShortcutKey

export const SettingsModal = memo(SettingsModalImpl, areEqual)
