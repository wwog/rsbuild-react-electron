import { Box, Card, Stack, Typography } from '@mui/material'
import { SizeBox } from '@wwog/react'
import type { FC } from 'react'
import { LocaleSelect } from '../../components/LocaleSelect'
import { useI18nContext } from '../../context/hook'

//#region component Types
export interface SettingPageProps {}
//#endregion component Types

//#region component
export const SettingPage: FC<SettingPageProps> = (_props) => {
  const { messages } = useI18nContext()
  return (
    <Box>
      <Card
        sx={{
          padding: 2,
          margin: 2,
        }}
      >
        <Stack
          component="div"
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{messages.Language}</Typography>
          <LocaleSelect />
        </Stack>
        <SizeBox h={12} />
        <Stack
          component="div"
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{messages.Theme}</Typography>
        </Stack>
      </Card>
    </Box>
  )
}
//#endregion component
