import type { FC } from 'react'
import { Box, MenuItem, Select } from '@mui/material'
import { useI18nContext } from '../../context/hook'

export const LocaleSelect: FC = () => {
  const { supportedLangs, setLang, lang } = useI18nContext()
  return (
    <Box>
      <Select
        size="small"
        name="Language"
        value={lang}
        
        onChange={(item) => {
          setLang(item.target.value)
        }}
      >
        {supportedLangs.map((item) => (
          <MenuItem key={item.key} value={item.key}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
//#endregion component
