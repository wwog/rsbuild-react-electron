import ElectronStore from 'electron-store'

import { Logger } from 'logger/main'
import { ipcMain } from 'electron'
import { Disposer } from '../../common/utils'
import { InvokeChannel } from '../../common/constant'

interface StoreSchema {
  theme: 'dark' | 'light'
  firstRun: boolean
  lang: string
  bounds: {
    [key: string]: {
      x: number
      y: number
      width: number
      height: number
    }
  }
}

export class Store {
  static instance: Store
  static getInstance() {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    return Store.instance
  }
  logger = Logger.scope('MainStore')
  store: ElectronStore<StoreSchema>
  disposer = new Disposer(this.logger)

  private constructor() {
    this.store = new ElectronStore<any>({
      schema: {
        theme: {
          type: 'string',
          default: 'dark',
          enum: ['dark', 'light'],
        },
        lang: {
          type: 'string',
          default: 'en',
        },
        firstRun: {
          type: 'boolean',
          default: true,
        },
        bounds: {
          type: 'object',
          default: {},
        },
      },
    })
    this.register()
  }

  get<T extends keyof StoreSchema>(key: T): StoreSchema[T] {
    return this.store.get(key)
  }

  set<T extends keyof StoreSchema>(key: T, value: StoreSchema[T]) {
    this.logger.info(`set ${key} to`, value)
    this.store.set(key, value)
  }

  private register() {
    ipcMain.handle(InvokeChannel.GetStore, (_: any, key: keyof StoreSchema) => {
      return this.get(key)
    })

    ipcMain.handle(
      InvokeChannel.SetStore,
      (
        _: any,
        key: keyof StoreSchema,
        value: StoreSchema[keyof StoreSchema],
      ) => {
        this.set(key, value)
      },
    )

    this.disposer.add(() => ipcMain.removeHandler(InvokeChannel.GetStore))
    this.disposer.add(() => ipcMain.removeHandler(InvokeChannel.SetStore))
    this.disposer.add(() => {
      //@ts-expect-error clear is private
      this.store = null
    })
  }

  dispose() {
    this.disposer.dispose()
  }
}
