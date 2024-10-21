import { app } from 'electron'
import { getPort, isDev } from '../../common/env'
import { join, resolve } from 'node:path'

/**
 * @description only in `development` and `not packaged`
 */
export function isStrictDev() {
  return isDev() && !app.isPackaged
}

/**
 * @param filename No suffix
 * @returns url
 */
export function resolveHtmlPath(filename: string) {
  if (isStrictDev()) {
    const port = getPort()
    const url = new URL(`http://localhost:${port}`)
    url.pathname = filename
    return url.href
  }
  const _filename = filename.endsWith('.html') ? filename : `${filename}.html`
  return `file://${resolve(__dirname, '../renderer/', _filename)}`
}


export function resolvePreloadPath(): string {
  return app.isPackaged
    ? join(__dirname, '../preload/preload.js')
    : join(process.cwd(), '../../app/preload/preload.js')
}