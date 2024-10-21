import fs from 'node:fs'
import { join } from 'node:path'
import type { LoggerOptions } from './types'
import { formatDate } from './utils'

export const appendToFile = (
  options: Required<LoggerOptions>,
  writeStr: string,
) => {
  const { savePath, maxFileSize } = options

  let realWriteStr = writeStr
  if (!savePath) {
    realWriteStr = '[Logger Error] savePath is required'
  }
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true })
  }
  realWriteStr += '\n'

  const filename = `${formatDate('YYYY-MM-DD')}.log`
  const filePath = join(options.savePath, filename)

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '')
  } else {
    const stats = fs.statSync(filePath)
    if (stats.size > maxFileSize) {
      const oldFilePath = join(
        options.savePath,
        `${filename}_${formatDate('HH-mm-ss')}.log`,
      )
      fs.renameSync(filePath, oldFilePath)
      fs.writeFileSync(filePath, '')
    }
  }

  fs.appendFileSync(filePath, realWriteStr)
}
