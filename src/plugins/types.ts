import type { PluginCapabilities } from './capabilities'

export type Plugin = {
  id: string
  meta?: { name: string; version: string; description?: string }
  init: (ctx: PluginContext) => void | (() => void)
}

export type PluginContext = {
  getStore: () => any
  getCapabilities: () => PluginCapabilities
}
