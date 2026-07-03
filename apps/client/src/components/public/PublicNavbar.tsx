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
}

const desktopLinks: NavItem[] = [
  { label: 'Platform', to: '/platform' },
  { label: 'Blogs', to: '/platform#support' },
  { label: 'Track Shipment', to: '/tracking' },
]

const dropdownLinks: NavItem[] = [
  { label: 'Integrations', to: '/platform#integrations' },
  { label: 'Tools', to: '/rate-calculator' },
]

const mobileLinks: NavItem[] = [
  { label: 'Platform', to: '/platform' },
  { label: 'Integrations', to: '/platform#integrations' },
  { label: 'Tools', to: '/rate-calculator' },
  { label: 'Blogs', to: '/platform#support' },
  { label: 'Track Shipment', to: '/tracking' },
]

export default function PublicNavbar({
  links = desktopLinks,
  primaryLabel = 'Sign Up',
  primaryTo = '/signup',
}: PublicNavbarProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const foreground = scrolled ? '#11182d' : '#FFFFFF'
  const muted = scrolled ? alpha('#11182d', 0.86) : alpha('#FFFFFF', 0.78)

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
      bgcolor: scrolled ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
      color: foreground,
    },
  } as const

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: scrolled ? '#FFFFFF' : 'transparent',
        borderBottom: scrolled ? `1px solid ${alpha('#11182d', 0.08)}` : '1px solid transparent',
        boxShadow: scrolled ? '0 8px 26px rgba(17, 24, 45, 0.06)' : 'none',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: 'auto',
          maxWidth: 1360,
          minHeight: { xs: 72, lg: 92 },
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
            fontSize: { xs: '1.1rem', md: '1.28rem' },
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
              width: { xs: 40, lg: 46 },
              height: { xs: 40, lg: 46 },
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          {brandIdentity.name}
        </Box>

        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          justifyContent="center"
          sx={{ display: { xs: 'none', lg: 'flex' }, flex: 1 }}
        >
          <Box component={RouterLink} to={links[0]?.to ?? '/'} sx={navLinkSx}>
            Platform
          </Box>

          {dropdownLinks.map((item) => (
            <Button
              key={item.label}
              component={RouterLink}
              to={item.to}
              endIcon={<FiChevronDown size={15} />}
              sx={{
                ...navLinkSx,
                minHeight: 'auto',
                minWidth: 'auto',
                textTransform: 'none',
                '& .MuiButton-endIcon': { ml: 0.35 },
              }}
            >
              {item.label}
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
              minWidth: 116,
              minHeight: 50,
              px: 2.6,
              borderRadius: '14px',
              bgcolor: '#ff751a',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#f46b10',
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
                bgcolor: scrolled ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
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
            border: `1px solid ${scrolled ? alpha('#11182d', 0.1) : alpha('#FFFFFF', 0.14)}`,
            bgcolor: scrolled ? '#FFFFFF' : alpha('#11183F', 0.96),
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
                    bgcolor: scrolled ? alpha('#11182d', 0.05) : alpha('#FFFFFF', 0.08),
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
                bgcolor: '#ff751a',
                color: '#FFFFFF',
                fontWeight: 800,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#f46b10',
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
