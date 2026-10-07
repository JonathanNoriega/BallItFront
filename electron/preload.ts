import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: (): Promise<{ filePath: string; fileName: string; fileSize: number } | null> =>
    ipcRenderer.invoke('dialog:openVideo'),
});
