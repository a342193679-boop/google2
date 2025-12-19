import type { Plugin, PluginContext } from './types'

const installed = new Map<string, Plugin>()
const enabled = new Set<string>()
const cleanups = new Map<string, () => void>()
let ctxRef: PluginContext | null = null
const STORAGE_KEY = 'ENABLED_PLUGINS'

function saveEnabled() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(enabled))) } catch {}
}
function loadEnabled(): string[] | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return null
    const arr = JSON.parse(v)
    if (Array.isArray(arr)) return arr as string[]
  } catch {}
  return null
}

export function registerPlugin(p: Plugin) {
  if (installed.has(p.id)) return
  installed.set(p.id, p)
}

export function installPlugin(p: Plugin) {
  registerPlugin(p)
  if (ctxRef) enablePlugin(p.id)
}

export function uninstallPlugin(id: string) {
  if (enabled.has(id)) disablePlugin(id)
  installed.delete(id)
}

export function initPlugins(ctx: PluginContext, initialEnabled?: string[]) {
  ctxRef = ctx
  const persisted = loadEnabled()
  const target = initialEnabled && initialEnabled.length ? initialEnabled : (persisted ?? Array.from(installed.keys()))
  for (const id of target) enablePlugin(id)
}

export function enablePlugin(id: string) {
  if (!ctxRef) return
  if (!installed.has(id)) return
  if (enabled.has(id)) return
  const p = installed.get(id)!
  const res = p.init(ctxRef)
  if (typeof res === 'function') cleanups.set(id, res)
  enabled.add(id)
  saveEnabled()
}

export function disablePlugin(id: string) {
  if (!enabled.has(id)) return
  const fn = cleanups.get(id)
  if (fn) try { fn() } catch {}
  cleanups.delete(id)
  enabled.delete(id)
  saveEnabled()
}

export function listPlugins() {
  return Array.from(installed.keys()).map(id => ({ id, enabled: enabled.has(id), meta: installed.get(id)!.meta }))
}

export async function installPluginFromUrl(url: string) {
  const mod: any = await import(/* @vite-ignore */ url)
  const p: Plugin = mod.alignSnapPlugin || mod.default || mod.plugin || mod
  if (!p || !p.id || typeof p.init !== 'function') throw new Error('invalid plugin module')
  installPlugin(p)
}

export function getEnabledPlugins() { return Array.from(enabled) }
