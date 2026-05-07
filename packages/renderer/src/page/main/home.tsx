import { Box } from '@mui/material'
import type { FC } from 'react'

//#region component Types
export interface HomePageProps {}
//#endregion component Types

//#region component
export const HomePage: FC<HomePageProps> = (_props) => {
  return <Box>Home</Box>
}
//#endregion component
