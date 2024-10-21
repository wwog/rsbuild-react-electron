import { createAlova } from 'alova'
import ReactHook from 'alova/react'
import { axiosRequestAdapter } from '@alova/adapter-axios'
import { Logger } from 'logger/renderer'
import type { Context } from '../context'

export function createApiInstance(ctx: Context) {
  const alovaIns = createAlova({
    requestAdapter: axiosRequestAdapter(),
    timeout: 10_000,
    shareRequest: true,
    beforeRequest: (config) => {
      ctx.logger.info(
        'Alova request:',
        `${config.url}?${new URLSearchParams(config.config.params).toString()}`,
      )
    },
    responded: {
      onError: (error) => {
        ctx.logger.error('Alova request error:', error)
      },
      onSuccess: (response) => {
        return response.data
      },
    },
    statesHook: ReactHook,
  })
  return alovaIns
}

export type ApiInstance = ReturnType<typeof createApiInstance>

export class Net {
  logger = Logger.scope('Net')
  apiIns: ApiInstance

  constructor(ctx: Context) {
    this.logger.info('new Instance')
    this.apiIns = createApiInstance(ctx)
  }
  Get: ApiInstance['Get'] = (...args) => this.apiIns.Get(...args)
  Post: ApiInstance['Post'] = (...args) => this.apiIns.Post(...args)

  dispose() {
    this.logger.info('disposed')
    this.apiIns = null as any
  }
}
