import { ipcRenderer } from 'electron'
import { type BroadcastType, SendChannel } from '../common/constant'
import type { BroadcastData } from '../@types/global'

export const preloadIpcRenderer = {
  send(channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args)
  },
  sendSync(channel: string, ...args: any[]) {
    return ipcRenderer.sendSync(channel, ...args)
  },
  invoke<T>(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args) as Promise<T>
  },
  on(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.on(channel, listener)
  },
  once(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.once(channel, listener)
  },
  onBroadcast(listener: (data: BroadcastData) => void) {
    const handler = (_: any, data: { type: BroadcastType; payload: any }) => {
      listener(data)
    }
    ipcRenderer.on(SendChannel.Broadcast, handler)
    return {
      dispose: () => {
        ipcRenderer.removeListener(SendChannel.Broadcast, handler)
      },
    }
  },
  removeListener(channel: string, listener: (...args: any[]) => void) {
    ipcRenderer.removeListener(channel, listener)
  },
  removeAllListeners(channel: string) {
    ipcRenderer.removeAllListeners(channel)
  },
}
