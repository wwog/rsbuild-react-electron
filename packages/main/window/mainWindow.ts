import { Logger } from 'logger/main'
import { Page } from '../../common/constant'
import type { Windows } from '../core/windows'
import { BasicsWindow } from './basicsWindow'

export class MainWindow extends BasicsWindow {
  saveBounds = true
  page: Page = Page.Main
  logger: Logger = Logger.scope('MainWindow')

  constructor(windows: Windows) {
    super(windows)

    this.options = {
      ...this.options,
      title: '',
      frame: true,
      resizable: true,
      webPreferences: {
        ...this.options.webPreferences,
      },
    }
    this.createWindow()
  }

  afterCreate(): void {
    super.afterCreate()
    // this.browserWindow!.webContents.openDevTools({
    //   mode: 'detach',
    // })
  }
}
