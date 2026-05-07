import { execSync } from 'node:child_process'
import { paths } from './paths'

const { appDir } = paths

// Install app dependencies

execSync('npm install', { cwd: appDir, stdio: 'inherit' })
