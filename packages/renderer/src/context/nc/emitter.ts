import { compose } from '../../../../common/functional'
import { StackTrace } from '../../../../common/utils'

export type Event<T> = (
  listener: (e: T) => any,
  thisArgs?: any,
) => { dispose: () => void }

let id = 0
class UniqueContainer<T> {
  stack?: StackTrace
  public id = id++
  public dispose: () => void = () => {
    //@ts-ignore
    this.stack = null
    //@ts-ignore
    this.dispose = null
    //@ts-ignore
    this.value = null
  }
  constructor(public readonly value: T) {}
  setDisposeFunc(dispose: () => void) {
    this.dispose = compose(dispose, this.dispose)
  }
}
type ListenerContainer<T> = UniqueContainer<(data: T) => void>
type Listeners<T> = (ListenerContainer<T> | undefined)[]

const forEachListener = <T>(
  listeners: Listeners<T>,
  fn: (c: ListenerContainer<T>) => void,
) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners)
  } else {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i]
      if (l) {
        fn(l)
      }
    }
  }
}

export interface EmitterLogger {
  info?: (...args: any[]) => void
  warn?: (...args: any[]) => void
  error?: (...args: any[]) => void
}

export interface EmitterOptions<T> {
  /**
   * @description 开启调试模式后，将在发送和监听事件时打印详情信息。可以通过回调完成自定义的信息处理，所有回调都抛出了实例对象。
   * @default false
   */
  debug?: EmitterLogger | boolean
  onListenerError?: (e: any, thisArg: Emitter<T>) => void
  onWillAddFirstListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onDidAddFirstListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onWillDispose?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onDidDispose?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onWillPushListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onDidPushListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>,
  ) => void
  onWillFire?: (data: T, thisArg: Emitter<T>) => void
  onDidFire?: (data: T, thisArg: Emitter<T>) => void
}

/**
 * ```
 * example:
 *  const emitter = new Emitter<string>();
 *  const onCloseWindow = emitter.event
 *  const { dispose } = onCloseWindow((data) => {
 *    console.log("1", data);
 *  });
 *  dispose()
 *  onCloseWindow((data) => {
 *   console.log("2", data);
 *  });
 * ```
 */
export class Emitter<T = undefined> {
  /**
   * @description 触发警告监听器数量,当单个Emitter的监听器数量超过这个值时，会触发警告。
   * 默认值给的非常宽松,当出现50个以上时，请确保是否有重复监听。
   * @description_en Trigger warning listener quantity, when the number of listeners of a single Emitter exceeds this value, a warning will be triggered.
   * The default value is very loose. When there are more than 50 listeners, please make sure whether there are duplicate listeners.
   * @default 50
   */
  static WarnListenerSize = 50

  private _event?: Event<T>

  protected _listeners?: Listeners<T>
  protected _options?: EmitterOptions<T>
  protected debugLogger?: EmitterLogger

  constructor(options?: EmitterOptions<T>) {
    this._options = options
    const enableDebug = options?.debug
    if (enableDebug) {
      if (enableDebug === true) {
        this.debugLogger = {
          info: console.info,
          warn: console.warn,
          error: console.error,
        }
      } else {
        this.debugLogger = {
          info: enableDebug.info || console.info,
          warn: enableDebug.warn || console.warn,
          error: enableDebug.error || console.error,
        }
      }
    }
    this.debugLogger?.info?.('Emitter created')
  }

  /**
   * @description 清理所有的监听器
   * @description_en Clear all listeners
   */
  dispose() {
    this.debugLogger?.info?.('Emitter disposed')
    try {
      if (this._listeners) {
        forEachListener(this._listeners, (listener) => {
          listener.dispose()
        })
      }
    } catch (error) {
      this.debugLogger?.error?.('Emitter dispose error', error)
      this._options?.onListenerError?.(error, this)
    }
  }

  get listenerSize() {
    return this._listeners?.length || 0
  }

  /**
   * @description 返回一个事件监听器
   * @description_en Returns an event listener
   */
  get event(): Event<T> {
    this._event ??= (listener: (e: T) => any, thisArgs?: any) => {
      if (thisArgs) {
        //biome-ignore lint/style/noParameterAssign: <explanation>
        listener = listener.bind(thisArgs)
      }

      const contained = new UniqueContainer(listener)
      contained.stack = StackTrace.create()
      const dispose = () => {
        this.debugLogger?.info?.('dispose listener', contained)
        /* 
        Checking may be superfluous, and dispose may only be called after _event is executed
        _listeners must exist after _event is executed. 
        So the check here can be removed and, for safety's sake, retained
        */
        if (!this._listeners) {
          return
        }
        this._options?.onWillDispose?.(contained, this)
        const index = this._listeners!.indexOf(contained)
        if (index >= 0) {
          this._listeners!.splice(index, 1)
        }
        this._options?.onDidDispose?.(contained, this)
      }
      contained.setDisposeFunc(dispose)

      this.debugLogger?.info?.('emitter add event', contained)

      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(contained, this)
        this._listeners = [contained]
        this._options?.onDidAddFirstListener?.(contained, this)
      } else {
        if (this._listeners.length > Emitter.WarnListenerSize) {
          console.warn(
            `listeners size is too large, current size is ${this._listeners.length}`,
          )
        }
        this._options?.onWillPushListener?.(contained, this)
        this._listeners.push(contained)
        this._options?.onDidPushListener?.(contained, this)
      }

      return {
        dispose: contained.dispose,
      }
    }

    return this._event
  }

  private _deliver = (
    listener: undefined | UniqueContainer<(value: T) => void>,
    value: T,
  ) => {
    if (!listener) {
      return
    }
    const errorHandler = this._options?.onListenerError
    if (!errorHandler) {
      listener.value(value)
      return
    }
    try {
      listener.value(value)
    } catch (e) {
      errorHandler(e, this)
    }
  }

  /**
   * @description 触发事件
   * @description_en Trigger event
   */
  fire(data: T): void {
    this.debugLogger?.info?.('emitter fire', data, this.listenerSize)
    if (!this._listeners) {
      return
    }
    const listeners = this._listeners.slice()
    this._options?.onWillFire?.(data, this)
    forEachListener(listeners, (listener) => {
      this._deliver(listener, data)
    })
    this._options?.onDidFire?.(data, this)
  }
}
