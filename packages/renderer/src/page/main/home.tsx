import type { FC } from 'react'
import { Box } from '@mui/material'

//#region component Types
export interface HomePageProps {}
//#endregion component Types

//#region component
export const HomePage: FC<HomePageProps> = (props) => {
  return <Box>Home</Box>
}
//#endregion component
