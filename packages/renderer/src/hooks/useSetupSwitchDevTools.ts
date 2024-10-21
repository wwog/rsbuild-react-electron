import {useEffect} from 'react'
import { SendChannel } from '../../../common/constant'


const {ipcRenderer} = window.api

let isSetupSwitchDevTools = false

const handle = (event: KeyboardEvent) => {
  if (process.env.NODE_ENV === 'development') {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
      ipcRenderer.send(SendChannel.SwitchDevTools)
    }
  }
}

/**
 * 用于注册快捷键，切换开发者工具
 */
export function useSetupSwitchDevTools() {
  useEffect(() => {
    if (isSetupSwitchDevTools === false) {
      window.addEventListener('keydown', handle)
      isSetupSwitchDevTools = true
    }

    return () => {
      if (isSetupSwitchDevTools) {
        window.removeEventListener('keydown', handle)
      }
    }
  }, [])
}