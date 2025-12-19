import React from 'react'
import { Magnet } from 'lucide-react'
import type { Plugin } from '@app/plugins/types'
import { registerToolbarAction, registerShortcutConfig } from '@app/plugins/ui'

export const alignSnapPlugin: Plugin = {
  id: 'example.alignSnap',
  meta: { name: 'AlignSnap', version: '0.1.0', description: '左对齐与网格吸附示例' },
  init: (ctx) => {
    const caps = ctx.getCapabilities()

    const baseIcon = (children: React.ReactNode) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    )
    const NodeAlignLeftIcon = () => baseIcon(
      <>
        <line x1="3" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="2" />
        <line x1="5" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )
    const NodeAlignRightIcon = () => baseIcon(
      <>
        <line x1="17" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )
    const NodeAlignTopIcon = () => baseIcon(
      <>
        <line x1="3" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="2" />
        <line x1="7" y1="5" x2="7" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="13" y1="5" x2="13" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )
    const NodeAlignBottomIcon = () => baseIcon(
      <>
        <line x1="3" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="2" />
        <line x1="7" y1="11" x2="7" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="13" y1="12" x2="13" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )

    const unregister2 = registerToolbarAction((props) => (
      <button className={`w-9 h-9 rounded-md transition-colors border flex items-center justify-center ${props.snapOnRelease ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg白 text-gray-400 hover:text-gray-600 border-gray-200 shadow-sm'}`} onClick={() => caps.uiOps.toggleSnapOnRelease()} title="释放后吸附">
        <span className="relative inline-block">
          <Magnet size={16} />
          {!props.snapOnRelease && (
            <svg className="absolute inset-0" viewBox="0 0 20 20">
              <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            </svg>
          )}
        </span>
      </button>
    ), 'example.alignSnap')
    const unregister1 = registerToolbarAction(() => (
      <button className="w-9 h-9 rounded-md bg-white text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.layoutOps.alignSelectedLeft()} title="插件：节点左对齐">
        <NodeAlignLeftIcon />
      </button>
    ), 'example.alignSnap')
    const unregister3 = registerToolbarAction(() => (
      <button className="w-9 h-9 rounded-md bg白 text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.layoutOps.alignSelectedRight()} title="插件：节点右对齐">
        <NodeAlignRightIcon />
      </button>
    ), 'example.alignSnap')
    const unregister4 = registerToolbarAction(() => (
      <button className="w-9 h-9 rounded-md bg白 text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.layoutOps.alignSelectedTop()} title="插件：节点上对齐">
        <NodeAlignTopIcon />
      </button>
    ), 'example.alignSnap')
    const unregister5 = registerToolbarAction(() => (
      <button className="w-9 h-9 rounded-md bg白 text-gray-400 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.layoutOps.alignSelectedBottom()} title="插件：节点下对齐">
        <NodeAlignBottomIcon />
      </button>
    ), 'example.alignSnap')
    const unCfg1 = registerShortcutConfig({ id: 'alignLeft', label: '左对齐', group: 'alignSnap' })
    const unCfg2 = registerShortcutConfig({ id: 'alignRight', label: '右对齐', group: 'alignSnap' })
    const unCfg3 = registerShortcutConfig({ id: 'alignTop', label: '顶对齐', group: 'alignSnap' })
    const unCfg4 = registerShortcutConfig({ id: 'alignBottom', label: '底对齐', group: 'alignSnap' })
    const unCfg5 = registerShortcutConfig({ id: 'distributeH', label: '水平分布', group: 'alignSnap' })
    const unCfg6 = registerShortcutConfig({ id: 'distributeV', label: '垂直分布', group: 'alignSnap' })
    return () => { unregister2(); unregister1(); unregister3(); unregister4(); unregister5(); unCfg1(); unCfg2(); unCfg3(); unCfg4(); unCfg5(); unCfg6() }
  }
}
