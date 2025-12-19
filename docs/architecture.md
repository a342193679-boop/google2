# 架构与设计说明

- 分层结构
  - Core 层：纯算法与数据结构，不依赖 UI（坐标换算、缩放、对齐/分布、拖拽步进、碰撞、测量、历史栈）
  - State 层：应用状态、Reducer、Actions、依赖注入与快照/自保存
  - UI 层：React 组件，使用 Store 暴露的 API，专注渲染与交互绑定

- 依赖注入
  - 在 `CanvasStore` 中构造 actions，并注入 `dispatch`、`queueSnapshot`、`measureNode`、`makeNode`、UI 切片等
  - 好处：
    - actions 可测试、可替换
    - `CanvasStore` 更轻量，职责仅为组合与导出 API

- 快照与历史
  - 快照构成：`{ nodes, config, scale, pan, showDebugGrid, selectedNodeIds, collisionEnabled }`
  - 推送策略：节流入栈与自动保存，常量 `SNAPSHOT_DEBOUNCE_MS` 控制延迟
  - 撤销/重做：`HistoryStack`，`undo/redo/undoApply/redoApply`

- 拖拽与碰撞
  - 拖拽入口：`computeDragStep(nodes, selectedIds, delta, selectedRects, config, collisionEnabled)`
  - 碰撞解析：
    - 精确模式：逐节点与障碍计算允许位移，方向上取最紧约束
    - 斜向移动：先解析 X，再以偏移后的 X 参与 Y 的水平重叠判断
  - 网格吸附：按锚点与 `baseUnit*snapStep` 吸附

- 快捷键系统
  - `ShortcutManager` 注册/注销生命周期由 `CanvasStore` 管理
  - 平面映射构造器 `createPlainShortcuts`：将 `shortcutMap` 转换为可执行的动作映射

- 节点测量
  - `Measure` 使用配置与样式计算节点的 `width/height`
  - 文本、样式更新需即时重算尺寸，保持布局与碰撞一致

- 扩展建议
  - 新增动作：在 `actions/*` 增加函数，通过 `CanvasStore` 注入并导出
  - 新增算法：在 `core/*` 增加模块，并在相应 actions 中调用
  - 新增持久化：实现 `IStorage` 的新后端，注入到 `CanvasProvider`

- 重要文件索引
  - `src/state/CanvasStore.tsx`：状态容器与 API 暴露
  - `src/state/actions/*.ts`：动作模块（canvas/ui/nodes/layout/shortcuts）
  - `src/core/canvas/*.ts`：画布算法（DragStep、CollisionResolver、PanZoom、Coords、Focus、GridSnapper、TextCursor）
  - `src/core/text/*.ts`：文本测量与节点工厂
  - `src/core/history/History.ts`：撤销重做栈
