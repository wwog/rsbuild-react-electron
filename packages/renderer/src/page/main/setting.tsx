import type { FC } from 'react'
import { Box, Card, Stack, Typography } from '@mui/material'
import { useI18nContext } from '../../context/hook'
import { LocaleSelect } from '../../components/LocaleSelect'
import { SizeBox } from '../../components/SizeBox'

//#region component Types
export interface SettingPageProps {}
//#endregion component Types

//#region component
export const SettingPage: FC<SettingPageProps> = (props) => {
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
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography>{messages.Language}</Typography>
          <LocaleSelect />
        </Stack>
        <SizeBox h={12} />
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography>{messages.Theme}</Typography>
        </Stack>
      </Card>
    </Box>
  )
}
//#endregion component
