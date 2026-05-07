import fs from 'node:fs'
import { paths } from './paths'

const { appNodeModules, srcNodeModules } = paths

console.log('Linking node_modules from app to src', {
  appNodeModules,
  srcNodeModules,
})
if (!fs.existsSync(srcNodeModules) && fs.existsSync(appNodeModules)) {
  try {
    const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
    fs.symlinkSync(appNodeModules, srcNodeModules, symlinkType)
    console.log('Symlink Result: Ok')
  } catch (error) {
    console.error('Symlink Error: ', error)
  }
}
