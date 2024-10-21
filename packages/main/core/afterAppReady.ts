import { ipcMain } from 'electron'
import type { Core } from '.'
import { Windows } from './windows'
import { SendChannel } from '../../common/constant'

export function afterAppReady(core: Core) {

  

  register(core)
}

function register(core: Core) {
  ipcMain.on(SendChannel.SwitchDevTools, (e) => {
    if (e.sender.isDevToolsOpened()) {
      e.sender.closeDevTools()
      return
    }
    e.sender.openDevTools()
  })

  
  core.disposer.add(() => {
    ipcMain.removeHandler(SendChannel.SwitchDevTools)
  })
}
