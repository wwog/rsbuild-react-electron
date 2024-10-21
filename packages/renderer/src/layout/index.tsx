import { useSetupSwitchDevTools } from '../hooks/useSetupSwitchDevTools'
import { useState, type FC } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Logger } from 'logger/renderer'
import { FallbackRender } from '../components/FallbackRender'
import { AppProvider, I18nProvider } from '../context/hook'
import { Context } from '../context/context'

import CssBaseline from '@mui/material/CssBaseline'

import '../global.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

//#region component Types
export interface LayoutProps {
  children?: React.ReactNode
}
//#endregion component Types

export const Layout: FC<LayoutProps> = (props) => {
  const { children } = props
  const [ctx] = useState(new Context())

  useSetupSwitchDevTools()

  return (
    <I18nProvider>
      <AppProvider context={ctx}>
        <CssBaseline />
        <ErrorBoundary
          fallbackRender={FallbackRender}
          onError={(info) => {
            Logger.error('ErrorBoundary', info)
          }}
          onReset={() => {
            window.location.reload()
          }}
        >
          {children}
        </ErrorBoundary>
      </AppProvider>
    </I18nProvider>
  )
}
