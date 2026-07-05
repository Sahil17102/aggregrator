import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  IconBell,
  IconDashboard,
  IconKey,
  IconLayoutSidebarLeftCollapse,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react'
import { useSocket } from 'hooks/useSocket'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { getNotifications } from 'services/notification.service'
import { useAuthStore } from 'store/useAuthStore'
import { useNotificationsStore } from 'store/useNotificationsStore'

export default function AdminNavbar(props) {
  const { onOpen, onToggleSidebar, isSidebarCollapsed = false, sidebarWidth = 300, brandText } = props
  const { colorMode, toggleColorMode } = useColorMode()
  const history = useHistory()
  const logout = useAuthStore((state) => state.logout)
  const { unreadCount, setNotifications } = useNotificationsStore()
  useSocket()

  const navBg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const titleColor = useColorModeValue('#0F172A', '#E6EDF3')
  const iconColor = useColorModeValue('#64748B', '#8B949E')
  const iconHoverBg = useColorModeValue('#F9FAFB', '#21262D')
  const iconHoverColor = useColorModeValue('#0F172A', '#E6EDF3')
  const switchBg = useColorModeValue('#F5F3FF', '#1a2234')
  const switchBorder = useColorModeValue('#E2E8F0', '#30363D')
  const switchActiveBg = useColorModeValue('#FFFFFF', '#242349')
  const notificationBg = useColorModeValue('#F9FAFB', '#21262D')
  const notificationHoverBg = useColorModeValue('#EDE9FE', '#30363D')
  const avatarBg = useColorModeValue('#EDE9FE', '#242349')
  const avatarColor = useColorModeValue('#6C5CE7', '#8B7CF6')
  const menuBg = useColorModeValue('#FFFFFF', '#161B22')
  const menuText = useColorModeValue('#0F172A', '#E6EDF3')
  const menuMuted = useColorModeValue('#64748B', '#8B949E')
  const menuHoverBg = useColorModeValue('#F9FAFB', '#21262D')

  const setLightMode = () => {
    if (colorMode !== 'light') toggleColorMode()
  }

  const setDarkMode = () => {
    if (colorMode !== 'dark') toggleColorMode()
  }

  const handleLogout = () => {
    logout()
    history.replace('/login')
  }

  useEffect(() => {
    let mounted = true

    getNotifications()
      .then((data) => {
        if (mounted) setNotifications(data?.notifications || [])
      })
      .catch(() => {
        if (mounted) setNotifications([])
      })

    return () => {
      mounted = false
    }
  }, [setNotifications])

  return (
    <Flex
      position="fixed"
      top="0"
      left={{ base: '0', xl: `${sidebarWidth}px` }}
      right="0"
      h="70px"
      px={{ base: '16px', md: '30px' }}
      align="center"
      justify="space-between"
      bg={navBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      zIndex="1200"
    >
      <HStack spacing="20px" minW={0}>
        <IconButton
          aria-label="Open menu"
          display={{ base: 'inline-flex', xl: 'none' }}
          icon={<IconMenu2 size={20} />}
          onClick={onOpen}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: iconHoverBg, color: iconHoverColor }}
        />
        <IconButton
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          display={{ base: 'none', xl: 'inline-flex' }}
          icon={<IconLayoutSidebarLeftCollapse size={22} />}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: iconHoverBg, color: iconHoverColor }}
          onClick={onToggleSidebar}
        />
        <Text color={titleColor} fontSize="18px" fontWeight="800" noOfLines={1}>
          {brandText || 'Dashboard'}
        </Text>
      </HStack>

      <HStack spacing="10px">
        <HStack spacing="2px" bg={switchBg} border="1px solid" borderColor={switchBorder} borderRadius="18px" p="3px">
          <IconButton
            aria-label="Light mode"
            icon={<IconSun size={16} />}
            size="sm"
            borderRadius="50%"
            variant="ghost"
            color="#ff7a1a"
            bg={colorMode === 'light' ? switchActiveBg : 'transparent'}
            _hover={{ bg: switchActiveBg }}
            onClick={setLightMode}
          />
          <IconButton
            aria-label="Dark mode"
            icon={<IconMoon size={16} />}
            size="sm"
            borderRadius="50%"
            variant="ghost"
            color="#8d80ff"
            bg={colorMode === 'dark' ? switchActiveBg : 'transparent'}
            _hover={{ bg: switchActiveBg }}
            onClick={setDarkMode}
          />
        </HStack>

        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            icon={<IconBell size={20} />}
            w="38px"
            h="38px"
            borderRadius="50%"
            variant="ghost"
            color={titleColor}
            bg={notificationBg}
            _hover={{ bg: notificationHoverBg }}
            onClick={() => history.push('/admin/notifications')}
          />
          {unreadCount > 0 ? (
            <Badge
              position="absolute"
              top="-3px"
              right="-7px"
              bg="#f97316"
              color="white"
              borderRadius="999px"
              fontSize="10px"
              minW="18px"
              h="18px"
              px="5px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount}
            </Badge>
          ) : null}
        </Box>

        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            h="40px"
            w="40px"
            minW="40px"
            p="0"
            variant="ghost"
            borderRadius="999px"
            color={titleColor}
            _hover={{ bg: iconHoverBg }}
            _active={{ bg: iconHoverBg }}
          >
            <HStack spacing="8px">
              <Flex
                w="32px"
                h="32px"
                borderRadius="50%"
                align="center"
                justify="center"
                bg={avatarBg}
                color={avatarColor}
                fontSize="13px"
                fontWeight="800"
                flexShrink={0}
              >
                SA
              </Flex>
            </HStack>
          </MenuButton>
          <MenuList
            bg={menuBg}
            borderColor={borderColor}
            color={menuText}
            boxShadow="0 18px 42px rgba(15, 23, 42, 0.18)"
            minW="220px"
            zIndex="popover"
          >
            <Box px="12px" py="10px">
              <Text fontSize="sm" fontWeight="800">
                Super Admin
              </Text>
              <Text fontSize="xs" color={menuMuted}>
                Admin workspace
              </Text>
            </Box>
            <MenuDivider borderColor={borderColor} />
            <MenuItem icon={<IconDashboard size={18} />} _hover={{ bg: menuHoverBg }} onClick={() => history.push('/admin/dashboard')}>
              Dashboard
            </MenuItem>
            <MenuItem icon={<IconKey size={18} />} _hover={{ bg: menuHoverBg }} onClick={() => history.push('/admin/settings/change-password')}>
              Change password
            </MenuItem>
            <MenuItem icon={<IconSettings size={18} />} _hover={{ bg: menuHoverBg }} onClick={() => history.push('/admin/settings/payment-options')}>
              Payment options
            </MenuItem>
            <MenuDivider borderColor={borderColor} />
            <MenuItem icon={<IconLogout size={18} />} color="red.400" _hover={{ bg: menuHoverBg }} onClick={handleLogout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  )
}

AdminNavbar.propTypes = {
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
  onToggleSidebar: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool,
  sidebarWidth: PropTypes.number,
}
