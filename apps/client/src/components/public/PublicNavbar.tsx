import { Box, Button, IconButton, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import { FiArrowUpRight, FiMenu, FiPhone, FiX } from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import BrandTopBar from '../brand/BrandTopBar'
import { brand, brandEffects, brandIdentity } from '../../theme/brand'

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

const defaultLinks: NavItem[] = [
  { label: 'Tracking', to: '/tracking' },
  { label: 'Rate Calculator', to: '/rate-calculator' },
  { label: 'Weight Calculator', to: '/weight-calculator' },
]

export default function PublicNavbar({
  links = defaultLinks,
  primaryLabel = 'Sign Up',
  primaryTo = '/signin',
  secondaryLabel = 'Login',
  secondaryTo = '/login',
}: PublicNavbarProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const actionButtonSx = {
    borderRadius: 999,
    whiteSpace: 'nowrap',
    fontWeight: 800,
    fontSize: { xs: '0.66rem', sm: '0.8rem' },
    letterSpacing: '-0.01em',
    minHeight: { xs: 38, sm: 42 },
  } as const

  return (
    <BrandTopBar
      sx={{
        px: { xs: 0.6, sm: 2.2, lg: 3 },
        py: { xs: 0.45, sm: 0.85 },
        position: { xs: 'relative', md: 'sticky' },
        top: { xs: 'auto', md: 0 },
      }}
      innerSx={{
        background: alpha('#FFFFFF', 0.92),
        border: brandEffects.border,
        boxShadow: '0 14px 34px rgba(68, 92, 138, 0.15)',
        px: { xs: 1.1, sm: 2.05, lg: 2.5 },
        py: { xs: 0.55, sm: 0.7 },
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={{ xs: 0.7, sm: 1.8, lg: 2 }}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', minWidth: 0 }}
        >
          <RouterLink to="/" aria-label={`${brandIdentity.name} home`}>
            <BrandLogo sx={{ width: { xs: 58, sm: 96, md: 112 } }} />
          </RouterLink>

          <Stack
            direction="row"
            spacing={{ xs: 0.05, sm: 0.35, lg: 0.8 }}
            alignItems="center"
            justifyContent="center"
            sx={{ flex: 1, minWidth: 0, display: { xs: 'none', md: 'flex' } }}
          >
            {links.map((item) => {
              const active = location.pathname === item.to

              return (
                <Box
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    px: { xs: 0.18, sm: 0.85, lg: 1.65 },
                    py: { xs: 0.24, sm: 0.55, lg: 0.7 },
                    borderRadius: 999,
                    color: active ? brand.accent : brand.inkSoft,
                    bgcolor: active ? alpha(brand.accent, 0.12) : 'transparent',
                    fontSize: { xs: '0.5rem', sm: '0.7rem', md: '0.86rem' },
                    fontWeight: active ? 800 : 700,
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: brand.ink,
                      bgcolor: alpha(brand.ink, 0.06),
                    },
                  }}
                >
                  {item.label}
                </Box>
              )
            })}
          </Stack>

          <Stack
            direction="row"
            spacing={{ xs: 0.45, sm: 0.8 }}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ flexShrink: 0, ml: { xs: 'auto', md: 0 }, flexWrap: 'nowrap' }}
          >
            <Button
              component={RouterLink}
              to={primaryTo}
              variant="contained"
              endIcon={<FiArrowUpRight size={18} />}
              sx={{
                ...actionButtonSx,
                minWidth: { xs: 78, sm: 154 },
                px: { xs: 0.95, sm: 2.15 },
                color: '#FFFFFF',
                boxShadow: {
                  xs: '0 12px 24px rgba(255, 122, 21, 0.22)',
                  sm: '0 18px 36px rgba(255, 122, 21, 0.28)',
                },
              }}
            >
              {primaryLabel}
            </Button>
            <Button
              component={RouterLink}
              to={secondaryTo}
              variant="text"
              sx={{
                ...actionButtonSx,
                display: 'inline-flex',
                minWidth: { xs: 68, sm: 132 },
                px: { xs: 0.8, sm: 1.15, md: 1.3 },
                color: brand.ink,
                '&:hover': {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
            >
              {secondaryLabel}
            </Button>
            <Button
              component="a"
              href={`tel:${brandIdentity.supportPhone}`}
              variant="text"
              startIcon={<FiPhone size={15} />}
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                color: brand.ink,
                fontWeight: 800,
                minHeight: 42,
                '&:hover': {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
            >
              {brandIdentity.supportPhone}
            </Button>
            <IconButton
              aria-label={mobileMenuOpen ? 'Close public menu' : 'Open public menu'}
              onClick={toggleMobileMenu}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: brand.ink,
                border: `1px solid ${alpha(brand.ink, 0.1)}`,
                bgcolor: alpha('#FFFFFF', 0.86),
                width: 42,
                height: 42,
                flexShrink: 0,
              }}
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </IconButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: { xs: mobileMenuOpen ? 'block' : 'none', md: 'none' },
            width: '100%',
            pt: 1.2,
            borderTop: `1px solid ${alpha(brand.ink, 0.08)}`,
          }}
        >
          <Stack spacing={1}>
            {links.map((item) => {
              const active = location.pathname === item.to

              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  onClick={closeMobileMenu}
                  variant="text"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 1.2,
                    py: 1.05,
                    borderRadius: 2,
                    color: active ? brand.accent : brand.ink,
                    bgcolor: active ? alpha(brand.accent, 0.08) : 'transparent',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    '&:hover': {
                      bgcolor: alpha(brand.ink, 0.05),
                    },
                  }}
                >
                  {item.label}
                </Button>
              )
            })}

            <Stack direction="row" spacing={1} sx={{ pt: 0.6 }}>
              <Button
                component={RouterLink}
                to={secondaryTo}
                onClick={closeMobileMenu}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: alpha(brand.ink, 0.12),
                  color: brand.ink,
                  fontWeight: 800,
                  minHeight: 44,
                }}
              >
                {secondaryLabel}
              </Button>
              <Button
                component={RouterLink}
                to={primaryTo}
                onClick={closeMobileMenu}
                variant="contained"
                fullWidth
                endIcon={<FiArrowUpRight size={18} />}
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  minHeight: 44,
                }}
              >
                {primaryLabel}
              </Button>
            </Stack>

            <Button
              component="a"
              href={`tel:${brandIdentity.supportPhone}`}
              variant="outlined"
              fullWidth
              startIcon={<FiPhone size={15} />}
              sx={{
                borderColor: alpha(brand.ink, 0.12),
                color: brand.ink,
                fontWeight: 800,
                minHeight: 44,
              }}
            >
              {brandIdentity.supportPhone}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </BrandTopBar>
  )
}
