import { Box } from '@chakra-ui/react'
import React from 'react'
import { brandIdentity } from 'theme/brand'
import SidebarContent from './SidebarContent'

function Sidebar(props) {
  const mainPanel = React.useRef()
  const { logoText, routes, sidebarVariant, sidebarWidth } = props

  return (
    <Box ref={mainPanel}>
      <Box display={{ base: 'none', xl: 'block' }} position="fixed" top="0" left="0" h="100vh" pointerEvents="none">
        <Box
          pointerEvents="auto"
          w={`${sidebarWidth}px`}
          minW={sidebarWidth > 0 ? '260px' : '0px'}
          h="100vh"
          overflow="hidden"
          position="relative"
        >
          <SidebarContent
            sidebarWidth={sidebarWidth}
            routes={routes}
            logoText={logoText || brandIdentity.name}
            sidebarVariant={sidebarVariant}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
