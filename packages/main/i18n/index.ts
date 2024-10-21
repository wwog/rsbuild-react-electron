import { Logger } from 'logger/main'
import type { Core } from '../core'
import type { I18nMessages, SupportedLanguage } from '../../@types/global'
import {
  loadMessagesEN,
  loadMessagesKO,
  loadMessagesZhCN,
  loadMessagesZhTW,
} from './loader'
import { ipcMain } from 'electron'
import {
  BroadcastType,
  InvokeChannel,
  SyncChannel,
} from '../../common/constant'
import { Disposer } from '../../common/utils'

export class I18n {
  public core: Core
  public lang!: string
  public supportedLangs: SupportedLanguage[] = [
    { key: 'en', name: 'English' },
    { key: 'zh-CN', name: '中文' },
    { key: 'zh-TW', name: '繁体中文' },
    { key: 'ko', name: '한국어' },
  ]
  public messages: I18nMessages | null = null
  public disposer = new Disposer()
  public logger = Logger.scope('I18n')

  constructor(core: Core) {
    this.logger.info('new Instance')
    this.core = core
    this.setLang(this.core.store!.get('lang'))
  }

  public async init() {
    this.logger.info('init')
    this.messages = await this.loadMessages()
    this.register()
  }

  public setLang(lang: string) {
    if (this.supportedLangs.find((item) => item.key === lang)) {
      this.logger.info('set lang to', lang)
      this.lang = lang
      this.core.store!.set('lang', lang)
    } else {
      this.logger.error('unsupported lang', lang)
      throw `unsupported lang${lang}`
    }
  }

  public loadMessages() {
    switch (this.lang) {
      case 'zh-CN':
        return loadMessagesZhCN()
      case 'zh-TW':
        return loadMessagesZhTW()
      case 'en':
        return loadMessagesEN()
      case 'ko':
        return loadMessagesKO()
      default:
        return loadMessagesEN()
    }
  }

  getPayload = () => {
    return {
      lang: this.lang,
      messages: this.messages,
      supportedLangs: this.supportedLangs,
    }
  }

  getI18n = (e: Electron.IpcMainEvent) => {
    e.returnValue = this.getPayload()
    return
  }

  setI18n = async (_: Electron.IpcMainInvokeEvent, lang: string) => {
    this.setLang(lang)
    this.messages = await this.loadMessages()
    const payload = this.getPayload()
    const win = this.core.windows!.getWindowBySenderId(_.sender.id)
    if (win) {
      win.broadcast({
        type: BroadcastType.SetI18n,
        payload,
      })
    } else {
      this.logger.error(
        'setI18n failed, win is undefined.sender id is',
        _.sender.id,
      )
    }
    return payload
  }

  private register() {
    ipcMain.on(SyncChannel.GetI18n, this.getI18n)
    this.disposer.add(() => {
      ipcMain.removeListener(SyncChannel.GetI18n, this.getI18n)
    })

    ipcMain.handle(InvokeChannel.SetI18n, this.setI18n)
    this.disposer.add(() => {
      ipcMain.removeListener(InvokeChannel.SetI18n, this.setI18n)
    })
  }

  public dispose() {
    this.logger.info('dispose')
    this.disposer.dispose()
  }
}
