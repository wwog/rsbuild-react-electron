import { ipcRenderer } from 'electron'
import { InvokeChannel } from '../common/constant'

export const preloadStore = {
  get(key: string) {
    return ipcRenderer.invoke(InvokeChannel.GetStore, key)
  },
  set(key: string, value: any) {
    return ipcRenderer.invoke(InvokeChannel.SetStore, key, value)
  },
}
