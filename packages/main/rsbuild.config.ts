import { resolve } from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { paths } from '../../scripts/paths'
import { createExternal } from '../../scripts/buildUtils'

const distPath = resolve(paths.appDir, 'main')

export default defineConfig({
  source: {
    entry: {
      index: './index.ts',
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: distPath,
    },
    cleanDistPath: true,
    externals: ['electron', 'electron/main', ...createExternal()],
  },
})
