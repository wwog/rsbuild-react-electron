import { resolve } from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { createExternal } from '../../scripts/buildUtils'
import { paths } from '../../scripts/paths'

const distPath = resolve(paths.appDir, 'main')

export default defineConfig({
  source: {
    entry: {
      index: './index.ts',
    },
  },
  output: {
    target: 'node',
    module: false,
    distPath: {
      root: distPath,
    },
    cleanDistPath: true,
    externals: ['electron', 'electron/main', ...createExternal()],
  },
})
