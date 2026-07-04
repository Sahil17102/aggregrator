import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Button, Collapse, Flex, Stack, Text } from '@chakra-ui/react'
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
      { label: 'Users Management', path: '/admin/users-management' },
      { label: 'Plans', path: '/admin/plans' },
    ],
  },
  {
    label: 'Support',
    icon: IconHelpCircle,
    children: [
      { label: 'Tickets', path: '/admin/support' },
      { label: 'About Us Page', path: '/admin/about-us' },
    ],
  },
  {
    label: 'Finance',
    icon: IconWallet,
    children: [
      { label: 'Invoices', path: '/admin/billing-invoices' },
      { label: 'COD Remittance', path: '/admin/cod-remittance' },
      { label: 'Wallet', path: '/admin/wallet' },
      { label: 'Weight Reconciliation', path: '/admin/weight-reconciliation' },
      { label: 'Dispute Management', path: '/admin/dispute-management' },
    ],
  },
  {
    label: 'Insights',
    icon: IconChartBar,
    children: [
      { label: 'Developer Logs', path: '/admin/developer' },
      { label: 'Notifications', path: '/admin/notifications' },
    ],
  },
  {
    label: 'Tools',
    icon: IconCalculator,
    children: [
      { label: 'Rate Calculator', path: '/admin/rate-calculator' },
      { label: 'Order Tracking', path: '/admin/order-tracking' },
      { label: 'API Integration', path: '/admin/api-integration' },
    ],
  },
  {
    label: 'Configuration',
    icon: IconSettings,
    children: [
      { label: 'Couriers', path: '/admin/couriers' },
      { label: 'Courier Credentials', path: '/admin/courier-credentials' },
      { label: 'Service Providers', path: '/admin/service-providers' },
      { label: 'Serviceability', path: '/admin/serviceability' },
      { label: 'B2B Pricing', path: '/admin/pricing/b2b' },
      { label: 'B2C Pricing', path: '/admin/pricing/b2c' },
      { label: 'Payment Options', path: '/admin/settings/payment-options' },
    ],
  },
  {
    label: 'Marketing',
    icon: IconSpeakerphone,
    children: [
      { label: 'About Us Page', path: '/admin/about-us' },
      { label: 'Plans', path: '/admin/plans' },
    ],
  },
  {
    label: 'Settings',
    icon: IconUserCircle,
    children: [
      { label: 'Change Password', path: '/admin/settings/change-password' },
      { label: 'Billing Preferences', path: '/admin/billing-preferences' },
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
      color={active ? '#7c5cff' : '#9aa4b2'}
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
      bg="#151b23"
      borderRight="1px solid #2a313a"
      position="fixed"
      left="0"
      top="0"
      overflowY="auto"
      overflowX="hidden"
      css={{
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-track': { background: '#151b23' },
        '&::-webkit-scrollbar-thumb': {
          background: '#3a4350',
          borderRadius: '4px',
        },
      }}
    >
      <Flex h="70px" px="28px" align="center" gap="14px" borderBottom="1px solid #2a313a">
        <Box
          as="img"
          src={brandIdentity.logoPath}
          alt={brandIdentity.name}
          w="40px"
          h="40px"
          borderRadius="50%"
          objectFit="cover"
        />
        <Text color="#f8fafc" fontSize="20px" fontWeight="800" letterSpacing="-0.02em">
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
                  h="45px"
                  px="16px"
                  align="center"
                  gap="12px"
                  borderRadius="8px"
                  bg={active ? '#29284f' : 'transparent'}
                  color={active ? '#7c5cff' : '#a8b3c2'}
                  _hover={{ bg: active ? '#29284f' : '#1d242d', color: '#f8fafc' }}
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
                h="45px"
                w="100%"
                px="16px"
                justifyContent="space-between"
                borderRadius="8px"
                bg={active ? '#29284f' : 'transparent'}
                color={active ? '#7c5cff' : '#a8b3c2'}
                fontWeight="500"
                _hover={{ bg: active ? '#29284f' : '#1d242d', color: '#f8fafc' }}
                _active={{ bg: '#29284f' }}
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
                <Stack spacing="4px" mt="6px" mb="4px" pl="42px">
                  {item.children.map((child) => {
                    const childActive = location.pathname.startsWith(child.path)
                    return (
                      <NavLink key={child.path} to={child.path}>
                        <Box
                          px="12px"
                          py="8px"
                          borderRadius="7px"
                          color={childActive ? '#f8fafc' : '#8f9bad'}
                          bg={childActive ? '#202733' : 'transparent'}
                          fontSize="14px"
                          fontWeight={childActive ? '700' : '500'}
                          _hover={{ bg: '#202733', color: '#f8fafc' }}
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
