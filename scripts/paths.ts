import { resolve } from 'node:path'

const rootDir = resolve(__dirname, '../')
const appDir = resolve(rootDir, 'app')
const srcNodeModules = resolve(rootDir, './packages/node_modules')
const appNodeModules = resolve(appDir, 'node_modules')

export const paths = {
  rootDir,
  appDir,
  srcNodeModules,
  appNodeModules,
}