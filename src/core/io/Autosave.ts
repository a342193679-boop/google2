import { safeGetItem, safeSetItem } from '@core/io/LocalStorage'

export interface IAutosave {
  get(): string | null
  set(text: string): void
}

class LocalAutosave implements IAutosave {
  private key: string
  constructor(key: string) { this.key = key }
  get(): string | null { return safeGetItem(this.key) }
  set(text: string): void { safeSetItem(this.key, text) }
}

export function createAutosave(key: string): IAutosave {
  return new LocalAutosave(key)
}

