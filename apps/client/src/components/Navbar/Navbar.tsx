import { alpha, Box, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useRef } from 'react'
import { MdDarkMode, MdLightMode, MdNotifications, MdSearch } from 'react-icons/md'
import { TbHeadphones, TbLayoutSidebarLeftCollapseFilled } from 'react-icons/tb'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth/AuthContext'
import WalletMenu from './WalletMenu'
import UserMenu from './UserMenu'

interface NavbarProps {
  handleDrawerToggle: () => void
  pinned: boolean
  name?: string
}

const DARK_BG = '#151b23'
const BORDER = '#2a313a'
const WHITE = '#f8fafc'
const MUTED = '#93a4ba'
const ACTIVE = '#7657ff'
const ORANGE = '#ff7a17'

const getSectionLabel = (pathname: string) =>
  (
    [
      { label: 'Home', match: '/home' },
      { label: 'Orders', match: '/orders' },
      { label: 'Dashboard', match: '/dashboard' },
      { label: 'Reports', match: '/reports' },
      { label: 'Wallet', match: '/billing/wallet_transactions' },
      { label: 'Billings', match: '/billing/invoice_management' },
      { label: 'COD Remittance', match: '/cod-remittance' },
      { label: 'Reconciliation', match: '/reconciliation' },
      { label: 'Operations', match: '/ops' },
      { label: 'Tools', match: '/tools' },
      { label: 'Support', match: '/support' },
      { label: 'Settings', match: '/settings' },
      { label: 'Channels', match: '/channels' },
      { label: 'Couriers', match: '/couriers' },
      { label: 'Profile', match: '/profile' },
    ] as const
  ).find((section) => pathname.startsWith(section.match))?.label || 'Home'

export default function Navbar({ handleDrawerToggle, pinned }: NavbarProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const topBarRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const activeSection = getSectionLabel(location.pathname)
  const { walletBalance } = useAuth()

  useEffect(() => {
    const root = document.documentElement
    const setTopBarOffset = () => {
      const height = Math.ceil(topBarRef.current?.getBoundingClientRect().height ?? 0)
      if (height > 0) root.style.setProperty('--client-navbar-offset', `${height}px`)
    }

    setTopBarOffset()

    if (typeof ResizeObserver === 'undefined' || !topBarRef.current) {
      return () => root.style.removeProperty('--client-navbar-offset')
    }

    const observer = new ResizeObserver(() => setTopBarOffset())
    observer.observe(topBarRef.current)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--client-navbar-offset')
    }
  }, [])

  return (
    <Box
      ref={topBarRef}
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 2,
        minHeight: 72,
        px: { xs: 1.5, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        bgcolor: DARK_BG,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        <IconButton
          size="small"
          onClick={handleDrawerToggle}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            color: MUTED,
            '&:hover': { bgcolor: alpha('#ffffff', 0.05), color: WHITE },
          }}
        >
          <TbLayoutSidebarLeftCollapseFilled
            size={20}
            style={{ transform: pinned ? 'none' : 'rotate(180deg)' }}
          />
        </IconButton>

        <Typography
          sx={{
            color: WHITE,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 850,
            letterSpacing: '-0.02em',
          }}
          noWrap
        >
          {activeSection}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={{ xs: 0.7, sm: 1 }}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ minWidth: 0 }}
      >
        {!isMobile ? (
          <IconButton
            aria-label="Search"
            onClick={() => navigate('/orders/list')}
            sx={{ width: 40, height: 40, color: MUTED, '&:hover': { bgcolor: alpha('#fff', 0.05), color: WHITE } }}
          >
            <MdSearch size={23} />
          </IconButton>
        ) : null}

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <WalletMenu compactLabel={`\u20B9${Number(walletBalance ?? 0).toLocaleString('en-IN')}`} />
        </Box>

        <Box
          onClick={() => navigate('/support/tickets')}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            alignItems: 'center',
            gap: 0.8,
            height: 38,
            px: 1.35,
            borderRadius: 2,
            cursor: 'pointer',
            border: `1px solid ${BORDER}`,
            color: WHITE,
            bgcolor: '#101720',
            fontSize: '0.9rem',
            fontWeight: 850,
            '& svg': { color: ACTIVE },
            '&:hover': { borderColor: alpha(ACTIVE, 0.5) },
          }}
        >
          <TbHeadphones size={18} />
          Support
        </Box>

        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            height: 38,
            alignItems: 'center',
            p: 0.35,
            borderRadius: 999,
            bgcolor: '#211f4d',
            border: `1px solid ${alpha(ACTIVE, 0.18)}`,
          }}
        >
          <IconButton size="small" sx={{ width: 30, height: 30, color: ORANGE }}>
            <MdLightMode size={16} />
          </IconButton>
          <IconButton size="small" sx={{ width: 30, height: 30, color: '#9b8cff', bgcolor: alpha(ACTIVE, 0.16) }}>
            <MdDarkMode size={16} />
          </IconButton>
        </Stack>

        <Box sx={{ position: 'relative' }}>
          <IconButton
            aria-label="Notifications"
            sx={{ width: 38, height: 38, color: MUTED, '&:hover': { bgcolor: alpha('#fff', 0.05), color: WHITE } }}
          >
            <MdNotifications size={21} />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              right: 1,
              minWidth: 18,
              height: 18,
              px: 0.4,
              borderRadius: 999,
              display: 'grid',
              placeItems: 'center',
              bgcolor: ORANGE,
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 900,
            }}
          >
            1
          </Box>
        </Box>

        <UserMenu compact />
      </Stack>
    </Box>
  )
}
