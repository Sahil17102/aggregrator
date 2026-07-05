import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useState, type ReactNode } from 'react'
import {
  FiChevronDown,
  FiGrid,
  FiMenu,
  FiShoppingBag,
  FiSliders,
  FiTruck,
  FiX,
} from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { brandIdentity } from '../../theme/brand'

type NavItem = {
  label: string
  to: string
}

type DropdownItem = NavItem & {
  description: string
  icon: ReactNode
}

type DropdownMenu = {
  label: string
  items: DropdownItem[]
}

interface PublicNavbarProps {
  links?: NavItem[]
  primaryLabel?: string
  primaryTo?: string
  solid?: boolean
}

const desktopLinks: NavItem[] = [
  { label: 'Platform', to: '/platform' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Track Shipment', to: '/track' },
]

const dropdownMenus: DropdownMenu[] = [
  {
    label: 'Integrations',
    items: [
      {
        label: 'Sales Channels',
        description: 'Amazon, Flipkart, Shopify & more',
        to: '/integrations/sales-channels',
        icon: <FiShoppingBag />,
      },
      {
        label: 'Courier Partners',
        description: 'BlueDart, Delhivery, DTDC & more',
        to: '/integrations/courier-partners',
        icon: <FiTruck />,
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        label: 'Weight Estimator',
        description: 'Calculate volumetric & dead weight',
        to: '/resources/weight-estimator',
        icon: <FiSliders />,
      },
      {
        label: 'Rate Calculator',
        description: 'Compare shipping rates instantly',
        to: '/resources/rate-calculator',
        icon: <FiGrid />,
      },
    ],
  },
]

const mobileLinks: NavItem[] = [
  { label: 'Platform', to: '/platform' },
  { label: 'Integrations', to: '/integrations/sales-channels' },
  { label: 'Tools', to: '/resources/rate-calculator' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Track Shipment', to: '/track' },
]

export default function PublicNavbar({
  links = desktopLinks,
  primaryLabel = 'Sign Up',
  primaryTo = '/signup',
  solid = false,
}: PublicNavbarProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isSolid = solid || scrolled
  const foreground = isSolid ? '#11182d' : '#FFFFFF'
  const muted = isSolid ? alpha('#11182d', 0.86) : alpha('#FFFFFF', 0.78)

  const navLinkSx = {
    px: 1.5,
    py: 1,
    borderRadius: '8px',
    color: muted,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1,
    textDecoration: 'none',
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&:hover': {
      bgcolor: isSolid ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
      color: foreground,
    },
  } as const

  const dropdownButtonSx = (open: boolean) =>
    ({
      ...navLinkSx,
      minHeight: 44,
      minWidth: 'auto',
      px: 1.7,
      textTransform: 'none',
      color: open ? foreground : muted,
      bgcolor: open ? (isSolid ? alpha('#7867f3', 0.12) : alpha('#FFFFFF', 0.14)) : 'transparent',
      '&:hover': {
        bgcolor: isSolid ? alpha('#7867f3', 0.12) : alpha('#FFFFFF', 0.14),
        color: foreground,
      },
      '& .MuiButton-endIcon': { ml: 0.35 },
    }) as const

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: isSolid ? '#FFFFFF' : 'transparent',
        borderBottom: isSolid ? `1px solid ${alpha('#11182d', 0.08)}` : '1px solid transparent',
        boxShadow: isSolid ? '0 8px 26px rgba(17, 24, 45, 0.06)' : 'none',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: 'auto',
          maxWidth: 1380,
          minHeight: { xs: 72, lg: 90 },
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label={`${brandIdentity.name} home`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.6,
            color: foreground,
            fontSize: { xs: '0.95rem', md: '1rem' },
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src={brandIdentity.logoSrc}
            alt=""
            sx={{
              width: { xs: 38, lg: 48 },
              height: { xs: 38, lg: 48 },
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          {brandIdentity.name}
        </Box>

        <Stack
          direction="row"
          spacing={1.4}
          alignItems="center"
          justifyContent="center"
          sx={{ display: { xs: 'none', lg: 'flex' }, flex: 1 }}
        >
          <Box component={RouterLink} to={links[0]?.to ?? '/'} sx={navLinkSx}>
            Platform
          </Box>

          {dropdownMenus.map((menu) => (
            <Box
              key={menu.label}
              onMouseEnter={() => setOpenDropdown(menu.label)}
              onMouseLeave={() => setOpenDropdown((current) => (current === menu.label ? null : current))}
              sx={{ position: 'relative' }}
            >
              <Button
                type="button"
                onClick={() =>
                  setOpenDropdown((current) => (current === menu.label ? null : menu.label))
                }
                endIcon={
                  <FiChevronDown
                    size={15}
                    style={{
                      transform: openDropdown === menu.label ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.18s ease',
                    }}
                  />
                }
                sx={dropdownButtonSx(openDropdown === menu.label)}
              >
                {menu.label}
              </Button>

              {openDropdown === menu.label ? (
                <Stack
                  spacing={1.2}
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    minWidth: 360,
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${alpha('#11182d', 0.06)}`,
                    boxShadow: '0 24px 70px rgba(17, 24, 45, 0.16)',
                  }}
                >
                  {menu.items.map((item) => (
                    <Stack
                      key={item.label}
                      component={RouterLink}
                      to={item.to}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      onClick={() => setOpenDropdown(null)}
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        color: '#11182d',
                        textDecoration: 'none',
                        '&:hover': { bgcolor: alpha('#7867f3', 0.08) },
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '14px',
                          bgcolor: alpha('#7867f3', 0.1),
                          color: '#7867f3',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#11182d', fontWeight: 900, fontSize: '1rem' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: alpha('#334155', 0.74), fontSize: '0.86rem', mt: 0.25 }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : null}
            </Box>
          ))}

          {links.slice(1).map((item) => (
            <Box key={item.label} component={RouterLink} to={item.to} sx={navLinkSx}>
              {item.label}
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={RouterLink}
            to={primaryTo}
            variant="contained"
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              minWidth: 194,
              minHeight: 50,
              px: 3.2,
              borderRadius: '12px',
              bgcolor: '#f97316',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#ea580c',
                boxShadow: 'none',
              },
            }}
          >
            {primaryLabel}
          </Button>

          <IconButton
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((open) => !open)}
            sx={{
              display: { xs: 'inline-flex', lg: 'none' },
              width: 42,
              height: 42,
              color: foreground,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: isSolid ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
              },
            }}
          >
            {mobileMenuOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </IconButton>
        </Stack>
      </Stack>

      {mobileMenuOpen ? (
        <Box
          sx={{
            mx: 2,
            mb: 1.4,
            borderRadius: '12px',
            border: `1px solid ${isSolid ? alpha('#11182d', 0.1) : alpha('#FFFFFF', 0.14)}`,
            bgcolor: isSolid ? '#FFFFFF' : alpha('#11183F', 0.96),
            boxShadow: '0 22px 54px rgba(0,0,0,0.22)',
            p: 1,
            display: { xs: 'block', lg: 'none' },
          }}
        >
          <Stack spacing={0.4}>
            {mobileLinks.map((item) => (
              <Box
                key={`${item.label}-${item.to}`}
                component={RouterLink}
                to={item.to}
                sx={{
                  px: 1.5,
                  py: 1.2,
                  borderRadius: '8px',
                  color: muted,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  '&:hover': {
                    bgcolor: isSolid ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
                    color: foreground,
                  },
                }}
              >
                {item.label}
              </Box>
            ))}
            <Button
              component={RouterLink}
              to={primaryTo}
              variant="contained"
              sx={{
                mt: 1,
                minHeight: 42,
                borderRadius: '10px',
                bgcolor: '#f97316',
                color: '#FFFFFF',
                fontWeight: 800,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#ea580c',
                  boxShadow: 'none',
                },
              }}
            >
              {primaryLabel}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}
