const path = require('node:path')
const fs = require('node:fs')

const isForce = process.argv.includes('--force')
/* 
  A simple cache build
*/
const cacheValidTime = 24 * 60 * 60 * 1000
const preloadDir = path.resolve(__dirname)
const cache = path.resolve(__dirname, './.cache')
const appPackage = path.resolve(preloadDir, "../../app/package.json");
const distDir = path.resolve(preloadDir, '../../app/preload')
const { size: preloadSize, lastUpdatedTime } = checkDir(preloadDir)
const preloadPath = path.resolve(distDir, 'preload.js')
const mode =
  process.env.NODE_ENV === 'development' ? 'development' : 'production'

function checkDir(dir) {
  let size = 0
  let lastUpdatedTime = 0
  const files = fs.readdirSync(dir)
  for (const file of files) {
    // Ignore .cache
    if (file === '.cache') {
      continue
    }
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isFile()) {
      if (stats.mtimeMs > lastUpdatedTime) {
        lastUpdatedTime = stats.mtimeMs
      }
      size += stats.size
    } else if (stats.isDirectory()) {
      const { size: subSize, lastUpdatedTime: subLastUpdatedTime } =
        checkDir(filePath)
      size += subSize
      if (subLastUpdatedTime > lastUpdatedTime) {
        lastUpdatedTime = subLastUpdatedTime
      }
    }
  }

  //将app的package.json也加入到计算中
  const appPackageStats = fs.statSync(appPackage)
  size += appPackageStats.size
  if (appPackageStats.mtimeMs > lastUpdatedTime) {
    lastUpdatedTime = appPackageStats.mtimeMs
  }

  return {
    size,
    lastUpdatedTime,
  }
}

function writeCache() {
  console.log('Write cache', preloadSize, mode, lastUpdatedTime)
  fs.writeFileSync(cache, preloadSize + mode + lastUpdatedTime)
}

function readCache() {
  return fs.readFileSync(cache)
}

function isHaveCache() {
  return fs.existsSync(cache)
}

function shouldBuild() {
  if (isForce) {
    return true
  }

  //If there is no preload in dist, it needs to be packaged
  if (fs.existsSync(preloadPath) === false) {
    console.log('Preload not found in dist, should be build')
    return true
  }

  //Read the modification time of preload, if it exceeds 24 hours, it needs to be repackaged
  try {
    const preloadStats = fs.statSync(preloadPath)
    const preloadTime = preloadStats.mtimeMs
    const now = Date.now()
    const diff = now - preloadTime
    if (diff > cacheValidTime) {
      console.log('Preload cache expired, should be build')
      return true
    }
  } catch (error) {
    return true
  }

  if (isHaveCache()) {
    const cacheData = readCache().toString().trim()
    const res = cacheData !== preloadSize + mode + lastUpdatedTime
    if (res) {
      console.log('cachePreloadSizeChange, should be build')
    }
    return res
  }
  return true
}

async function build() {
  try {
    console.log('build preload start', {
      mode,
    })
    const { createRsbuild } = await import('@rsbuild/core')
    const builder = await createRsbuild({
      cwd: preloadDir,
      rsbuildConfig: {
        source: {
          entry: {
            preload: './index.ts',
          },
        },
        output: {
          externals: ['electron'],
          target: 'node',
          cleanDistPath: true,
          distPath: {
            root: distDir,
          },
        },
      },
    })
    await builder.build({
      mode,
    })
    writeCache()
    console.log('Build preload done')
  } catch (error) {
    console.log('Build preload error', error)
  }
}

if (shouldBuild()) {
  build()
} else {
  console.log('No need to build preload')
}
