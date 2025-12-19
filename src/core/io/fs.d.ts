interface FileSystemWritableFileStream { write(data: any): Promise<void>; close(): Promise<void>; }
interface FileSystemFileHandle { createWritable(): Promise<FileSystemWritableFileStream>; getFile(): Promise<File>; }
declare global { interface Window { showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>; showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>; } }
export {}
