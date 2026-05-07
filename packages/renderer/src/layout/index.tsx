import CssBaseline from '@mui/material/CssBaseline'
import { Logger } from 'logger/renderer'
import { type FC, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { FallbackRender } from '../components/FallbackRender'
import { Context } from '../context/context'
import { AppProvider, I18nProvider } from '../context/hook'
import { useSetupSwitchDevTools } from '../hooks/useSetupSwitchDevTools'

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
          fallbackRender={(props) => <FallbackRender {...props} />}
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
