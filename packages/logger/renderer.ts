import {
  type LoggerData,
  LoggerLevelEnum,
  RenderChannel,
  type LoggerPayload,
  type RendererLoggerOptions,
} from './types'
import { getLoggerData } from './utils'

function rendererTransformer(data: LoggerData) {
  const date = [
    `%c${data.date}`,
    'color: rgb(104,255,104);background: rgb(29,63,42);padding: 0 4px;border-radius: 2px;',
  ]

  const logArr = [...date, `<${data.scope}>:`, ...data.args]
  if (data.scope.length === 0) {
    logArr.splice(2, 1)
  }
  return {
    logArr,
  }
}

export class Logger {
  static loggerInstanceMap = new Map<string, Logger>()

  static globalOptions: Required<RendererLoggerOptions> = {
    scope: '',
    transformer(data) {
      return rendererTransformer(data)
    },
    //@ts-ignore
    ipcRendererSend: window.api.ipcRenderer.send,
  }
  static setOptions(options: RendererLoggerOptions) {
    Logger.globalOptions = {
      ...Logger.globalOptions,
      ...options,
    }
  }
  static scope(scope: string): Logger {
    if (typeof scope !== 'string') {
      throw new Error('Scope must be a string')
    }
    if (Logger.loggerInstanceMap.has(scope)) {
      return Logger.loggerInstanceMap.get(scope) as Logger
    }
    return new Logger({
      ...Logger.globalOptions,
      scope,
    })
  }
  private static baseIns = new Logger()
  static info(...args: any[]) {
    Logger.baseIns.info(...args)
  }
  static warn(...args: any[]) {
    Logger.baseIns.warn(...args)
  }
  static error(...args: any[]) {
    Logger.baseIns.error(...args)
  }

  protected options: Required<RendererLoggerOptions>

  private constructor(options: RendererLoggerOptions = {}) {
    this.options = {
      ...Logger.globalOptions,
      ...options,
    }
    Logger.loggerInstanceMap.set(
      this.options.scope ? this.options.scope : 'DEF_SCOPE',
      this,
    )
  }

  _log(payload: LoggerPayload) {
    const dataObj = getLoggerData(payload.level, this.options, payload.args)
    try {
      const { logArr } = this.options.transformer(dataObj)

      switch (payload.level) {
        case LoggerLevelEnum.INFO:
          console.log(...logArr)
          break
        case LoggerLevelEnum.WARN:
          console.warn(...logArr)
          break
        case LoggerLevelEnum.ERROR:
          console.error(...logArr)
          break
        default:
          throw new Error('[Logger Error] Unknown log level')
      }

      this.options.ipcRendererSend(RenderChannel, payload)
    } catch (error: any) {
      const msg = error?.message ?? '[Logger Error] Transformer error'
      this.options.ipcRendererSend(RenderChannel, payload)
      throw new Error(msg)
    }
  }

  info(...args: any[]) {
    this._log({
      level: LoggerLevelEnum.INFO,
      scope: this.options.scope,
      args,
    })
  }

  warn(...args: any[]) {
    this._log({
      level: LoggerLevelEnum.WARN,
      scope: this.options.scope,
      args,
    })
  }

  error(...args: any[]) {
    this._log({
      level: LoggerLevelEnum.ERROR,
      scope: this.options.scope,
      args,
    })
  }
}
