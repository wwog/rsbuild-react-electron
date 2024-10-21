import { Logger } from 'logger/renderer'
import { memo, type FC } from 'react'

//#region component Types
export interface SizeBoxProps {
  h?: number | string
  w?: number | string
}
//#endregion component Types

//#region component
export const SizeBox: FC<SizeBoxProps> = memo((props) => {
  const { h, w } = props
  if (!h && !w) {
    Logger.warn('SizeBox: no size')
    return null
  }
  const style = { height: h, width: w }
  return <div style={style} />
})
//#endregion component
