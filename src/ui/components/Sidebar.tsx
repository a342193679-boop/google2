 
import { memo } from 'react'
import { DEFAULT_CONFIG, DEFAULT_NODE_STYLE } from '@core/config'
import { listSidebarPanels } from '@app/plugins/ui'
import type { GridConfig } from '@core/types'
import type { NodeData } from '@core/types'
import type { NodeStyle } from '@core/types'

type Props = {
  isOpen: boolean
  toggleOpen: () => void
  activeTab: 'general' | 'node'
  setActiveTab: (tab: 'general' | 'node') => void
  config: GridConfig
  setConfig: (cfg: GridConfig) => void
  showDebugGrid: boolean
  setShowDebugGrid: (v: boolean) => void
  scale: number
  setScale: (v: number) => void
  firstSelectedNode: NodeData | null
  updateSelectedNodes: (updates: Partial<NodeStyle>) => void
  shortcutMap: Record<string, string>
  setShortcutKey: (id: string, key: string) => void
}

function SidebarImpl({ isOpen, toggleOpen, activeTab, setActiveTab, config, setConfig, showDebugGrid, setShowDebugGrid, scale, setScale, firstSelectedNode, updateSelectedNodes, shortcutMap: _shortcutMap, setShortcutKey: _setShortcutKey }: Props) {
  const ResetIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H6V3L1 8L6 13V10H8C11.31 10 14 12.69 14 16C14 19.31 11.31 22 8 22C4.69 22 2 19.31 2 16H0C0 20.42 3.58 24 8 24C12.42 24 16 20.42 16 16C16 11.58 12.42 8 8 8Z" fill="currentColor"/>
    </svg>
  )
  return (
    <>
      <button onClick={toggleOpen} className="absolute top-20 right-0 z-30 bg-white border border-gray-200 shadow-md px-2 py-1 rounded-l-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all" style={{ right: isOpen ? '288px' : '0' }}>
        {isOpen ? '>' : '<'}
      </button>
      <div className={`bg-white border-l border-gray-200 flex flex-col shadow-xl z-20 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-0 border-l-0'}`}>
        <div className="w-72 h-full flex flex-col overflow-y-auto">
          <div className="flex border-b border-gray-200 shrink-0">
            <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'general' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center justify-center">通用属性</div>
              {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
            <button onClick={() => setActiveTab('node')} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'node' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center justify-center">节点属性</div>
              {activeTab === 'node' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          </div>
          <div className="p-4 space-y-6">
            {activeTab === 'general' && (
              <>
                <div className="space-y-4">
                  <div className="text-xs tracking-wide font-semibold text-gray-500">全局网格</div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">基础网格</label>
                      <div className="flex items-center gap-1">
                        <input type="number" min="2" max="20" value={config.baseUnit} onChange={(e) => setConfig({ ...config, baseUnit: parseInt(e.target.value) || 5 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, baseUnit: DEFAULT_CONFIG.baseUnit })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="3" max="20" step="1" value={config.baseUnit} onChange={(e) => setConfig({ ...config, baseUnit: parseInt(e.target.value) })} className="w-full accent-black"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">最大宽度</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="5" min="10" max="200" value={config.maxNodeWidthUnits} onChange={(e) => setConfig({ ...config, maxNodeWidthUnits: parseInt(e.target.value) || 80 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, maxNodeWidthUnits: DEFAULT_CONFIG.maxNodeWidthUnits })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="20" max="150" step="5" value={config.maxNodeWidthUnits} onChange={(e) => setConfig({ ...config, maxNodeWidthUnits: parseInt(e.target.value) })} className="w-full accent-slate-800"/>
                  </div>
                </div>
                <div className="h-px bg-gray-100 my-1"></div>
                <div className="space-y-4">
                  <div className="text-xs tracking-wide font-semibold text-gray-500">边框与布局</div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">边框粗细</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.1" min="0" max="5" value={config.borderWidth} onChange={(e) => setConfig({ ...config, borderWidth: parseFloat(e.target.value) || 0 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, borderWidth: DEFAULT_CONFIG.borderWidth })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0" max="3" step="0.1" value={config.borderWidth} onChange={(e) => setConfig({ ...config, borderWidth: parseFloat(e.target.value) })} className="w-full accent-slate-800"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">选中线宽</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.5" min="0.5" max="5" value={config.selectionLineWidth} onChange={(e) => setConfig({ ...config, selectionLineWidth: parseFloat(e.target.value) || 1 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, selectionLineWidth: DEFAULT_CONFIG.selectionLineWidth })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0.5" max="5" step="0.5" value={config.selectionLineWidth} onChange={(e) => setConfig({ ...config, selectionLineWidth: parseFloat(e.target.value) })} className="w-full accent-blue-600"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">圆角半径</label>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" max="50" value={config.borderRadius} onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) || 0 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, borderRadius: DEFAULT_CONFIG.borderRadius })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0" max="20" step="1" value={config.borderRadius} onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) })} className="w-full accent-slate-800"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">水平边距</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.5" value={config.paddingX} onChange={(e) => setConfig({ ...config, paddingX: parseFloat(e.target.value) || 0 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, paddingX: DEFAULT_CONFIG.paddingX })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0" max="20" step="0.5" value={config.paddingX} onChange={(e) => setConfig({ ...config, paddingX: parseFloat(e.target.value) })} className="w-full accent-slate-800"/>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">垂直边距</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.5" value={config.paddingY} onChange={(e) => setConfig({ ...config, paddingY: parseFloat(e.target.value) || 0 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, paddingY: DEFAULT_CONFIG.paddingY })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0" max="20" step="0.5" value={config.paddingY} onChange={(e) => setConfig({ ...config, paddingY: parseFloat(e.target.value) })} className="w-full accent-slate-800"/>
                  </div>
                </div>
                <div className="h-px bg-gray-100 my-1"></div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-700 font-medium">行高</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{config.lineHeight}px</span>
                      <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, lineHeight: DEFAULT_CONFIG.lineHeight })}><ResetIcon/></button>
                    </div>
                  </div>
                  <input type="range" min="10" max="30" step="1" value={config.lineHeight} onChange={(e) => setConfig({ ...config, lineHeight: parseInt(e.target.value) })} className="w-full accent-blue-600"/>
                </div>
                <div className="space-y-4">
                  <div className="text-xs tracking-wide font-semibold text-gray-500">吸附步长</div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">吸附步长</label>
                      <div className="flex items-center gap-1">
                        <input type="number" step="0.5" min="0" max="4" value={config.snapStep} onChange={(e) => setConfig({ ...config, snapStep: parseFloat(e.target.value) ?? 0 })} className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-xs font-mono"/>
                        <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, snapStep: DEFAULT_CONFIG.snapStep })}><ResetIcon/></button>
                      </div>
                    </div>
                    <input type="range" min="0" max="4" step="0.5" value={config.snapStep} onChange={(e) => setConfig({ ...config, snapStep: parseFloat(e.target.value) })} className="w-full accent-black"/>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="text-xs tracking-wide font-semibold text-gray-500 mb-2">视觉辅助</div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">排版单元格</label>
                    <button onClick={() => setShowDebugGrid(!showDebugGrid)} className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${showDebugGrid ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${showDebugGrid ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">节点边框</label>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setConfig({ ...config, showBorder: !config.showBorder })} className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${config.showBorder ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${config.showBorder ? 'translate-x-5' : ''}`} />
                      </button>
                      <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setConfig({ ...config, showBorder: DEFAULT_CONFIG.showBorder })}><ResetIcon/></button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-auto">
                  <label className="text-xs text-gray-700 font-medium mb-2 block">视图缩放</label>
                  <input type="range" min="1" max="6" step="0.5" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-slate-900"/>
                  <div className="flex justify-end mt-1"><button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => setScale(3)}><ResetIcon/></button></div>
                </div>
                
              </>
            )}
            {activeTab === 'node' && firstSelectedNode && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="text-xs tracking-wide font-semibold text-gray-500">颜色风格</div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700 font-medium">字体颜色</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono uppercase">{firstSelectedNode.textColor}</span>
                      <input type="color" value={firstSelectedNode.textColor} onChange={(e) => updateSelectedNodes({ textColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 cursor-pointer"/>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700 font-medium">背景颜色</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono uppercase">{firstSelectedNode.backgroundColor}</span>
                      <input type="color" value={firstSelectedNode.backgroundColor} onChange={(e) => updateSelectedNodes({ backgroundColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 cursor-pointer"/>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-100 my-1"></div>
                <div className="space-y-4">
                  <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">排版样式</div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-700 font-medium">字号</label>
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{firstSelectedNode.fontSize}px</span>
                    </div>
                    <input type="number" value={firstSelectedNode.fontSize} onChange={(e) => updateSelectedNodes({ fontSize: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700 font-medium">粗体</label>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateSelectedNodes({ isBold: !firstSelectedNode.isBold })} className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${firstSelectedNode.isBold ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${firstSelectedNode.isBold ? 'translate-x-5' : ''}`} />
                      </button>
                      <button className="w-6 h-6 grid place-items-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50" title="恢复默认" onClick={() => updateSelectedNodes({ isBold: DEFAULT_NODE_STYLE.isBold })}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H6V3L1 8L6 13V10H8C11.31 10 14 12.69 14 16C14 19.31 11.31 22 8 22C4.69 22 2 19.31 2 16H0C0 20.42 3.58 24 8 24C12.42 24 16 20.42 16 16C16 11.58 12.42 8 8 8Z" fill="currentColor"/></svg></button>
                    </div>
                  </div>
                </div>
                {listSidebarPanels().map((render, i) => (
                  <div key={i}>{render({})}</div>
                ))}
              </div>
            )}
            {activeTab === 'node' && !firstSelectedNode && (
              <div className="text-center py-10 text-gray-400 text-xs">未选中任何节点</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const areEqual = (a: Props, b: Props) =>
  a.isOpen === b.isOpen &&
  a.activeTab === b.activeTab &&
  a.config === b.config &&
  a.showDebugGrid === b.showDebugGrid &&
  a.scale === b.scale &&
  a.firstSelectedNode === b.firstSelectedNode &&
  a.toggleOpen === b.toggleOpen &&
  a.setActiveTab === b.setActiveTab &&
  a.setConfig === b.setConfig &&
  a.setShowDebugGrid === b.setShowDebugGrid &&
  a.setScale === b.setScale &&
  a.updateSelectedNodes === b.updateSelectedNodes &&
  a.shortcutMap === b.shortcutMap &&
  a.setShortcutKey === b.setShortcutKey

export const Sidebar = memo(SidebarImpl, areEqual)
