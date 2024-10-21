import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { createExternal, paths } from '../../scripts/buildUtils'
import { getPort } from '../common/env'

const htmlTemplate = resolve(__dirname, 'index.html')
const entryDir = resolve(__dirname, 'src', 'entry')
const reactEntry = readdirSync(entryDir).reduce(
  (acc, file) => {
    const filename = basename(file, extname(file))
    //入口文件必须是entry目录根下的tsx文件
    if (['.tsx', '.jsx'].includes(extname(file)) === false) {
      return acc
    }
    acc[filename] = resolve(entryDir, file)
    return acc
  },
  {} as Record<string, string>,
)
const distPath = resolve(paths.appDir, 'renderer')
console.log('renderer entry:', reactEntry)

export default defineConfig({
  html: {
    template: htmlTemplate,
  },
  source: {
    entry: reactEntry,
    define: {},
  },
  tools: {
    rspack: {
      externalsType: 'commonjs',
      externals: [...createExternal()],
      plugins: [],
    },
  },
  plugins: [pluginReact()],
  dev: {
    assetPrefix: 'auto',
  },
  output: {
    cleanDistPath: true,
    target: 'web',
    assetPrefix: 'auto',
    distPath: {
      root: distPath,
    },
    dataUriLimit: {
      image: 1024,
      media: 0,
    },
  },
  server: {
    port: getPort(),
  },
})
