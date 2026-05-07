import type { FC } from 'react'
import type { FallbackProps } from 'react-error-boundary'

//#region component
export const FallbackRender: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}
//#endregion component
