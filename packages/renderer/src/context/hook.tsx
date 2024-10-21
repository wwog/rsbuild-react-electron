import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
} from 'react'
import type { Context } from './context'
import {
  BroadcastType,
  InvokeChannel,
  SendChannel,
  SyncChannel,
} from '../../../common/constant'
import type { I18nMessages, SupportedLanguage } from '../../../@types/global'

const { ipcRenderer } = window.api

export interface I18nData {
  lang: string
  messages: I18nMessages
  supportedLangs: SupportedLanguage[]
  setLang: (lang: string) => void
}

export const AppContext = createContext<Context>({} as Context)
export const I18nContext = createContext<I18nData>({} as I18nData)

export interface AppProviderProps {
  context: Context
  children?: React.ReactNode
}

export interface I18nProviderProps {
  children?: React.ReactNode
}

export const AppProvider: FC<AppProviderProps> = (props) => {
  const { context } = props

  useEffect(() => {
    const { dispose } = ipcRenderer.onBroadcast((data) => {
      context.nc.onBroadcast.fire(data)
    })

    return () => {
      dispose()
    }
  }, [context])

  return (
    <AppContext.Provider value={props.context}>
      {props.children}
    </AppContext.Provider>
  )
}

export const I18nProvider: FC<I18nProviderProps> = (props) => {
  const [i18, setI18] = useState<I18nData>(
    ipcRenderer.sendSync(SyncChannel.GetI18n),
  )

  const onI18nSet = useCallback((_: any, data: any) => {
    if (data.type === BroadcastType.SetI18n) {
      setI18(data.payload)
    }
  }, [])

  const setLang = useCallback(async (lang: string) => {
    const data = await ipcRenderer.invoke(InvokeChannel.SetI18n, lang)
    setI18(data as any)
  }, [])

  useEffect(() => {
    ipcRenderer.on(SendChannel.Broadcast, onI18nSet)

    return () => {
      ipcRenderer.removeListener(SendChannel.Broadcast, onI18nSet)
    }
  }, [onI18nSet])

  if (i18.lang === '') {
    return null
  }

  return (
    <I18nContext.Provider
      value={{
        lang: i18.lang,
        messages: i18.messages,
        supportedLangs: i18.supportedLangs,
        setLang,
      }}
    >
      {props.children}
    </I18nContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}

export function useI18nContext() {
  return useContext(I18nContext)
}
