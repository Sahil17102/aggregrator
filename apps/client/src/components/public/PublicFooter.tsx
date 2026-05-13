import { Box, Container, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import { brand, brandIdentity } from '../../theme/brand'

const platformLinks = [
  { label: 'Portal Login', to: '/login' },
  { label: 'Tracking', to: '/tracking' },
  { label: 'Rate Calculator', to: '/rate-calculator' },
  { label: 'Weight Calculator', to: '/weight-calculator' },
]

const companyLinks = [
  { label: 'Portal Login', to: '/login' },
  { label: 'Track Shipment', to: '/tracking' },
]

const footerText = '#FFFFFF'
const footerMuted = alpha('#FFFFFF', 0.78)
const footerSoft = alpha('#FFFFFF', 0.66)

export default function PublicFooter() {
  return (
    <Box component="footer" sx={{ mt: 10, pb: 4, px: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ px: 0 }}>
        <Box
          sx={{
            borderRadius: { xs: '32px', md: '42px' },
            background:
              'linear-gradient(145deg, #07143D 0%, #0D2A63 48%, #154585 100%)',
            border: `1px solid ${alpha('#FFFFFF', 0.16)}`,
            boxShadow: '0 24px 60px rgba(7, 20, 61, 0.28)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr 0.8fr 1fr' },
              gap: { xs: 3, lg: 4 },
              px: { xs: 2.4, md: 3.2, lg: 4 },
              py: { xs: 3, md: 4 },
            }}
          >
            <Stack spacing={1.5}>
              <RouterLink to="/" aria-label={`${brandIdentity.name} home`}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    bgcolor: alpha('#FFFFFF', 0.96),
                    borderRadius: 2,
                    px: 1.2,
                    py: 0.8,
                    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <BrandLogo sx={{ width: { xs: 148, sm: 166 } }} />
                </Box>
              </RouterLink>
              <Typography sx={{ color: footerMuted, lineHeight: 1.75, maxWidth: 360 }}>
                {brandIdentity.tagline} Premium shipping infrastructure for teams that want better
                courier visibility, cleaner rates, and modern delivery experiences.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { href: 'https://www.linkedin.com/', icon: <FaLinkedinIn size={15} /> },
                  { href: 'https://www.instagram.com/', icon: <FaInstagram size={15} /> },
                  { href: 'https://www.facebook.com/', icon: <FaFacebookF size={15} /> },
                ].map((item) => (
                  <IconButton
                    key={item.href}
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      color: footerText,
                      bgcolor: alpha('#FFFFFF', 0.12),
                      border: `1px solid ${alpha('#FFFFFF', 0.12)}`,
                      '&:hover': {
                        bgcolor: alpha(brand.accent, 0.2),
                        color: footerText,
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>

            <Stack spacing={1.3}>
              <Typography sx={{ fontWeight: 800, color: footerText }}>Platform</Typography>
              {platformLinks.map((item) => (
                <Box
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    color: footerMuted,
                    fontWeight: 600,
                    '&:hover': {
                      color: footerText,
                    },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>

            <Stack spacing={1.3}>
              <Typography sx={{ fontWeight: 800, color: footerText }}>Company</Typography>
              {companyLinks.map((item) => (
                <Box
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    color: footerMuted,
                    fontWeight: 600,
                    '&:hover': {
                      color: footerText,
                    },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>

            <Stack spacing={1.4}>
              <Typography sx={{ fontWeight: 800, color: footerText }}>Contact</Typography>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Box sx={{ color: brand.accent, mt: 0.15, lineHeight: 0 }}>
                  <FiPhone size={18} />
                </Box>
                <Box component="a" href={`tel:${brandIdentity.supportPhone}`} sx={{ color: footerMuted }}>
                  {brandIdentity.supportPhone}
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Box sx={{ color: brand.accent, mt: 0.15, lineHeight: 0 }}>
                  <FiMail size={18} />
                </Box>
                <Box component="a" href={`mailto:${brandIdentity.supportEmail}`} sx={{ color: footerMuted }}>
                  {brandIdentity.supportEmail}
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Box sx={{ color: brand.accent, mt: 0.15, lineHeight: 0 }}>
                  <FiMapPin size={18} />
                </Box>
                <Typography sx={{ color: footerMuted }}>{brandIdentity.supportAddress}</Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              px: { xs: 2.4, md: 4 },
              py: 1.5,
              borderTop: `1px solid ${alpha('#FFFFFF', 0.12)}`,
              bgcolor: alpha('#031033', 0.32),
            }}
          >
            <Typography sx={{ color: footerSoft, fontSize: '0.9rem' }}>
              © 2026 {brandIdentity.name}. Built for dependable logistics operations across India.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
