import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Button, Collapse, Flex, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import {
  IconCalculator,
  IconChartBar,
  IconDashboard,
  IconHelpCircle,
  IconPackageExport,
  IconSettings,
  IconSpeakerphone,
  IconTruck,
  IconUserCircle,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { brandIdentity } from 'theme/brand'

const sidebarItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: IconDashboard,
  },
  {
    label: 'Order Management',
    icon: IconPackageExport,
    children: [
      { label: 'Orders', path: '/admin/orders' },
      { label: 'NDR', path: '/admin/ops/ndr' },
      { label: 'RTO', path: '/admin/ops/rto' },
    ],
  },
  {
    label: 'Sellers',
    icon: IconUsers,
    children: [
      { label: 'Sellers', path: '/admin/users-management' },
      { label: 'Plans', path: '/admin/plans' },
      { label: 'Team Members', path: '/admin/team-members' },
    ],
  },
  {
    label: 'Support',
    icon: IconHelpCircle,
    path: '/admin/support-tickets',
  },
  {
    label: 'Finance',
    icon: IconWallet,
    children: [
      { label: 'Invoices', path: '/admin/billing-invoices' },
      { label: 'COD Remittance', path: '/admin/cod-remittance' },
      { label: 'Wallet', path: '/admin/wallet' },
    ],
  },
  {
    label: 'Insights',
    icon: IconChartBar,
    children: [
      { label: 'Reports', path: '/admin/reports' },
      { label: 'Activity Log', path: '/admin/activity-log' },
    ],
  },
  {
    label: 'Tools',
    icon: IconCalculator,
    children: [
      { label: 'Rate Calculator', path: '/admin/rate-calculator' },
    ],
  },
  {
    label: 'Configuration',
    icon: IconSettings,
    children: [
      { label: 'Couriers', path: '/admin/couriers' },
      { label: 'Service Providers', path: '/admin/service-providers' },
      { label: 'Serviceability', path: '/admin/serviceability' },
      { label: 'Manual Serviceability', path: '/admin/manual-serviceability' },
      { label: 'B2C Pricing', path: '/admin/pricing/b2c' },
      { label: 'B2B Pricing', path: '/admin/pricing/b2b' },
    ],
  },
  {
    label: 'Marketing',
    icon: IconSpeakerphone,
    children: [
      { label: 'All Blogs', path: '/admin/blogs' },
      { label: 'Create Blog', path: '/admin/create-blog' },
    ],
  },
  {
    label: 'Settings',
    icon: IconUserCircle,
    children: [
      { label: 'My Account', path: '/admin/account' },
      { label: 'Notifications', path: '/admin/notifications' },
      { label: 'Notification Settings', path: '/admin/notifications/settings' },
    ],
  },
]

const isItemActive = (pathname, item) => {
  if (item.path) return pathname.startsWith(item.path)
  return item.children?.some((child) => pathname.startsWith(child.path))
}

const SidebarContent = ({ logoText, sidebarWidth }) => {
  const location = useLocation()
  const [openGroups, setOpenGroups] = React.useState({})
  const sidebarBg = useColorModeValue('#ffffff', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const logoColor = useColorModeValue('#0F172A', '#E6EDF3')
  const itemColor = useColorModeValue('#64748B', '#8B949E')
  const itemHoverBg = useColorModeValue('#F9FAFB', '#21262D')
  const itemHoverColor = useColorModeValue('#0F172A', '#E6EDF3')
  const itemActiveBg = useColorModeValue('#EDE9FE', '#242349')
  const itemActiveColor = useColorModeValue('#6C5CE7', '#6C5CE7')
  const iconColor = useColorModeValue('#94A3B8', '#8B949E')
  const childColor = useColorModeValue('#64748B', '#8B949E')
  const childActiveBg = useColorModeValue('#EDE9FE', '#242349')
  const childActiveColor = useColorModeValue('#6C5CE7', '#6C5CE7')
  const scrollbarThumb = useColorModeValue('#CBD5E1', '#6E7681')

  React.useEffect(() => {
    const nextOpen = {}
    sidebarItems.forEach((item) => {
      if (item.children && isItemActive(location.pathname, item)) {
        nextOpen[item.label] = true
      }
    })
    setOpenGroups((prev) => ({ ...prev, ...nextOpen }))
  }, [location.pathname])

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const renderIcon = (Icon, active) => (
    <Box
      color={active ? itemActiveColor : iconColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      w="28px"
    >
      <Icon size={21} strokeWidth={1.8} />
    </Box>
  )

  return (
    <Box
      h="100vh"
      w={`${sidebarWidth}px`}
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor={borderColor}
      position="fixed"
      left="0"
      top="0"
      overflowY="auto"
      overflowX="hidden"
      css={{
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-track': { background: sidebarBg },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarThumb,
          borderRadius: '4px',
        },
      }}
    >
      <Flex h="70px" px="28px" align="center" gap="14px" borderBottom="1px solid" borderColor={borderColor}>
        <Box
          as="img"
          src={brandIdentity.logoPath}
          alt={brandIdentity.name}
          w="40px"
          h="40px"
          borderRadius="50%"
          objectFit="cover"
        />
        <Text color={logoColor} fontSize="22px" fontWeight="800" letterSpacing="0">
          {logoText || 'Admin Panel'}
        </Text>
      </Flex>

      <Stack spacing="6px" px="15px" py="20px">
        {sidebarItems.map((item) => {
          const active = isItemActive(location.pathname, item)
          const Icon = item.icon || IconTruck

          if (!item.children) {
            return (
              <NavLink key={item.label} to={item.path}>
                <Flex
                  h="39px"
                  px="16px"
                  align="center"
                  gap="12px"
                  borderRadius="8px"
                  bg={active ? itemActiveBg : 'transparent'}
                  color={active ? itemActiveColor : itemColor}
                  _hover={{ bg: active ? itemActiveBg : itemHoverBg, color: itemHoverColor }}
                  transition="all 0.16s ease"
                >
                  {renderIcon(Icon, active)}
                  <Text fontSize="18px" fontWeight={active ? '700' : '500'}>
                    {item.label}
                  </Text>
                </Flex>
              </NavLink>
            )
          }

          const open = Boolean(openGroups[item.label])

          return (
            <Box key={item.label}>
              <Button
                type="button"
                onClick={() => toggleGroup(item.label)}
                h="39px"
                w="100%"
                px="16px"
                justifyContent="space-between"
                borderRadius="8px"
                bg={active ? itemActiveBg : 'transparent'}
                color={active ? itemActiveColor : itemColor}
                fontWeight="500"
                _hover={{ bg: active ? itemActiveBg : itemHoverBg, color: itemHoverColor }}
                _active={{ bg: itemActiveBg }}
              >
                <Flex align="center" gap="12px">
                  {renderIcon(Icon, active)}
                  <Text fontSize="18px">{item.label}</Text>
                </Flex>
                <Box transition="transform 0.16s ease" transform={open ? 'rotate(90deg)' : 'rotate(0deg)'}>
                  <ChevronRightIcon boxSize="18px" />
                </Box>
              </Button>
              <Collapse in={open} animateOpacity>
                <Stack spacing="5px" mt="8px" mb="8px" pl="48px">
                  {item.children.map((child) => {
                    const childActive = location.pathname.startsWith(child.path)
                    return (
                      <NavLink key={child.path} to={child.path}>
                        <Box
                          px="12px"
                          py="9px"
                          borderRadius="7px"
                          color={childActive ? childActiveColor : childColor}
                          bg={childActive ? childActiveBg : 'transparent'}
                          fontSize="14px"
                          fontWeight={childActive ? '700' : '500'}
                          _hover={{ bg: childActiveBg, color: childActiveColor }}
                        >
                          {child.label}
                        </Box>
                      </NavLink>
                    )
                  })}
                </Stack>
              </Collapse>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default SidebarContent
