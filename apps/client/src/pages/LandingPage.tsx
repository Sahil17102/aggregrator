import { alpha, Box, Button, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import PublicNavbar from '../components/public/PublicNavbar'
import { brand, brandIdentity } from '../theme/brand'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
}

const partnerLabels = [
  'Delhivery',
  'Blue Dart',
  'Shadowfax',
  'Xpressbees',
  'Ekart',
  'Amazon Shipping',
  'DTDC',
  'Ecom Express',
]

export default function LandingPage() {
  return (
    <Box
      className="site-shell"
      sx={{
        minHeight: '100vh',
        bgcolor: '#f6f7fb',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 900, md: 1080 },
          overflow: 'hidden',
          color: '#FFFFFF',
          backgroundColor: '#151943',
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(115deg, #121638 0%, #171B46 54%, #1D2053 100%)
          `,
          backgroundSize: '32px 32px, 100% 100%',
        }}
      >
        <PublicNavbar primaryLabel="Sign Up" primaryTo="/signin" />

        <Container
          maxWidth={false}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: { xs: '100%', lg: 1120 },
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 0 },
            pt: { xs: 32.5, md: 46.5 },
          }}
        >
          <Box
            component={motion.section}
            {...fadeUp}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '530px minmax(360px, 474px)' },
              alignItems: 'center',
              gap: { xs: 5, lg: 10 },
            }}
          >
            <Stack
              spacing={{ xs: 2.4, md: 2.8 }}
              sx={{
                maxWidth: { xs: 640, lg: 620 },
                mx: { xs: 'auto', lg: 0 },
                textAlign: { xs: 'center', lg: 'left' },
                alignItems: { xs: 'center', lg: 'flex-start' },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  m: 0,
                  color: 'rgba(255,255,255,0.68)',
                  fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
                  fontSize: { xs: '2.45rem', sm: '4.2rem', lg: '4.1rem' },
                  fontWeight: 800,
                  lineHeight: { xs: 0.98, md: 0.98 },
                  letterSpacing: 0,
                }}
              >
                Ship Smarter.
                <Box component="span" sx={{ display: 'block' }}>
                  Ship Faster.
                </Box>
                <Box component="span" sx={{ display: 'block' }}>
                  Ship{' '}
                  <Box component="span" sx={{ color: '#704626' }}>
                    Cheaper.
                  </Box>
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 560,
                  color: 'rgba(255,255,255,0.46)',
                  fontSize: { xs: '1rem', md: '1.18rem' },
                  lineHeight: 1.62,
                  fontWeight: 500,
                }}
              >
                Connect multiple couriers, track orders in real-time, and cut shipping costs -- all
                from one powerful dashboard.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  pt: { xs: 1.2, md: 0.6 },
                }}
              >
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="contained"
                  endIcon={<FiArrowRight size={18} />}
                  sx={{
                    minWidth: { xs: '100%', sm: 184 },
                    minHeight: 49,
                    borderRadius: '12px',
                    bgcolor: brand.accent,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#f47b14',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  component={RouterLink}
                  to="/tracking"
                  variant="outlined"
                  startIcon={<FiSearch size={18} />}
                  sx={{
                    minWidth: { xs: '100%', sm: 180 },
                    minHeight: 49,
                    borderRadius: '12px',
                    borderColor: alpha('#FFFFFF', 0.12),
                    color: 'rgba(255,255,255,0.68)',
                    bgcolor: 'transparent',
                    fontWeight: 800,
                    '&:hover': {
                      borderColor: alpha('#FFFFFF', 0.22),
                      bgcolor: alpha('#FFFFFF', 0.04),
                    },
                  }}
                >
                  Track Shipment
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: { xs: 'none', lg: 'block' },
                height: 392,
                borderRadius: '24px',
                border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
                backgroundColor: alpha('#FFFFFF', 0.01),
              }}
            />
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          bgcolor: '#f6f7fb',
          py: { xs: 5, md: 7 },
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(8, minmax(0, 1fr))',
              },
              gap: 2,
              mt: { xs: 4, md: 10 },
            }}
          >
            {partnerLabels.map((label) => (
              <Box
                key={label}
                sx={{
                  minHeight: 78,
                  borderRadius: '10px',
                  border: `1px solid ${alpha('#18204c', 0.08)}`,
                  bgcolor: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  px: 1.4,
                  color: alpha('#18204c', 0.58),
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textAlign: 'center',
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          <Stack
            spacing={1.4}
            sx={{
              maxWidth: 760,
              mx: 'auto',
              mt: { xs: 6, md: 8 },
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                color: brand.accent,
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              {brandIdentity.name}
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: '#151943',
                fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              One shipping dashboard for rates, tracking, and courier operations.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
