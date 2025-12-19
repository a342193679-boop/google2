 
import type { Plugin } from '@app/plugins/types'
import { registerSidebarPanel } from '@app/plugins/ui'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export const textAlignPlugin: Plugin = {
  id: 'example.textAlign',
  meta: { name: 'TextAlign', version: '0.1.0', description: '文本对齐控制' },
  init: (ctx) => {
    const caps = ctx.getCapabilities()
    const store = ctx.getStore()

    const unregister = registerSidebarPanel(() => (
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">文本对齐</div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-md bg-white text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.nodeOps.updateSelectedNodes({ textAlign: 'left' }, store.ui.config)} title="文本左对齐">
            <AlignLeft size={16} />
          </button>
          <button className="w-9 h-9 rounded-md bg-white text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.nodeOps.updateSelectedNodes({ textAlign: 'center' }, store.ui.config)} title="文本居中对齐">
            <AlignCenter size={16} />
          </button>
          <button className="w-9 h-9 rounded-md bg-white text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 shadow-sm flex items-center justify-center" onClick={() => caps.nodeOps.updateSelectedNodes({ textAlign: 'right' }, store.ui.config)} title="文本右对齐">
            <AlignRight size={16} />
          </button>
        </div>
      </div>
    ))
    return () => { unregister() }
  }
}
