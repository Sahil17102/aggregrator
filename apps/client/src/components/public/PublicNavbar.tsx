import { Box, Button, IconButton, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { brandIdentity } from '../../theme/brand'

type NavItem = {
  label: string
  to: string
}

interface PublicNavbarProps {
  links?: NavItem[]
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}

const desktopLinks: NavItem[] = [
  { label: 'Platform', to: '/' },
  { label: 'Blogs', to: '/' },
  { label: 'Track Shipment', to: '/tracking' },
]

const dropdownLinks = ['Integrations', 'Tools']

const mobileLinks: NavItem[] = [
  { label: 'Platform', to: '/' },
  { label: 'Integrations', to: '/channels/channel_list' },
  { label: 'Tools', to: '/rate-calculator' },
  { label: 'Blogs', to: '/' },
  { label: 'Track Shipment', to: '/tracking' },
]

export default function PublicNavbar({
  links = desktopLinks,
  primaryLabel = 'Sign Up',
  primaryTo = '/signin',
}: PublicNavbarProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinkSx = {
    px: 1.5,
    py: 1,
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.88rem',
    fontWeight: 800,
    lineHeight: 1,
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&:hover': {
      bgcolor: alpha('#FFFFFF', 0.08),
      color: '#FFFFFF',
    },
  } as const

  return (
    <Box
      component="nav"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        bgcolor: 'transparent',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: 'auto',
          maxWidth: 990,
          minHeight: { xs: 64, lg: 72 },
          px: { xs: 2, sm: 3, lg: 0 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label={`${brandIdentity.name} home`}
          sx={{
            color: '#FFFFFF',
            fontSize: { xs: '1.12rem', md: '1.2rem' },
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}
        >
          {brandIdentity.name}
        </Box>

        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
          justifyContent="center"
          sx={{ display: { xs: 'none', lg: 'flex' }, flex: 1 }}
        >
          <Box component={RouterLink} to={links[0]?.to ?? '/'} sx={navLinkSx}>
            Platform
          </Box>

          {dropdownLinks.map((item) => (
            <Button
              key={item}
              type="button"
              endIcon={<FiChevronDown size={14} />}
              sx={{
                ...navLinkSx,
                minHeight: 'auto',
                minWidth: 'auto',
                textTransform: 'none',
                '& .MuiButton-endIcon': { ml: 0.4 },
              }}
            >
              {item}
            </Button>
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
              minWidth: 91,
              minHeight: 40,
              px: 2.4,
              borderRadius: '12px',
              bgcolor: '#FF8424',
              color: '#FFFFFF',
              fontWeight: 800,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#F47B14',
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
              color: '#FFFFFF',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: alpha('#FFFFFF', 0.08),
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
            borderRadius: '12px',
            border: `1px solid ${alpha('#FFFFFF', 0.14)}`,
            bgcolor: alpha('#11183F', 0.96),
            boxShadow: '0 22px 54px rgba(0,0,0,0.32)',
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
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  '&:hover': {
                    bgcolor: alpha('#FFFFFF', 0.08),
                    color: '#FFFFFF',
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
                bgcolor: '#FF8424',
                color: '#FFFFFF',
                fontWeight: 800,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#F47B14',
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
