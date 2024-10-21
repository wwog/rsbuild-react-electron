import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { dependencies } from '../app/package.json'
import { paths } from './paths'

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(paths.appNodeModules)
) {
  const electronRebuildCmd =
    '../node_modules/.bin/electron-rebuild --force --types prod,dev,optional --module-dir .'
  const cmd =
    process.platform === 'win32'
      ? electronRebuildCmd.replace(/\//g, '\\')
      : electronRebuildCmd
  execSync(cmd, {
    cwd: paths.appDir,
    stdio: 'inherit',
  })
}
