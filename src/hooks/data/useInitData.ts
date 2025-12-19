import { useEffect } from 'react'
import type { NodeData, GridConfig } from '@core/types'

type StoreLike = {
  nodes: NodeData[]
  ui: {
    config: GridConfig
  }
  setNodes: (updater: (prev: NodeData[]) => NodeData[]) => void
  createDefaultNodeAt: (text: string, x: number, y: number) => NodeData
  recalcAllNodeSizes: (config: GridConfig) => void
}

export function useInitData(storeRef: React.MutableRefObject<StoreLike>) {
  // 初始化数据
  useEffect(() => {
    const store = storeRef.current
    if (store.nodes.length === 0) {
      const initialTexts = [
          '如果你的渲染\n系统有我subp\n误差AD我.;/\' w',
          'w 我的b.. 的完全',
          'New1222222'
      ];
      store.setNodes(() => initialTexts.map((text, i) => {
        return store.createDefaultNodeAt(text, 50 + i * 100, 50 + i * 60);
      }))
    }
  }, [storeRef])

  // 配置(Config)改变时，所有节点重算尺寸
  useEffect(() => { 
    const store = storeRef.current
    store.recalcAllNodeSizes(store.ui.config) 
  }, [storeRef.current?.ui.config]) // We depend on config value changes
}
