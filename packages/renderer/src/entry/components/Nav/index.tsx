import {
  AccountTreeOutlined,
  DownloadOutlined,
  ExtensionOutlined,
  HomeOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import { useMemo, type FC } from 'react'
import { useI18nContext } from '../../../context/hook'
import { Box, Stack, Typography } from '@mui/material'
import { ArrayRender } from '../../../components/ArrayRender'
import { useLocation, useNavigate } from 'react-router'
import { RouterPath } from '../../../constant/main'

import logoSrc from '../../../assets/logo.png'
import HomeIcon from '@mui/icons-material/Home'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import DownloadIcon from '@mui/icons-material/Download'
import ExtensionIcon from '@mui/icons-material/Extension'
import SettingsIcon from '@mui/icons-material/Settings'

//#region component Types
export interface NavProps {}
//#endregion component Types

//#region component
export const Nav: FC<NavProps> = () => {
  const { messages } = useI18nContext()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  
  const items = useMemo(() => {
    return [
      {
        path: RouterPath.Home,
        name: messages.Home,
        Icon: HomeOutlined,
        ActiveIcon: HomeIcon,
      },
      {
        path: RouterPath.Project,
        name: messages.Project,
        Icon: AccountTreeOutlined,
        ActiveIcon: AccountTreeIcon,
      },
      {
        path: RouterPath.Install,
        name: messages.Install,
        Icon: DownloadOutlined,
        ActiveIcon: DownloadIcon,
      },
      {
        path: RouterPath.Plugin,
        name: messages.Plugin,
        Icon: ExtensionOutlined,
        ActiveIcon: ExtensionIcon,
      },
      {
        path: RouterPath.Setting,
        name: messages.Setting,
        Icon: SettingsOutlined,
        ActiveIcon: SettingsIcon,
      },
    ]
  }, [messages])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 180,
        bgcolor: '#f5f5f5',
        // display: { xs: 'none', md: 'flex' },
      }}
      component="nav"
    >
      <Stack component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        <Box
          component={'img'}
          src={logoSrc}
          sx={{ height: 'auto', width: '100%', mb: 1 }}
        />
        <ArrayRender
          items={items}
          renderItem={(item) => {
            const { Icon, ActiveIcon, name } = item
            const isSelected = pathname === item.path
            const selectedInnerSx = isSelected
              ? {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {},
                }
              : {}
            const IconComponent = isSelected ? ActiveIcon : Icon
            return (
              <Stack
                component="li"
                direction="row"
                key={name}
                sx={{
                  alignItems: 'center',
                }}
                onClick={() => {
                  navigate(item.path)
                }}
              >
                <Stack
                  component="div"
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    width: '100%',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                    mx: 2,
                    my: 0.5,
                    p: 1,
                    borderRadius: 1.5,
                    ...selectedInnerSx,
                  }}
                >
                  <IconComponent />
                  <Typography
                    component="span"
                    sx={{
                      color: 'inherit',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </Typography>
                </Stack>
              </Stack>
            )
          }}
        />
      </Stack>
    </Box>
  )
}
//#endregion component
