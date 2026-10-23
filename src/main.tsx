import { ViteReactSSG } from 'vite-react-ssg'
import type { RouteRecord } from 'vite-react-ssg'
import { About, Privacy } from './app/StaticPages'
import { Home } from './app/Home'
import { NotFound } from './app/NotFound'
import { ToolPage } from './app/ToolPage'
import { ToolsIndex } from './app/ToolsIndex'
import { Layout } from './components/Layout'
import { READY_TOOLS } from './tools/registry'
import './styles/tokens.css'
import './styles/global.css'

const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home />, entry: 'src/app/Home.tsx' },
      { path: 'araclar', element: <ToolsIndex />, entry: 'src/app/ToolsIndex.tsx' },
      {
        path: 'araclar/:slug',
        element: <ToolPage />,
        entry: 'src/app/ToolPage.tsx',
        getStaticPaths: () => READY_TOOLS.map((t) => `araclar/${t.slug}`),
      },
      { path: 'gizlilik', element: <Privacy />, entry: 'src/app/StaticPages.tsx' },
      { path: 'hakkinda', element: <About />, entry: 'src/app/StaticPages.tsx' },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
