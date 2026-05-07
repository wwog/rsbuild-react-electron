import { InvokeChannel } from 'common/constant'
import { ipcRenderer } from 'electron'

export const preloadStore = {
  get(key: string) {
    return ipcRenderer.invoke(InvokeChannel.GetStore, key)
  },
  set(key: string, value: any) {
    return ipcRenderer.invoke(InvokeChannel.SetStore, key, value)
  },
}
