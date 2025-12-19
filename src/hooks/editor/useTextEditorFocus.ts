import { useEffect } from 'react'

type StoreLike = {
  ui: {
    editingNodeId: string | null
    initialCursorPos: number | null
  }
  consumeInitialCursor: () => void
}

export function useTextEditorFocus(storeRef: React.MutableRefObject<StoreLike>, textareaRef: React.RefObject<HTMLTextAreaElement>) {
  useEffect(() => {
    const store = storeRef.current
    if (store.ui.editingNodeId && textareaRef.current) {
      if (store.ui.initialCursorPos !== null) {
        const pos = Math.max(0, Math.min(store.ui.initialCursorPos, textareaRef.current.value.length));
        textareaRef.current.setSelectionRange(pos, pos);
        store.consumeInitialCursor();
      }
    }
  }, [storeRef.current?.ui.editingNodeId, storeRef.current?.ui.initialCursorPos])
}
