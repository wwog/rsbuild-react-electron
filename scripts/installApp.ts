import { paths } from './paths'
import { execSync } from 'node:child_process'
const { appDir } = paths

// Install app dependencies

execSync('npm install', { cwd: appDir, stdio: 'inherit' })
