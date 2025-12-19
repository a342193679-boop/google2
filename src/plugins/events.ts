export type EventName = 'snapshotQueued' | 'selectionChanged' | 'configChanged' | 'notify'

type Handler = (payload: any) => void

const subs = new Map<EventName, Set<Handler>>()

export function subscribeEvent(name: EventName, handler: Handler) {
  if (!subs.has(name)) subs.set(name, new Set())
  subs.get(name)!.add(handler)
  return () => unsubscribeEvent(name, handler)
}

export function unsubscribeEvent(name: EventName, handler: Handler) {
  const set = subs.get(name)
  if (set) set.delete(handler)
}

export function publishEvent(name: EventName, payload: any) {
  const set = subs.get(name)
  if (!set) return
  for (const h of Array.from(set)) {
    try { h(payload) } catch {}
  }
}
