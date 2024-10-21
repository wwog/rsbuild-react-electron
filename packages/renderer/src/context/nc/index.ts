import { Logger } from 'logger/renderer'
import { Disposer } from '../../../../common/utils'
import { Emitter } from './emitter'
import type { BroadcastData } from '../../../../@types/global'

/**
 * ```
 * const { dispose } = context.nc.onInit.event(()=>{})
 * dispose()
 * context.nc.onInit.emit()
 * ```
 */
export class Nc {
  private logger = Logger.scope('Nc')
  private disposer = new Disposer()

  public onBroadcast: Emitter<BroadcastData>

  constructor() {
    this.logger.info('new Instance')
    this.onBroadcast = new Emitter()

    this.disposer.add(() => {
      this.onBroadcast.dispose()
      this.onBroadcast = null as any
    })
  }

  public dispose = () => {
    this.logger.info('dispose')
    this.disposer.dispose()
  }
}
