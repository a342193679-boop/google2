export class HistoryStack<T> {
  private stack: T[] = []
  private redo: T[] = []
  private capacity: number
  constructor(capacity = 100) { this.capacity = capacity }
  push(state: T) { this.stack.push(state); if (this.stack.length > this.capacity) this.stack.shift(); this.redo = [] }
  undo(): T | null { if (this.stack.length <= 1) return null; const current = this.stack.pop() as T; this.redo.push(current); return this.stack[this.stack.length - 1] }
  redoOne(): T | null { if (this.redo.length === 0) return null; const next = this.redo.pop() as T; this.stack.push(next); return next }
  canUndo(): boolean { return this.stack.length > 1 }
  canRedo(): boolean { return this.redo.length > 0 }
  isEmpty(): boolean { return this.stack.length === 0 }
}
