import { useState, useRef, useEffect, useCallback } from 'react';
 
import { CanvasProvider, useCanvasStore } from '@app/state/CanvasStore';

import type { NodeStyle } from '@core/types';
 
 
import { Toolbar } from '@ui/components/Toolbar';
import { SettingsModal } from '@ui/components/SettingsModal'
import { StatusBar } from '@ui/components/StatusBar';
import { Sidebar } from '@ui/components/Sidebar';
import { Canvas } from '@ui/components/Canvas';
import { useCanvasEvents } from '@app/hooks/event/useCanvasEvents';
import { useToast } from '@app/hooks/useToast'
import { useAutosaveLoad } from '@app/hooks/data/useAutosaveLoad'
import { useRegisterShortcuts } from '@app/hooks/event/useRegisterShortcuts'
import { useInitPlugins } from '@app/hooks/useInitPlugins'
import { useClipboard } from '@app/hooks/editor/useClipboard'
import { compressNode } from '@core/nodeHelpers'
import { useInitData } from '@app/hooks/data/useInitData'
import { useTextEditorFocus } from '@app/hooks/editor/useTextEditorFocus'

// --- 1. 类型定义升级 ---



// --- 默认配置 ---

export default function CanvasApp() {
  return (
    <CanvasProvider>
      <CanvasAppInner />
    </CanvasProvider>
  )
}

function CanvasAppInner() {
  // --- State ---
  
  
  
  
  // UI State
  
  

  // 交互状态
  
  
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); 

  
  const hasMousePressedWhileSpaceRef = useRef(false);
  

  
  
  
  
  const store = useCanvasStore();
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store })
  const { ui, nodes, canUndo, canRedo, stopEditing, setScale, toggleCollision, setSidebarOpen, setActiveTab, setPanning, setShortcutKey, setComboShortcutKey } = store;
  const { toast, showToast } = useToast()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useAutosaveLoad(storeRef)

  useInitPlugins(storeRef)

  const performUndo = useCallback(() => {
    const ok = storeRef.current.undoApply();
    if (ok) showToast('已撤销', 'success');
  }, [showToast])

  const performRedo = useCallback(() => {
    const ok = storeRef.current.redoApply();
    if (ok) showToast('已重做', 'success');
  }, [showToast])

  const getStateJson = useCallback(() => {
    const s = storeRef.current.getSnapshot()
    const compressed = { ...s, nodes: s.nodes.map(compressNode) }
    return JSON.stringify(compressed, null, 2)
  }, []);

  const save = useCallback(async () => { try { await storeRef.current.save(getStateJson()); showToast('保存成功', 'success') } catch { showToast('保存失败', 'error') } }, [showToast, getStateJson])

  const saveAs = useCallback(async () => { try { await storeRef.current.saveAs(getStateJson()); showToast('保存成功', 'success') } catch { showToast('保存失败', 'error') } }, [showToast, getStateJson])

  const load = useCallback(async () => { showToast('正在加载...', 'loading'); try { const ok = await storeRef.current.loadAndRestore(); if (ok) showToast('加载成功', 'success'); else showToast('加载取消或失败', 'error') } catch { showToast('加载取消或失败', 'error') } }, [showToast])

  // --- 侧边栏自动联动 ---
  useEffect(() => {
      if (ui.selectedNodeIds.size > 0) {
          setSidebarOpen(true);
          setActiveTab('node');
      } else {
          setSidebarOpen(false);
      }
  }, [ui.selectedNodeIds]);

  // --- 尺寸计算逻辑 (升级版：支持单节点字号) ---
  

  // 批量更新选中节点的样式或文本
  const updateSelectedNodes = useCallback((updates: Partial<NodeStyle>) => { 
    const s = storeRef.current;
    s.updateSelectedNodes(updates, s.ui.config) 
  }, []);

  useInitData(storeRef)

  useTextEditorFocus(storeRef, textareaRef)
  
  // 聚焦视图
  

  
  const { copy, cut, paste } = useClipboard(storeRef as any, containerRef)
  
  // 注册通用快捷键 (含复制粘贴)
  useRegisterShortcuts(storeRef, { 
    onSave: save, 
    onSaveAs: saveAs, 
    onLoad: load, 
    onUndo: performUndo, 
    onRedo: performRedo,
    onCopy: copy,
    onCut: cut,
    onPaste: paste
  } as any, [ui.shortcutMap, ui.comboShortcutMap, ui.editingNodeId])

  // --- 鼠标事件 ---
  const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleNodeMouseDown, handleNodeDoubleClick, handleCanvasDoubleClick } = useCanvasEvents(
    storeRef, 
    { containerRef, lastMousePosRef, dragOffset, setDragOffset, hasMousePressedWhileSpaceRef },
    { isPanning: ui.isPanning, isDragging: ui.isDragging, isSelecting: ui.isSelecting }
  )

  const handleTextChange = useCallback((id: string, newText: string) => { 
    const s = storeRef.current;
    s.updateNodeText(id, newText, s.ui.config) 
  }, []);

  const handleDelete = useCallback(() => { storeRef.current.deleteSelected() }, [])

  const storeSetConfig = useCallback((cfg: any) => storeRef.current.setConfig(cfg), [])
  const storeSetShowDebugGrid = useCallback((v: boolean) => storeRef.current.setShowDebugGrid(v), [])

  // 获取当前第一个选中的节点，用于回显属性
  const firstSelectedNode = ui.selectedNodeIds.size > 0 
    ? nodes.find(n => n.id === Array.from(ui.selectedNodeIds)[0]) 
    : null;

  // --- Render ---
  const baseGridStyle = {};


  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans text-slate-900 selection:bg-blue-300 selection:text-blue-900 relative">
      
      <Toolbar isPanning={ui.isPanning} onSelectMode={() => setPanning(false)} onPanMode={() => setPanning(true)} onDelete={handleDelete} onSave={save} onSaveAs={saveAs} onLoad={load} collisionEnabled={ui.collisionEnabled} onToggleCollision={() => toggleCollision()} onOpenSettings={() => setSettingsOpen(true)} snapOnRelease={ui.snapOnRelease} />

      {/* 核心画布 */}
      <Canvas
        containerRef={containerRef}
        baseGridStyle={baseGridStyle}
        showDebugGrid={ui.showDebugGrid}
        pan={ui.pan}
        scale={ui.scale}
        isPanning={ui.isPanning}
        isSpacePressed={ui.isSpacePressed}
        nodes={nodes}
        selectedNodeIds={ui.selectedNodeIds}
        editingNodeId={ui.editingNodeId}
        config={ui.config}
        selectionBox={ui.isSelecting ? ui.selectionBox : null}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {}}
        onDoubleClick={handleCanvasDoubleClick}
        onWheel={handleWheel}
        onNodeMouseDown={handleNodeMouseDown}
        onNodeDoubleClick={handleNodeDoubleClick}
        onTextChange={handleTextChange}
        onTextAreaBlur={() => stopEditing()}
        textareaRef={textareaRef}
      />
    <StatusBar selectedCount={ui.selectedNodeIds.size} scale={ui.scale} canUndo={canUndo} canRedo={canRedo} />
    <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} shortcutMap={ui.shortcutMap} comboShortcutMap={ui.comboShortcutMap} setShortcutKey={setShortcutKey} setComboShortcutKey={setComboShortcutKey} />

      <Sidebar isOpen={ui.sidebarOpen} toggleOpen={() => setSidebarOpen(!ui.sidebarOpen)} activeTab={ui.activeTab} setActiveTab={(t) => setActiveTab(t)} config={ui.config} setConfig={(cfg) => storeSetConfig(cfg)} showDebugGrid={ui.showDebugGrid} setShowDebugGrid={(v) => storeSetShowDebugGrid(v)} scale={ui.scale} setScale={(v) => setScale(v)} firstSelectedNode={firstSelectedNode ?? null} updateSelectedNodes={(u) => updateSelectedNodes(u)} shortcutMap={ui.shortcutMap} setShortcutKey={setShortcutKey} />
      {toast && (
        <div className={`absolute top-4 right-4 z-30 px-3 py-2 rounded-md shadow-md text-xs ${toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
 
