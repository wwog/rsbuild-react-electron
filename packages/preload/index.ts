import { contextBridge } from 'electron'
import { preloadIpcRenderer } from './ipcRenderer'
import { preloadStore } from './store'

declare interface PreloadApi {
  ipcRenderer: typeof preloadIpcRenderer
  store: typeof preloadStore
}

declare global {
  interface Window {
    api: PreloadApi
  }
}

const api: PreloadApi = {
  ipcRenderer: preloadIpcRenderer,
  store: preloadStore,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
