import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HomePage } from '../page/main/home'
import { Layout } from '../layout'
import {
  createMemoryRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router'
import { Box, Stack } from '@mui/material'
import { Nav } from './components/Nav'
import { RouterPath } from '../constant/main'
import { ProjectPage } from '../page/main/project'
import { PluginPage } from '../page/main/plugin'
import { SettingPage } from '../page/main/setting'
import { InstallPage } from '../page/main/install'

const router = createMemoryRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Stack
          direction="row"
          sx={(theme) => {
            console.log('view theme', theme)
            return { height: '100%' }
          }}
        >
          <Nav />
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Outlet />
          </Box>
        </Stack>
      </Layout>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to={RouterPath.Home} replace />,
      },
      {
        path: RouterPath.Home,
        element: <HomePage />,
      },
      {
        path: RouterPath.Project,
        element: <ProjectPage />,
      },
      {
        path: RouterPath.Install,
        element: <InstallPage />,
      },
      {
        path: RouterPath.Plugin,
        element: <PluginPage />,
      },
      {
        path: RouterPath.Setting,
        element: <SettingPage />,
      },
    ],
  },
])

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
