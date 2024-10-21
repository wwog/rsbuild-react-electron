export interface IDisposerContext {
  disposeFunc(): void
  mark?: string
}

export class Disposer {
  private disposeList: IDisposerContext[] = []

  constructor(
    private logger: {
      info: (...args: any[]) => void
      error: (...args: any[]) => void
      warn: (...args: any[]) => void
    } = {
      info: console.log,
      error: console.error,
      warn: console.warn,
    },
  ) {}

  /**
   * @param dispose
   * @param mark mark is printed when the cleanup is performed
   */
  add(dispose: () => void, mark?: string) {
    if (typeof dispose !== 'function') {
      this.logger.error('dispose is not a function', dispose)
      return
    }
    if (this.disposeList.find((item) => item.disposeFunc === dispose)) {
      this.logger.warn('dispose is already added', dispose)
      return
    }

    this.disposeList.push({
      disposeFunc: dispose,
      mark,
    })
  }

  dispose() {
    for (const element of this.disposeList) {
      const { disposeFunc, mark } = element
      try {
        disposeFunc()
        if (mark) {
          this.logger.info(`dispose ${mark}`)
        }
      } catch (e) {
        this.logger.error('dispose error', e)
      }
    }

    this.disposeList = []
  }
}

export class StackTrace {
  public static create() {
    return new StackTrace(new Error().stack ?? '')
  }

  public static getGlobalLimit = () => Error?.stackTraceLimit
  public static setGlobalLimit(limit: number) {
    if (Error && Error.stackTraceLimit !== limit) {
      Error.stackTraceLimit = limit
    }
  }

  public readonly originStack: string[] = []

  private constructor(stackStr: string) {
    this.originStack = stackStr.split('\n')
  }

  getStack(excludeItems = 2) {
    return this.originStack.slice(excludeItems)
  }

  toString(excludeItems = 2) {
    return this.getStack(excludeItems).join('\n')
  }

  print(excludeItems = 2) {
    console.log(this.toString(excludeItems))
  }
}

