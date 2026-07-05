import {
  alpha,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MdDarkMode, MdLightMode, MdNotifications, MdSearch } from 'react-icons/md'
import { TbHeadphones, TbLayoutSidebarLeftCollapseFilled } from 'react-icons/tb'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth/AuthContext'
import { useClientThemeMode } from '../../context/theme/ClientThemeContext'
import { useClientNotifications } from '../../hooks/useClientNotifications'
import WalletMenu from './WalletMenu'
import UserMenu from './UserMenu'

interface NavbarProps {
  handleDrawerToggle: () => void
  pinned: boolean
  name?: string
}

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
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const activeSection = getSectionLabel(location.pathname)
  const { walletBalance, isAuthenticated } = useAuth()
  const { mode, setMode } = useClientThemeMode()
  const isDark = theme.palette.mode === 'dark'
  const navBg = isDark ? '#151b23' : '#ffffff'
  const panelBg = isDark ? '#101720' : '#f8fafc'
  const borderColor = isDark ? '#2a313a' : alpha('#0f172a', 0.1)
  const textColor = isDark ? '#f8fafc' : '#11182d'
  const mutedColor = isDark ? '#93a4ba' : '#64748b'
  const hoverBg = isDark ? alpha('#fff', 0.05) : alpha('#11182d', 0.055)
  const notificationOpen = Boolean(notificationAnchor)
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    markRead,
    markAllRead,
    markingAllRead,
  } = useClientNotifications(isAuthenticated)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !Boolean(notification.read ?? notification.isRead)).length,
    [notifications],
  )

  const latestNotifications = useMemo(() => notifications.slice(0, 8), [notifications])

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
        bgcolor: navBg,
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 8px 24px rgba(15, 23, 42, 0.06)',
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
            color: mutedColor,
            '&:hover': { bgcolor: hoverBg, color: textColor },
          }}
        >
          <TbLayoutSidebarLeftCollapseFilled
            size={20}
            style={{ transform: pinned ? 'none' : 'rotate(180deg)' }}
          />
        </IconButton>

        <Typography
          sx={{
            color: textColor,
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
            sx={{ width: 40, height: 40, color: mutedColor, '&:hover': { bgcolor: hoverBg, color: textColor } }}
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
            border: `1px solid ${borderColor}`,
            color: textColor,
            bgcolor: panelBg,
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
            bgcolor: isDark ? '#211f4d' : alpha(ACTIVE, 0.08),
            border: `1px solid ${alpha(ACTIVE, 0.18)}`,
          }}
        >
          <IconButton
            size="small"
            aria-label="Switch to light mode"
            aria-pressed={mode === 'light'}
            onClick={() => setMode('light')}
            sx={{
              width: 30,
              height: 30,
              color: mode === 'light' ? ORANGE : mutedColor,
              bgcolor: mode === 'light' ? alpha(ORANGE, 0.16) : 'transparent',
            }}
          >
            <MdLightMode size={16} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Switch to dark mode"
            aria-pressed={mode === 'dark'}
            onClick={() => setMode('dark')}
            sx={{
              width: 30,
              height: 30,
              color: mode === 'dark' ? '#9b8cff' : mutedColor,
              bgcolor: mode === 'dark' ? alpha(ACTIVE, 0.16) : 'transparent',
            }}
          >
            <MdDarkMode size={16} />
          </IconButton>
        </Stack>

        <IconButton
          aria-label="Notifications"
          onClick={(event) => setNotificationAnchor(event.currentTarget)}
          sx={{ width: 38, height: 38, color: mutedColor, '&:hover': { bgcolor: hoverBg, color: textColor } }}
        >
          <Badge
            badgeContent={unreadCount}
            max={99}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: ORANGE,
                color: '#fff',
                fontWeight: 900,
                minWidth: 18,
                height: 18,
                fontSize: '0.68rem',
              },
            }}
          >
            <MdNotifications size={21} />
          </Badge>
        </IconButton>

        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={() => setNotificationAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.15,
              width: { xs: 320, sm: 380 },
              maxWidth: 'calc(100vw - 24px)',
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: navBg,
              color: textColor,
              boxShadow: isDark ? '0 24px 54px rgba(0,0,0,0.36)' : '0 20px 42px rgba(15,23,42,0.14)',
              overflow: 'hidden',
            },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.7, py: 1.35 }}>
            <Box>
              <Typography sx={{ color: textColor, fontWeight: 900, fontSize: '0.98rem' }}>
                Notifications
              </Typography>
              <Typography sx={{ color: mutedColor, fontWeight: 650, fontSize: '0.78rem', mt: 0.2 }}>
                {unreadCount ? `${unreadCount} unread` : 'All caught up'}
              </Typography>
            </Box>
            <Button
              size="small"
              disabled={!unreadCount || markingAllRead}
              onClick={() => markAllRead()}
              sx={{ color: ORANGE, fontWeight: 850 }}
            >
              Mark all read
            </Button>
          </Stack>
          <Divider sx={{ borderColor }} />
          {notificationsLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
              <CircularProgress size={24} sx={{ color: ORANGE }} />
            </Stack>
          ) : latestNotifications.length ? (
            <List sx={{ p: 0, maxHeight: 420, overflowY: 'auto' }}>
              {latestNotifications.map((notification) => {
                const unread = !Boolean(notification.read ?? notification.isRead)
                return (
                  <ListItemButton
                    key={notification.id}
                    onClick={() => {
                      if (unread) markRead(notification.id)
                    }}
                    sx={{
                      alignItems: 'flex-start',
                      gap: 1.2,
                      px: 1.7,
                      py: 1.35,
                      bgcolor: unread ? alpha(ORANGE, isDark ? 0.12 : 0.08) : 'transparent',
                      borderBottom: `1px solid ${borderColor}`,
                      '&:hover': { bgcolor: hoverBg },
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0.5,
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: unread ? ORANGE : alpha(mutedColor, 0.35),
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={notification.title || 'Notification'}
                      secondary={
                        <>
                          <Typography component="span" sx={{ display: 'block', color: mutedColor, fontSize: '0.82rem', lineHeight: 1.45 }}>
                            {notification.message}
                          </Typography>
                          {notification.createdAt ? (
                            <Typography component="span" sx={{ display: 'block', color: alpha(mutedColor, 0.82), fontSize: '0.72rem', mt: 0.6, fontWeight: 700 }}>
                              {new Date(notification.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          ) : null}
                        </>
                      }
                      primaryTypographyProps={{
                        color: textColor,
                        fontWeight: unread ? 900 : 750,
                        fontSize: '0.9rem',
                        lineHeight: 1.35,
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          ) : (
            <Stack alignItems="center" textAlign="center" sx={{ px: 3, py: 5 }}>
              <MdNotifications size={30} color={mutedColor} />
              <Typography sx={{ mt: 1, color: textColor, fontWeight: 850 }}>No notifications yet</Typography>
              <Typography sx={{ mt: 0.5, color: mutedColor, fontSize: '0.82rem' }}>
                New order and shipment updates will appear here.
              </Typography>
            </Stack>
          )}
        </Popover>

        <UserMenu compact />
      </Stack>
    </Box>
  )
}
