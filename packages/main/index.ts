import { resolve } from 'node:path'
import { app } from 'electron'
import { Logger } from 'logger/main'
import { bootstrap } from './utils/bootstrap'

const cacheRoot = resolve(app.getPath('userData'), 'CacheRoot')

async function main() {
  const core = await bootstrap(cacheRoot)
  await core.run()
}

main().catch((error) => {
  Logger.error('Main Error:', error)
  process.exit(1)
})
