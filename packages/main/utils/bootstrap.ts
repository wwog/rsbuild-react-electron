import { app } from 'electron'
import { Logger } from 'logger/main'
import { resolve, dirname } from 'node:path'
import { UnhandledError, UnhandledRejection } from '../../common/errors'
import { Core } from '../core'

export async function bootstrap(cacheRoot: string) {
  const loggerRoot = resolve(cacheRoot, 'logs')
  await Logger.remove7daysAgo(loggerRoot)
  //仅在设置保存路径后,Logger才会写入文件
  //en: Logger will write to the file only after setting the save path
  Logger.setOptions({
    savePath: loggerRoot,
  })
  Logger.setup()
  Logger.info('Logger File Path:', loggerRoot)

  setupProcessListeners()
  setupCurrentWorkingDirectory()

  const core = new Core({
    cacheRoot: cacheRoot,
  })
  return core
}

/**
 * @description 设置当前工作目录,避免打包后的工作目录不正确。
 * 例如以下场景,开启链接打开应用后，如果应用使用了位于应用目录下的动态链接库(*.dll)。不设置会出错，因为windows下dll文件的查找路径是当前工作目录或者system32目录。且开发和打包的表现不一致，这里统一设置为应用目录。
 * @description_en Set the current working directory to avoid incorrect working directory after packaging.
 * For example, in the following scenario, after opening the link to open the application, if the application uses a dynamic link library (*.dll) located in the application directory. If not set, an error will occur, because the search path of the dll file on windows is the current working directory or the system32 directory. And the development and packaging behaviors are inconsistent, so here it is set to the application directory.
 * 
 */
function setupCurrentWorkingDirectory() {
  if (app.isPackaged) {
    const cwd = process.cwd()
    const execPath = process.execPath
    const execDir = dirname(execPath)
    if (execDir !== cwd) {
      process.chdir(execDir)
    }
  }
}

export function handleError(e: Error) {
  Logger.error(e.message)
}

function setupProcessListeners() {
  process.on('uncaughtException', (e) =>
    handleError(new UnhandledError(e.message)),
  )
  process.on('unhandledRejection', (e) =>
    handleError(new UnhandledRejection((e as any)?.message)),
  )
}
