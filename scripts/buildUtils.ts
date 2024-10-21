export { paths } from './paths'

export function createExternal() {
  const externals = [
    'electron',
    'electron/renderer',
    'electron/main',
    'electron/common',
  ]

  const { builtinModules } = require('node:module')
  const appPkgJson = require('../app/package.json')

  const deps = Object.keys(appPkgJson.dependencies)

  externals.push(...builtinModules)
  externals.push(
    ...builtinModules.map((item: string) => {
      return `node:${item}`
    }),
  )
  externals.push(...deps)

  return externals
}
