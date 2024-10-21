import {
  BrowserWindow,
  shell,
  type BrowserWindowConstructorOptions,
} from 'electron'
import { type Page, SendChannel } from '../../common/constant'
import type { Logger } from 'logger/main'
import { isStrictDev, resolveHtmlPath, resolvePreloadPath } from '../utils/path'
import pkgJson from '../../../app/package.json'
import { Store } from '../store'
import type { Windows } from '../core/windows'

export abstract class BasicsWindow {
  abstract page: Page
  abstract logger: Logger
  abstract saveBounds: boolean
  browserWindow: BrowserWindow | null = null
  windows: Windows
  constructor(windows: Windows) {
    this.windows = windows
  }

  protected options: BrowserWindowConstructorOptions = {
    show: false,
    width: 800,
    height: 625,
    resizable: true,
    autoHideMenuBar: true,
    title: pkgJson.name,
    webPreferences: {
      preload: resolvePreloadPath(),
      webSecurity: false,
    },
  }

  get senderId() {
    return this.browserWindow?.webContents?.id
  }

  createWindow() {
    this.logger.info(`${this.constructor.name} createWindow`)
    if (this.browserWindow && !this.browserWindow.isDestroyed()) {
      this.logger.info(`${this.constructor.name} createWindow > showWindow`)
      this.browserWindow.show()
      this.browserWindow.focus()
    } else {
      this.logger.info(`${this.constructor.name} createWindow > newWindow`)
      this.beforeCreate()
      this.browserWindow = new BrowserWindow(this.options)
      this.logger.info(`${this.constructor.name} senderId: ${this.senderId}`)
      const url = resolveHtmlPath(this.page)
      this.logger.info(`${this.constructor.name} createWindow: ${url}`)
      this.browserWindow.loadURL(url)

      addDidFailedLoadHandle(this)
      this.afterCreate()
    }

    return this.browserWindow
  }

  switchShow() {
    if (this.browserWindow) {
      if (this.browserWindow.isVisible()) {
        this.browserWindow.hide()
      } else {
        this.browserWindow.show()
      }
    }
  }

  maximize = () => {
    this.browserWindow?.maximize()
  }

  restore = () => {
    this.browserWindow?.restore()
  }

  minimize = () => {
    this.browserWindow?.minimize()
  }

  close = () => {
    this.browserWindow?.close()
  }

  isMaximized = () => {
    return this.browserWindow?.isMaximized()
  }

  //hooks
  beforeCreate() {
    this.logger.info(`${this.constructor.name} beforeCreate`)
  }

  afterCreate() {
    this.logger.info(`${this.constructor.name} afterCreate`)
    if (!this.browserWindow) {
      this.logger.error(
        'afterCreate failed, BasicsWindow.browserWindow is not initialized',
      )
      return
    }

    this.browserWindow!.on('maximize', () => {
      this.browserWindow?.webContents.send(SendChannel.MaximizeWindow)
    })

    this.browserWindow!.on('unmaximize', () => {
      this.browserWindow?.webContents.send(SendChannel.Unmaximize)
    })

    this.browserWindow.once('ready-to-show', () => {
      if (this.saveBounds) {
        const key = `${this.page}`
        const store = Store.getInstance()
        const bounds = store.get('bounds')[key]
        if (bounds) {
          this.browserWindow?.setBounds(bounds)
        }
      }
      this.browserWindow?.show()
    })

    this.browserWindow.on('close', (event) => {
      if (this.saveBounds) {
        const bounds = this.browserWindow?.getBounds()
        if (!bounds) {
          this.logger.error(
            'saveBounds failed, bounds is undefined.Maybe the window was destroyed early',
          )
          return
        }
        this.logger.info('saveBounds', bounds)
        const key = `${this.page}`
        const store = Store.getInstance()
        const oldBounds = store.get('bounds')
        oldBounds[key] = bounds
        store.set('bounds', oldBounds)
      }

      this.browserWindow?.removeAllListeners()
      this.browserWindow = null
    })

    this.browserWindow.webContents.setWindowOpenHandler((details) => {
      this.logger.info('setWindowOpenHandler', details)
      if (details.url) {
        shell.openExternal(details.url)
      }
      return {
        action: 'deny',
      }
    })
  }

  broadcast = (payload: any) => {
    this.windows.broadcast(payload, this)
  }

  send = (channel: string, ...args: any[]) => {
    if (!this.browserWindow) {
      this.logger.error('send failed', {
        channel,
        args,
        page: this.page,
      })
      return
    }
    this.browserWindow.webContents.send(channel, ...args)
  }
}

/**
 * In development mode, loading fails, periodic refresh. In publishing mode, logs are printed
 * @returns
 */
export function addDidFailedLoadHandle(window: BasicsWindow) {
  if (window.browserWindow === null) {
    window.logger.warn(
      'handleWindow failed, BasicsWindow.browserWindow is not initialized',
    )
    return
  }
  let loadFailed = false

  window.browserWindow.webContents.addListener('did-finish-load', () => {
    if (loadFailed === false) {
      window.logger.info(
        `Page [${window.constructor.name}] loaded successfully.`,
      )
    }
    loadFailed = false
  })

  window.browserWindow.webContents.addListener(
    'did-fail-load',
    (
      event,
      errorCode,
      errorDescription,
      validatedURL,
      isMainFrame,
      frameProcessId,
      frameRoutingId,
    ) => {
      loadFailed = true
      /**
       * @doc url https://source.chromium.org/chromium/chromium/src/+/main:net/base/net_error_list.h
       * @returns
       */
      const getErrorCodeType = (errorCode: number) => {
        const code = Math.abs(errorCode)
        if (code >= 0 && code <= 99) {
          return 'System related errors' as const
        }
        if (code >= 100 && code <= 199) {
          return 'Connection related errors' as const
        }
        if (code >= 200 && code <= 299) {
          return 'Certificate errors' as const
        }
        if (code >= 300 && code <= 399) {
          return 'HTTP errors' as const
        }
        if (code >= 400 && code <= 499) {
          return 'Cache errors' as const
        }
        if (code >= 500 && code <= 599) {
          return 'Unknown errors' as const
        }
        if (code >= 600 && code <= 699) {
          return 'FTP errors' as const
        }
        if (code >= 700 && code <= 799) {
          return 'Certificate manager errors' as const
        }
        if (code >= 800 && code <= 899) {
          return 'DNS resolver errors' as const
        }
        return 'Unknown errors' as const
      }
      const loadFailedInfo = {
        page: window.constructor.name,
        event,
        errorCode,
        errorType: getErrorCodeType(errorCode),
        errorDescription,
        validatedURL,
        isMainFrame,
        frameProcessId,
        frameRoutingId,
      }

      if (isStrictDev()) {
        window.logger.warn(
          'did-fail-load, in strict dev mode, Auto-refresh until successful',
        )
        setTimeout(() => {
          window.browserWindow?.reload()
        }, 1500)
      } else {
        window.logger.warn('did-fail-load', loadFailedInfo)
      }
    },
  )
}
