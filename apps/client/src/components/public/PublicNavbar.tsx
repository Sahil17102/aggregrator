import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FiArrowUpRight, FiMenu, FiPhone, FiX } from 'react-icons/fi'
import { useState } from 'react'
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
}

const defaultLinks: NavItem[] = [
  { label: 'Tracking', to: '/tracking' },
  { label: 'Rate Calculator', to: '/rate-calculator' },
  { label: 'Weight Calculator', to: '/weight-calculator' },
]

export default function PublicNavbar({
  links = defaultLinks,
  primaryLabel = 'Start Shipping',
  primaryTo = '/signup',
}: PublicNavbarProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 'min(84vw, 340px)',
            maxWidth: '84vw',
            background: '#FFFFFF',
            color: brand.ink,
            borderLeft: `1px solid ${alpha(brand.ink, 0.08)}`,
          },
        }}
      >
        <Stack sx={{ height: '100%', px: 2.2, py: 2.4 }} spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <RouterLink to="/" aria-label={`${brandIdentity.name} home`} onClick={closeMobileMenu}>
              <BrandLogo compact sx={{ width: 122 }} />
            </RouterLink>
            <IconButton aria-label="Close menu" onClick={closeMobileMenu} sx={{ color: brand.ink }}>
              <FiX size={20} />
            </IconButton>
          </Stack>

          <Typography sx={{ color: brand.inkSoft, fontSize: '0.9rem', lineHeight: 1.6 }}>
            Quick access to the public shipping tools and portal.
          </Typography>

          <Stack spacing={0.9}>
            {links.map((item) => {
              const active = location.pathname === item.to

              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  onClick={closeMobileMenu}
                  variant="text"
                  sx={{
                    justifyContent: 'flex-start',
                    px: 1.2,
                    py: 1,
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
          </Stack>

          <Stack spacing={1} sx={{ mt: 'auto' }}>
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
              }}
            >
              {brandIdentity.supportPhone}
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              onClick={closeMobileMenu}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: alpha(brand.ink, 0.12),
                color: brand.ink,
                fontWeight: 800,
              }}
            >
              Sign In
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
              }}
            >
              {primaryLabel}
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <BrandTopBar
        sx={{ px: { xs: 0.6, sm: 2.2, lg: 3 }, py: { xs: 0.45, sm: 0.85 } }}
        innerSx={{
          background: alpha('#FFFFFF', 0.92),
          border: brandEffects.border,
          boxShadow: '0 14px 34px rgba(68, 92, 138, 0.15)',
          px: { xs: 1.1, sm: 2.05, lg: 2.5 },
          py: { xs: 0.55, sm: 0.7 },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.85, sm: 1.8, lg: 2 }}
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

          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexShrink: 0 }}>
            <IconButton
              aria-label="Open public menu"
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: brand.ink,
                border: `1px solid ${alpha(brand.ink, 0.1)}`,
                bgcolor: alpha('#FFFFFF', 0.86),
              }}
            >
              <FiMenu size={18} />
            </IconButton>
            <Button
              component="a"
              href={`tel:${brandIdentity.supportPhone}`}
              variant="text"
              startIcon={<FiPhone size={15} />}
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                color: brand.ink,
                fontWeight: 800,
                '&:hover': {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
            >
              {brandIdentity.supportPhone}
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: brand.ink,
                fontWeight: 800,
                px: { sm: 1.1, md: 1.3 },
                '&:hover': {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
            >
              Sign In
            </Button>
            <Button
              component={RouterLink}
              to={primaryTo}
              variant="contained"
              endIcon={<FiArrowUpRight size={18} />}
              sx={{
                minWidth: { xs: 88, sm: 154 },
                px: { xs: 1, sm: 2.15 },
                py: { xs: 0.55, sm: 0.75 },
                borderRadius: 999,
                fontWeight: 800,
                fontSize: { xs: '0.62rem', sm: '0.8rem' },
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                color: '#FFFFFF',
                boxShadow: { xs: '0 12px 24px rgba(255, 122, 21, 0.22)', sm: '0 18px 36px rgba(255, 122, 21, 0.28)' },
              }}
            >
              {primaryLabel}
            </Button>
          </Stack>
        </Stack>
      </BrandTopBar>
    </>
  )
}
