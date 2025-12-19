import { useEffect, useMemo } from 'react'

type ShortcutCallbacks = {
  onSave: () => void
  onSaveAs: () => void
  onLoad: () => void
  onUndo: () => void
  onRedo: () => void
}

type StoreRef = React.MutableRefObject<{
  registerShortcuts: (cbs: any) => void
  buildPlainShortcuts: (cbs: Partial<ShortcutCallbacks>) => Record<string, () => void>
}>

export function useRegisterShortcuts(storeRef: StoreRef, cbs: ShortcutCallbacks, deps: any[]) {
  const plain = useMemo(() => storeRef.current.buildPlainShortcuts(cbs), [storeRef, ...deps])
  useEffect(() => {
    storeRef.current.registerShortcuts({ ...cbs, onPlain: plain })
  }, [storeRef, plain, ...deps])
}

