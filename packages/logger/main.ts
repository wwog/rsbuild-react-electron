import path from 'node:path'
import {
  type LoggerData,
  LoggerLevelEnum,
  type LoggerOptions,
  type ProcessTag,
  type LoggerPayload,
  RenderChannel,
} from './types'
import { getLoggerData } from './utils'
import { ipcMain, app } from 'electron'
import { appendToFile } from './nodeUtils'
import { readdir, stat, unlink } from 'node:fs/promises'
import { StackTrace } from '../common/utils'

const bold = '\x1b[1m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const cyan = '\x1b[36m'
const reset = '\x1b[0m'
const blue = '\x1b[34m'
const red = '\x1b[31m'

const mainTransform = (data: LoggerData) => {
  const scope = data.scope.length > 0 ? `<${data.scope}>` : ''

  let levelStr = ''
  switch (data.level) {
    case LoggerLevelEnum.INFO:
      levelStr = `${blue}${data.level}${reset}`
      break
    case LoggerLevelEnum.WARN:
      levelStr = `${yellow}${data.level}${reset}`
      break
    case LoggerLevelEnum.ERROR:
      levelStr = `${bold}${red}${data.level}${reset}`
      break
    default:
      break
  }
  let processTag = ''
  if (data.processTag) {
    processTag = `${cyan}${data.processTag}${reset} `
  }

  const logArr = [
    `${green}${data.date}${reset}`,
    `${processTag}${levelStr}`,
    `${scope}:`,
    ...data.args,
  ]
  if (scope.length === 0) {
    logArr[1] = `${logArr[1]}:`
    logArr.splice(2, 1)
  }

  return {
    logArr,
    writeStr: `${data.date} ${data.processTag ? `${data.processTag} ` : ''}[${data.level}] ${scope}: ${data.formattedArgs.join(' ')}`,
  }
}

export class Logger {
  static loggerInstanceMap = new Map<string, Logger>()
  static globalOptions: Required<LoggerOptions> = {
    scope: '',
    processTag: 'Main',
    savePath: path.join(app.getPath('userData'), '/logs'),
    maxFileSize: 5 * 1024 * 1024 /* 5M */,
    transformer(data) {
      return mainTransform(data)
    },
  }
  static setOptions(options: LoggerOptions) {
    Logger.globalOptions = {
      ...Logger.globalOptions,
      ...options,
    }
  }
  static scope(scope: string, processTag: ProcessTag = 'Main'): Logger {
    if (typeof scope !== 'string') {
      throw new Error('Scope must be a string')
    }
    if (Logger.loggerInstanceMap.has(scope)) {
      return Logger.loggerInstanceMap.get(scope) as Logger
    }
    return new Logger({
      scope,
      processTag,
    })
  }

  /**
   * @description 设置渲染进程和Preload进程的logger,引入对应文件即可
   * @description_en Set up the logger for the renderer process and Preload process, just import the corresponding file
   */
  static setup() {
    Logger.info('Setup logger')
    ipcMain.on(RenderChannel, (_, payload: LoggerPayload) => {
      const { level, args, scope } = payload
      Logger.scope(scope, 'Renderer')._log(level, ...args)
    })
  }

  /**
   * @description 移除7天前的日志文件夹内的内容,文件夹内所有7天前的文件或者文件夹都会被删除
   * @description_en Remove the contents of the log folder 7 days ago, all files or folders 7 days ago in the folder will be deleted
   */
  static async remove7daysAgo(logDir: string) {
    Logger.info('Start Remove logDir 7 days ago')
    const files = await readdir(logDir)
    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    for (const file of files) {
      const filePath = path.join(logDir, file)
      const statState = await stat(filePath)
      if (now - statState.mtimeMs > sevenDays) {
        try {
          await unlink(filePath)
          Logger.info(`Remove log file ${filePath} success`)
        } catch (error) {
          Logger.error(`Remove log file ${filePath} error:`, error)
        }
      }
    }
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

  protected options: Required<LoggerOptions>

  private constructor(
    options: LoggerOptions = {
      processTag: 'Main',
    },
  ) {
    this.options = {
      ...Logger.globalOptions,
      ...options,
    }
    Logger.loggerInstanceMap.set(
      this.options.scope ? this.options.scope : 'DEF_SCOPE',
      this,
    )
  }

  private _log(level: LoggerLevelEnum, ...args: any[]) {
    const dataObj = getLoggerData(level, this.options, args)

    try {
      const { logArr, writeStr } = this.options.transformer(dataObj)

      let extraText: string | undefined = undefined
      switch (level) {
        case LoggerLevelEnum.INFO:
          console.log(...logArr)
          break
        case LoggerLevelEnum.WARN:
          console.warn(...logArr)
          break
        case LoggerLevelEnum.ERROR: {
          const stackTrace = StackTrace.create()
          extraText = stackTrace.toString(4)
          console.error(...logArr)
          console.error(extraText)
          break
        }
        default:
          throw new Error('[Logger Error] Unknown log level')
      }

      appendToFile(this.options, writeStr)
      if (extraText) {
        appendToFile(this.options, extraText)
      }
    } catch (error: any) {
      const stackTrace = StackTrace.create()
      const extraText = stackTrace.toString(4)
      const msg = `${error?.message ?? '[Logger Error] Transformer error'}\n${extraText}`
      appendToFile(this.options, msg)

      throw new Error(msg)
    }
  }

  info(...args: any[]) {
    this._log(LoggerLevelEnum.INFO, ...args)
  }

  warn(...args: any[]) {
    this._log(LoggerLevelEnum.WARN, ...args)
  }

  error(...args: any[]) {
    this._log(LoggerLevelEnum.ERROR, ...args)
  }
}
