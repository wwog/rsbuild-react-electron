export enum LoggerLevelEnum {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LoggerPayload {
  level: LoggerLevelEnum
  scope: string
  args: any[]
}

export type ProcessTag = 'Main' | 'Renderer'

export interface LoggerData {
  date: string
  level: LoggerLevelEnum
  scope: string
  args: any[]
  processTag?: ProcessTag
  formattedArgs: any[]
}

export interface LoggerOptions {
  /**
   * @description 日志领域
   * @description_en Log scope
   * @default '
   */
  scope?: string

  /**
   * @description 保存路径
   * @description_en Storage path
   * @default app.getPath('userData') + '/logs'
   */
  savePath?: string

  /**
   * @description 最大文件大小
   * @description_en Maximum file size
   * @default 5M
   */
  maxFileSize?: number

  /**
   * @description 转换器
   */
  transformer?: (data: LoggerData) => {
    logArr: any[]
    writeStr: string
  }

  processTag?: ProcessTag
}

export type RendererLoggerOptions = Pick<LoggerOptions, 'scope'> & {
  transformer?: (data: LoggerData) => {
    logArr: any[]
  }
  ipcRendererSend?: (channel: string, ...args: any[]) => void
}
export const RenderChannel = 'RendererLoggerChannel_'
