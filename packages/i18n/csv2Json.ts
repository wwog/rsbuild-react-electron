import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

class Config {
  public file_path: string
  public out_dir: string
  constructor(file_path: string, out_dir: string) {
    this.file_path = file_path
    this.out_dir = path.join(__dirname, out_dir)
  }

  static build(args: string[]): Config {
    if (args.length < 3) {
      throw new Error('Not enough arguments')
    }
    return new Config(args[2], args[3])
  }
}

interface ColumnOptions {
  lang: string
  index: number
  outDir: string
}

class Column {
  public lang: string
  public index: number
  public outDir: string

  private _filePath: string
  private _file: fs.WriteStream | null = null

  constructor(options: ColumnOptions) {
    this.lang = options.lang
    this.index = options.index
    this.outDir = options.outDir
    this._filePath = path.join(this.outDir, `${this.lang}.json`)
  }

  private async createFile() {
    const dirPath = path.dirname(this._filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const file = fs.createWriteStream(this._filePath)

    return new Promise<fs.WriteStream>((resolve, reject) => {
      file.write('{\n', (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(file)
        }
      })
    })
  }

  async write(data: string) {
    if (!this._file) {
      this._file = await this.createFile()
    }
    return new Promise<void>((resolve, reject) => {
      this._file?.write(data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async destroy() {
    const closePromise = new Promise<void>((resolve, reject) => {
      if (this._file) {
        this._file.close((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
    await closePromise
    const fd = fs.openSync(this._filePath, 'r+')
    const fileSize = fs.statSync(this._filePath).size
    if (fileSize === 2) {
      fs.unlinkSync(this._filePath)
    } else {
      fs.writeSync(fd, '\n}', fileSize - ',\n'.length, 'utf-8')
      fs.closeSync(fd)
    }
  }

  [Symbol.asyncDispose] = async () => {
    await this.destroy()
  }
}

async function* lineReader(filePath: string) {
  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  for await (const line of rl) {
    yield line
  }
}

/**
 * @description 流式转换csv文件到json文件
 * @description_en Stream conversion of csv file to json file
 * @param config 
 */
export async function translate(config: Config) {
  const { file_path, out_dir } = config
  const lines = lineReader(file_path)

  const columns: Column[] = []
  try {
    const headerLine = (await lines.next()).value
    if (!headerLine) {
      throw new Error('No header line found')
    }
    const header = headerLine.trim()
    header
      .split(',')
      .slice(1)
      .forEach(async (lang, i) => {
        const _lang = lang.trim().replace(/^"|"$/g, '')
        if (_lang) {
          columns.push(
            new Column({
              lang: _lang,
              index: i + 1,
              outDir: out_dir,
            }),
          )
        }
      })

    for await (const line of lines) {
      if (line.trim() === '') {
        continue
      }
      const values = line.split(',').map((v) => {
        return v.trim().replace(/^"|"$/g, '')
      })

      const promises = columns.map(async (column) => {
        const value = values[column.index]
        if (value) {
          await column.write(`  "${values[0]}": "${value}",\n`)
        } else {
          console.log(`No value for ${column.lang} in ${values[0]}`)
        }
      })

      await Promise.all(promises)
    }
  } finally {
    for (const column of columns) {
      await column.destroy()
    }
  }
}

console.log('Starting translation')
const config = Config.build(process.argv)
translate(config)
  .then(() => {
    console.log('Translation complete')
  })
  .catch((err) => {
    console.error(err)
  })
