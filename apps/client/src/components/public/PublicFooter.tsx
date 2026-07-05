import { Box, Container, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { brandIdentity } from '../../theme/brand'

const productLinks = [
  { label: 'Platform', to: '/platform' },
  { label: 'Rate Calculator', to: '/resources/rate-calculator' },
  { label: 'Weight Estimator', to: '/resources/weight-estimator' },
  { label: 'Track Shipment', to: '/track' },
  { label: 'Integrations', to: '/integrations/sales-channels' },
]

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Partner With Us', to: '/partners' },
]

const legalLinks = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Refund Policy', to: '/refund' },
  { label: 'Cookie Policy', to: '/cookies' },
]

function FooterLink({ label, to }: { label: string; to: string }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        color: alpha('#fff', 0.58),
        fontSize: '0.88rem',
        fontWeight: 600,
        textDecoration: 'none',
        '&:hover': { color: '#fff' },
      }}
    >
      {label}
    </Box>
  )
}

export default function PublicFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0f172a',
        color: '#fff',
        backgroundImage: 'linear-gradient(120deg, #0f172a 0%, #11183f 54%, #17154a 100%)',
        pt: { xs: 8, md: 10 },
        pb: 5,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.45fr repeat(3, 1fr)' }, gap: { xs: 5, md: 6 } }}>
          <Stack spacing={2.2}>
            <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
              <Box component="img" src={brandIdentity.logoSrc} alt={brandIdentity.name} sx={{ width: 38, height: 38, borderRadius: '50%' }} />
              {brandIdentity.name}
            </Box>
            <Typography sx={{ color: alpha('#fff', 0.58), lineHeight: 1.7, maxWidth: 360, fontSize: '0.95rem' }}>
              {brandIdentity.tagline}
            </Typography>
            <Stack spacing={1.4}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <FiMail color="#6c5ce7" />
                <Box component="a" href={`mailto:${brandIdentity.supportEmail}`} sx={{ color: alpha('#fff', 0.62), fontWeight: 600 }}>
                  {brandIdentity.supportEmail}
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <FiPhone color="#6c5ce7" />
                <Box component="a" href="tel:+919403891046" sx={{ color: alpha('#fff', 0.62), fontWeight: 600 }}>
                  {brandIdentity.supportPhone}
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <FiMapPin color="#6c5ce7" style={{ marginTop: 3, flexShrink: 0 }} />
                <Box
                  component="a"
                  href="https://maps.google.com/?q=Telipara+Bilaspur+Chhattisgarh"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: alpha('#fff', 0.62), fontWeight: 600, maxWidth: 300 }}
                >
                  {brandIdentity.supportAddress}
                </Box>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1}>
              {[
                { href: '#', icon: <FaXTwitter size={14} /> },
                { href: '#', icon: <FaLinkedinIn size={14} /> },
                { href: '#', icon: <FaInstagram size={14} /> },
                { href: '#', icon: <FaYoutube size={14} /> },
                { href: '#', icon: <FaFacebookF size={14} /> },
              ].map((item, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={item.href}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    color: alpha('#fff', 0.62),
                    bgcolor: alpha('#fff', 0.08),
                    '&:hover': { bgcolor: alpha('#fff', 0.14), color: '#fff' },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>

          {[
            ['Product', productLinks],
            ['Company', companyLinks],
            ['Legal', legalLinks],
          ].map(([heading, links]) => (
            <Stack key={heading as string} spacing={1.35}>
              <Typography sx={{ color: '#fff', fontWeight: 800, mb: 0.6 }}>{heading as string}</Typography>
              {(links as typeof productLinks).map((item) => (
                <FooterLink key={item.label} {...item} />
              ))}
            </Stack>
          ))}
        </Box>

        <Box sx={{ borderTop: `1px solid ${alpha('#fff', 0.08)}`, mt: 7, pt: 4, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ color: alpha('#fff', 0.45), fontSize: '0.82rem' }}>
            © 2026 {brandIdentity.name}. All rights reserved.
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.45), fontSize: '0.82rem' }}>Made with care in India</Typography>
        </Box>
      </Container>
    </Box>
  )
}
