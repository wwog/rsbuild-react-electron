import { Logger } from 'logger/main'
import { InvokeChannel, SendChannel, type Page } from '../../common/constant'
import type { BasicsWindow } from '../window/basicsWindow'
import { MainWindow } from '../window/mainWindow'
import { ipcMain } from 'electron'
import { Disposer } from '../../common/utils'

export class Windows {
  logger = Logger.scope('Windows')
  private windowInsMap = new Map<Page, BasicsWindow>()
  private RegisterWindows = [MainWindow]
  private disposer = new Disposer()

  constructor() {
    for (const WindowClass of this.RegisterWindows) {
      this.logger.info(`Register window: <${WindowClass.name}>`)
      const instance = new WindowClass(this)
      this.windowInsMap.set(instance.page, instance)
    }

    this.register()
  }

  private register() {
    ipcMain.on(SendChannel.CloseWindow, (event) => {
      const win = this.getWindowBySenderId(event.sender.id)
      win?.close()
    })
    ipcMain.on(SendChannel.MaximizeWindow, (event) => {
      const win = this.getWindowBySenderId(event.sender.id)
      win?.maximize()
    })
    ipcMain.on(SendChannel.RestoreWindow, (event) => {
      const win = this.getWindowBySenderId(event.sender.id)
      win?.restore()
    })
    ipcMain.on(SendChannel.MinimizeWindow, (event) => {
      const win = this.getWindowBySenderId(event.sender.id)
      win?.minimize()
    })
    ipcMain.handle(InvokeChannel.GetWindowMaximized, (event) => {
      const win = this.getWindowBySenderId(event.sender.id)
      return win?.isMaximized()
    })

    this.disposer.add(() => {
      ipcMain.removeHandler(SendChannel.CloseWindow)
      ipcMain.removeHandler(SendChannel.MaximizeWindow)
      ipcMain.removeHandler(SendChannel.RestoreWindow)
      ipcMain.removeHandler(SendChannel.MinimizeWindow)
    })
  }

  dispose() {
    this.logger.info('dispose')
    this.disposer.dispose()
  }

  broadcast(payload: any, exclude?: BasicsWindow) {
    this.getAllWindows().forEach((win) => {
      if (exclude && exclude === win) {
        return
      }
      win.send(SendChannel.Broadcast, payload)
    })
  }

  /**
   * Gets all window instances with `browserWindow`
   */
  getAllWindows() {
    return Array.from(this.windowInsMap.values())
  }

  getWindowBySenderId(senderId: number) {
    return this.getAllWindows().find((win) => win.senderId === senderId)
  }

  getWindowInstance(page: Page): BasicsWindow | undefined {
    return this.windowInsMap.get(page)
  }
}
