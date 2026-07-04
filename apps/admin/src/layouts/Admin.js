import { ChakraProvider, Portal, useDisclosure } from '@chakra-ui/react'
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import { RouteAssetRecovery, RouteErrorBoundary } from 'components/RouteRecovery/RouteErrorBoundary'
import Sidebar from 'components/Sidebar'
import { useState } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import routes from 'routes.js'
import theme from 'theme/theme.js'
import MainPanel from '../components/Layout/MainPanel'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import { brandIdentity } from '../theme/brand'

export default function Dashboard(props) {
  const { ...rest } = props
  const location = useLocation()
  const [sidebarVariant, setSidebarVariant] = useState('transparent')
  const [sidebarWidth] = useState(300)

  const getRoute = () => window.location.pathname !== '/admin/full-screen-maps'

  const getActiveRoute = (allRoutes) => {
    let activeRoute = 'Default Brand Text'
    for (let i = 0; i < allRoutes.length; i++) {
      if (allRoutes[i].collapse || allRoutes[i].category) {
        const nestedRoute = getActiveRoute(allRoutes[i].views)
        if (nestedRoute !== activeRoute) return nestedRoute
      } else if (window.location.href.indexOf(allRoutes[i].layout + allRoutes[i].path) !== -1) {
        return allRoutes[i].name
      }
    }
    return activeRoute
  }

  const getActiveNavbar = (allRoutes) => {
    let activeNavbar = false
    for (let i = 0; i < allRoutes.length; i++) {
      if (allRoutes[i].category) {
        const categoryNavbar = getActiveNavbar(allRoutes[i].views)
        if (categoryNavbar !== activeNavbar) return categoryNavbar
      } else if (window.location.href.indexOf(allRoutes[i].layout + allRoutes[i].path) !== -1) {
        if (allRoutes[i].secondaryNavbar) return allRoutes[i].secondaryNavbar
      }
    }
    return activeNavbar
  }

  const getRoutes = (allRoutes) =>
    allRoutes.map((prop, key) => {
      if (prop.collapse || prop.category) return getRoutes(prop.views)
      if (prop.layout === '/admin') {
        return <Route path={prop.layout + prop.path} component={prop.component} key={key} />
      }
      return null
    })

  const { isOpen, onOpen, onClose } = useDisclosure()
  document.documentElement.dir = 'ltr'

  return (
    <ChakraProvider theme={theme} resetCss={false}>
      <RouteAssetRecovery />
      <Sidebar
        routes={routes}
        logoText="Admin Panel"
        sidebarVariant={sidebarVariant}
        sidebarWidth={sidebarWidth}
        {...rest}
      />

      <MainPanel
        w={{
          base: '100%',
          xl: `calc(100% - ${sidebarWidth}px)`,
        }}
        ml={{ xl: `${sidebarWidth}px` }}
        bg="#0f141b"
        minH="100vh"
      >
        <Portal>
          <AdminNavbar
            onOpen={onOpen}
            logoText={brandIdentity.name}
            brandText={getActiveRoute(routes)}
            secondary={getActiveNavbar(routes)}
            sidebarWidth={sidebarWidth}
            {...rest}
          />
        </Portal>
        {getRoute() ? (
          <PanelContent>
            <PanelContainer>
              <RouteErrorBoundary resetKey={`${location.pathname}${location.search}`}>
                <Switch>
                  {getRoutes(routes)}
                  <Redirect from="/admin" to="/admin/dashboard" />
                </Switch>
              </RouteErrorBoundary>
            </PanelContainer>
          </PanelContent>
        ) : null}
      </MainPanel>
    </ChakraProvider>
  )
}
