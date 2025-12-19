export interface IStorage {
  saveText(text: string): Promise<void>
  saveAsText(text: string): Promise<void>
  loadText(): Promise<string>
}

class FileSystemStorage implements IStorage {
  private handle: any | null = null
  async saveText(text: string): Promise<void> {
    if (!this.handle) { await this.saveAsText(text); return }
    const writable = await this.handle.createWritable()
    await writable.write(new Blob([text], { type: 'application/json' }))
    await writable.close()
  }
  async saveAsText(text: string): Promise<void> {
    const win: any = window as any
    const handle = await win.showSaveFilePicker({ suggestedName: 'canvas.json', types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] })
    this.handle = handle
    const writable = await handle.createWritable()
    await writable.write(new Blob([text], { type: 'application/json' }))
    await writable.close()
  }
  async loadText(): Promise<string> {
    const win: any = window as any
    const [handle] = await win.showOpenFilePicker({ multiple: false, types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] })
    const file = await handle.getFile()
    this.handle = handle
    return await file.text()
  }
}

class DownloadUploadStorage implements IStorage {
  async saveText(text: string): Promise<void> {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    a.download = 'canvas.json'
    a.click()
  }
  async saveAsText(text: string): Promise<void> { await this.saveText(text) }
  async loadText(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      input.onchange = async () => {
        const file = input.files && input.files[0]
        if (!file) { reject(new Error('no file')); return }
        const text = await file.text()
        resolve(text)
      }
      input.click()
    })
  }
}

export function createStorage(): IStorage {
  const win: any = window as any
  if (win && win.showSaveFilePicker) return new FileSystemStorage()
  return new DownloadUploadStorage()
}
