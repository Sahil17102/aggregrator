import { Badge, Box, Flex, HStack, IconButton, Text, useColorMode } from '@chakra-ui/react'
import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconMenu2,
  IconMoon,
  IconSun,
} from '@tabler/icons-react'
import PropTypes from 'prop-types'

export default function AdminNavbar(props) {
  const { onOpen, sidebarWidth = 300, brandText } = props
  const { colorMode, toggleColorMode } = useColorMode()

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
      bg="#151b23"
      borderBottom="1px solid #2a313a"
      zIndex="1200"
    >
      <HStack spacing="20px" minW={0}>
        <IconButton
          aria-label="Open menu"
          display={{ base: 'inline-flex', xl: 'none' }}
          icon={<IconMenu2 size={20} />}
          onClick={onOpen}
          variant="ghost"
          color="#9aa4b2"
          _hover={{ bg: '#202733', color: '#f8fafc' }}
        />
        <IconButton
          aria-label="Collapse sidebar"
          display={{ base: 'none', xl: 'inline-flex' }}
          icon={<IconLayoutSidebarLeftCollapse size={22} />}
          variant="ghost"
          color="#9aa4b2"
          _hover={{ bg: '#202733', color: '#f8fafc' }}
        />
        <Text color="#f8fafc" fontSize="18px" fontWeight="800" noOfLines={1}>
          {brandText || 'Dashboard'}
        </Text>
      </HStack>

      <HStack spacing="10px">
        <HStack spacing="2px" bg="#1d2240" border="1px solid #2d3358" borderRadius="18px" p="3px">
          <IconButton
            aria-label="Light mode"
            icon={<IconSun size={16} />}
            size="sm"
            borderRadius="50%"
            variant="ghost"
            color="#ff7a1a"
            bg={colorMode === 'light' ? '#2a2f55' : 'transparent'}
            _hover={{ bg: '#2a2f55' }}
          />
          <IconButton
            aria-label="Toggle color mode"
            icon={<IconMoon size={16} />}
            size="sm"
            borderRadius="50%"
            variant="ghost"
            color="#8d80ff"
            bg={colorMode === 'dark' ? '#2a2f55' : 'transparent'}
            _hover={{ bg: '#2a2f55' }}
            onClick={toggleColorMode}
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
            color="#f8fafc"
            bg="#202733"
            _hover={{ bg: '#28313d' }}
          />
          <Badge
            position="absolute"
            top="-3px"
            right="-7px"
            bg="#f97316"
            color="white"
            borderRadius="999px"
            fontSize="10px"
            px="5px"
          >
            9+
          </Badge>
        </Box>

        <Flex
          w="40px"
          h="40px"
          borderRadius="50%"
          align="center"
          justify="center"
          bg="#292866"
          color="#9b8cff"
          fontSize="14px"
          fontWeight="800"
        >
          SA
        </Flex>
      </HStack>
    </Flex>
  )
}

AdminNavbar.propTypes = {
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
  sidebarWidth: PropTypes.number,
}
