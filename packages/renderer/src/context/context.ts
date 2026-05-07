import { Logger } from 'logger/renderer'
import { Nc } from './nc'
import { Net } from './net'

export class Context {
  net: Net
  logger = Logger.scope('Context')
  nc: Nc

  constructor() {
    this.logger.info('Context created')
    this.net = new Net(this)
    this.nc = new Nc()
  }

  dispose() {
    this.logger.info('Context disposed')
    this.net.dispose()
  }
}
