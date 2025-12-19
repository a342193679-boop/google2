# Grid Canvas Tool 开发文档

- 快速开始
  - 安装依赖：`npm install`
  - 开发运行：`npm run dev`，访问 `http://localhost:5173/`
  - 构建产物：`npm run build`
  - 预览构建：`npm run preview`
  - 运行测试：`npm test`

- 项目结构（关键目录）
  - `src/core/`：画布算法与纯逻辑
    - `canvas/`：`PanZoom`、`Coords`、`Focus`、`DragStep`、`CollisionResolver`、`GridSnapper`、`TextCursor`
    - `geometry/`：命中与矩形选中 `Intersect.ts`
    - `history/`：撤销/重做栈 `History.ts`
    - `io/`：`Storage`、`Autosave`、`LocalStorage`
    - `text/`：节点文本造型与测量 `NodeFactory.ts`、`Measure.ts`
    - `config.ts`、`types.ts`
  - `src/state/`：应用状态与动作
    - `CanvasStore.tsx`：状态容器与依赖注入
    - `actions/`：`canvas.ts`、`ui.ts`、`nodes.ts`、`layout.ts`、`shortcuts.ts`
    - `uiReducer.ts`、`constants.ts`
  - `src/ui/components/`：UI 组件 `Canvas.tsx`、`NodeItem.tsx`、`Sidebar.tsx`、`Toolbar.tsx`、`StatusBar.tsx`
  - `beifen/`：归档的旧版或备份文件（不参与运行）

- 核心设计
  - 低耦合高内聚：算法在 `core/`，状态与动作在 `state/`，组件在 `ui/`
  - 依赖注入：`CanvasStore` 构造各类 actions，注入 `dispatch`、`queueSnapshot`、`measureNode`、`makeNode` 等依赖，避免跨模块硬绑定
  - 快照与历史：任意改变画布的动作需调用 `queueSnapshot` 以统一记录历史与自保存

- 重要常量
  - 自动保存键：`src/state/constants.ts:1` `AUTOSAVE_KEY`
  - 快捷键映射键：`src/state/constants.ts:2` `SHORTCUT_KEY`
  - 快照节流：`src/state/constants.ts` `SNAPSHOT_DEBOUNCE_MS`

- 拖拽与碰撞
  - 入口：`computeDragStep` `src/core/canvas/DragStep.ts:6–11`
  - 精确碰撞：`resolveDelta` 对每个被选节点逐一与障碍计算位移限制（而非选区包围矩形），并在 Y 方向判定时考虑已解析的 X 位移 `src/core/canvas/CollisionResolver.ts:4–71`
  - 网格吸附：`snapDelta` 根据锚点与 `baseUnit*snapStep` 吸附 `src/core/canvas/GridSnapper.ts`

- 选择与命中
  - 框选检测：`selectNodesInBox` `src/core/geometry/Intersect.ts`
  - 选择状态：`uiActions.setSelected/clearSelected/toggleSelected` `src/state/actions/ui.ts`

- 画布坐标与缩放
  - 坐标换算：`getCanvasPoint` `src/core/canvas/Coords.ts`
  - 缩放平移：`PanZoom` 与 `canvasActions.zoomAtPoint/setPan/setScale/setPanScale` `src/state/actions/canvas.ts:8–25`
  - 焦点计算：`computeFocus` `src/core/canvas/Focus.ts`

- 节点操作
  - 文本与尺寸：`nodesActions.updateNodeText/recalcAllNodeSizes` 使用 `Measure` 进行动态测量 `src/state/actions/nodes.ts:33–50`
  - 创建/添加/删除：`createNodeAt/addNode/deleteSelected` `src/state/actions/nodes.ts:52–77`
  - 网格对齐与拖拽吸附：`snapSelectedToGrid/endDragAndSnap` `src/state/actions/nodes.ts:79–96`
  - 对齐/分布：`layoutActions.*` `src/state/actions/layout.ts:11–99`

- 快捷键系统
  - 注册/更新：`ShortcutManager` 在 `CanvasStore` 中通过 `registerShortcuts` 管理
  - 平面映射构造器：`createPlainShortcuts` 将 `shortcutMap` 映射到具体动作 `src/state/actions/shortcuts.ts`
  - 用户快捷键设置：`uiActions.setShortcutKey` 并持久化到 `SHORTCUT_KEY` `src/state/actions/ui.ts:24`

- 插件机制（轻量骨架）
  - 位置：`src/plugins/`
    - 接口：`types.ts`（`Plugin`、`PluginContext`）
    - 注册器：`registry.ts`（`registerPlugin`、`initPlugins`、`listPlugins`）
    - 内置插件入口：`index.ts`（`setupBuiltinPlugins`，当前为空，可按需注册）
    - 能力白名单：`capabilities.ts`（`PluginCapabilities`、`createCapabilities`），插件通过白名单能力调用，不直接访问内部实现
    - 事件总线：`events.ts`（`subscribeEvent`、`publishEvent`），提供 `snapshotQueued`、`selectionChanged`、`configChanged` 等事件
  - 初始化：在 `src/App.tsx` 中调用 `setupBuiltinPlugins()` 与 `initPlugins({ getStore: () => store })`
    - 传入能力：`initPlugins({ getStore, getCapabilities })`，能力由 `createCapabilities(store)` 生成
  - 扩展方式：在 `setupBuiltinPlugins` 中注册插件或在应用外部调用 `registerPlugin` 再 `initPlugins`
  - 边界：当前仅提供初始化与上下文传递，不改变现有功能；建议插件通过 `getStore()` 获取 API 并遵循 `queueSnapshot` 约定
  - UI 注入点：`src/plugins/ui.ts` 提供 `registerToolbarAction/listToolbarActions` 与 `registerSidebarPanel/listSidebarPanels`，在 `Toolbar.tsx` 与 `Sidebar.tsx` 中渲染，默认为空不改变 UI

- 示例插件
  - 位置：`src/plugins/examples/AlignSnapPlugin.tsx`
  - 功能：
    - 工具栏按钮“左对齐”：调用 `layoutOps.alignSelectedLeft`
    - 工具栏按钮“网格吸附选中”：调用 `nodeOps.snapSelectedToGrid(store.ui.config)`
    - 侧边栏附加信息：显示当前选中数量
  - 注册：在 `src/plugins/index.ts` 中内置加载，初始化时自动注册
  - 说明：示例仅演示能力与 UI 注入使用方式，可删除或替换为你的真实插件

- 存储与自保存
  - 显式保存：`store.save/saveAs/load/loadAndRestore` `src/state/CanvasStore.tsx:236–247`
  - 自动保存：快照节流后写入 `Autosave`（键 `AUTOSAVE_KEY`），延迟由 `SNAPSHOT_DEBOUNCE_MS` 控制 `src/state/CanvasStore.tsx:158–168`

- 测试
  - 运行：`npm test`
  - 覆盖：文本测量、光标、拖拽步进、UI reducer 等；多选精确碰撞测试见 `src/core/canvas/__tests__/dragstep.test.ts`

- 开发约定
  - 任何更改画布状态的动作必须调用 `queueSnapshot`
  - 新增动作优先在 `actions/` 中实现，通过 `CanvasStore` 注入依赖
  - 类型与配置集中在 `src/core/types.ts` 与 `src/core/config.ts`
  - 常量统一在 `src/state/constants.ts`

- 备份文件约定
  - 归档目录：`beifen/`
  - 旧版参考文件：例如 `beifen/CanvasStore_original.tsx`，仅用于对照，不参与编译与运行

- 常见维护操作
  - 调整快照节流：修改 `SNAPSHOT_DEBOUNCE_MS`
  - 新增快捷键：扩展 `shortcutMap` 并在 `createPlainShortcuts` 中映射到对应动作
  - 新增布局算法：在 `layout.ts` 增加函数，并从 `CanvasStore` 暴露给 UI
