import { app } from 'electron'
import { Logger } from 'logger/main'
import { Store } from '../store'
import { Disposer } from '../../common/utils'
import { afterAppReady } from './afterAppReady'
import { Windows } from './windows'
import { I18n } from '../i18n'

const args = process.argv.slice(2)

export interface CoreOptions {
  cacheRoot?: string
}

export class Core {
  public logger = Logger.scope('Core')
  public store: Store | null = null
  public windows: Windows | null = null
  public i18n: I18n | null = null
  public disposer = new Disposer(this.logger)

  constructor(options: CoreOptions = {}) {
    this.logger.info('=============RuntimeInfo=============')
    this.logger.info('App Path', app.getAppPath())
    this.logger.info('Cache Root', options.cacheRoot || app.getPath('userData'))
    this.logger.info('Node Version:', process.versions.node)
    this.logger.info('Electron Version:', process.versions.electron)
    this.logger.info('ABI Version:', process.versions.modules)
    this.logger.info('Platform', process.platform)
    this.logger.info('CWD', process.cwd())
    this.logger.info('ExecPath', process.execPath)
    if (args.length > 0) this.logger.info('argv', args)
    this.logger.info('=============RuntimeInfo=============')
  }

  async run() {
    try {
      await this.beforeAppReady()
      await app.whenReady()
      await this.afterAppReady()
    } catch (error) {
      this.logger.error('Error in Core.run', error)
    }
  }

  private async beforeAppReady() {
    this.logger.info('Core.beforeAppReady')
    this.store = Store.getInstance()
    this.i18n = new I18n(this)

    this.disposer.add(() => {
      this.i18n!.dispose()
      this.i18n = null
    })
    this.disposer.add(() => {
      this.store!.dispose()
      this.store = null
    })

    await this.i18n.init()
  }

  private async afterAppReady() {
    this.logger.info('Core.afterAppReady')
    this.windows = new Windows()
    this.disposer.add(() => {
      this.windows!.dispose()
      this.windows = null
    })
    afterAppReady(this)
  }

  dispose() {
    this.logger.info('Core.dispose')
    this.disposer.dispose()
  }
}
