import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import { FiArrowRight, FiClock, FiMapPin } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import PublicFooter from '../components/public/PublicFooter'
import PublicNavbar from '../components/public/PublicNavbar'

const MotionBox = motion(Box)

const lightDottedBackground = `
  radial-gradient(circle, rgba(120, 103, 243, 0.13) 1px, transparent 1.2px),
  linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)
`

const darkDottedBackground = `
  radial-gradient(circle, rgba(120, 103, 243, 0.34) 1px, transparent 1.2px),
  linear-gradient(120deg, #0f172a 0%, #11183f 54%, #17154a 100%)
`

const courierPartners = [
  {
    name: 'BlueDart',
    type: 'Premium Express',
    color: '#0648a8',
    logo: '/logo/integrations/bluedart.png',
    description:
      "India's most reliable express delivery service with unmatched reach for time-sensitive shipments.",
    reach: '35,000+ pincodes',
  },
  {
    name: 'Delhivery',
    type: 'Pan-India Logistics',
    color: '#ef3340',
    logo: '/logo/integrations/delhivery.png',
    description:
      'Full-stack logistics with express, freight, and cross-border services for businesses of all sizes.',
    reach: '18,500+ pincodes',
  },
  {
    name: 'DTDC',
    type: 'Domestic & International',
    color: '#ed1c24',
    logo: '/logo/integrations/dtdc.png',
    description:
      "One of India's oldest courier networks with deep reach into tier-2 and tier-3 cities.",
    reach: '14,000+ pincodes',
  },
  {
    name: 'Ecom Express',
    type: 'E-commerce Focused',
    color: '#00a651',
    logo: '/logo/integrations/ecomexpress.webp',
    description:
      'Purpose-built for e-commerce with strong COD handling and reverse logistics capabilities.',
    reach: '27,000+ pincodes',
  },
  {
    name: 'XpressBees',
    type: 'Last-Mile Delivery',
    color: '#ffd21f',
    logo: '/logo/integrations/xpressbees.png',
    description:
      'Technology-driven last-mile delivery with fast turnaround and competitive pricing.',
    reach: '20,000+ pincodes',
  },
  {
    name: 'Ekart',
    type: 'Marketplace Logistics',
    color: '#2874f0',
    logo: '/logo/integrations/ekart.png',
    description:
      "Flipkart's logistics arm now available for all sellers with deep marketplace expertise.",
    reach: '15,000+ pincodes',
  },
  {
    name: 'Aramex',
    type: 'International Shipping',
    color: '#ef3124',
    logo: '/logo/integrations/aramex.webp',
    description:
      'Global logistics giant for international shipments with customs expertise and door-to-door delivery.',
    reach: '220+ countries',
  },
  {
    name: 'Shadowfax',
    type: 'Hyperlocal & Express',
    color: '#5b2a90',
    logo: '/logo/integrations/shadowfax.png',
    description:
      'Same-day and next-day delivery specialists with a strong hyperlocal fleet network.',
    reach: '12,000+ pincodes',
  },
]

const stats = [
  { value: '25+', label: 'Courier Partners' },
  { value: '29,000+', label: 'Pincodes Covered' },
  { value: '220+', label: 'Countries Served' },
  { value: '99.2%', label: 'On-Time Delivery' },
]

const routingCards = [
  {
    title: 'Speed',
    description:
      "We analyze each courier's historical delivery times for the specific origin-destination pair to pick the fastest option.",
    icon: <FiClock />,
  },
  {
    title: 'Cost',
    description:
      'Real-time rate comparison across all partners ensures you always get the most competitive shipping price.',
    icon: <FaIndianRupeeSign />,
  },
  {
    title: 'Serviceability',
    description:
      'Pincode-level checks ensure the selected courier actually serves both pickup and delivery locations.',
    icon: <FiMapPin />,
  },
]

function HighlightText({ children, color = '#f59e0b' }: { children: ReactNode; color?: string }) {
  return <Box component="span" sx={{ color }}>{children}</Box>
}

function PillBadge({ label, tone = 'orange' }: { label: string; tone?: 'purple' | 'orange' }) {
  const color = tone === 'orange' ? '#f97316' : '#6c5ce7'

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 36,
        px: 1.25,
        borderRadius: '999px',
        bgcolor: alpha(color, 0.1),
        color,
        border: `1px solid ${alpha(color, 0.08)}`,
        fontWeight: 800,
        fontSize: '0.93rem',
        '& .MuiChip-label': { px: 0.8 },
        '&::before': {
          content: '""',
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: color,
          ml: 0.5,
        },
      }}
    />
  )
}

function PrimaryButton({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant="contained"
      endIcon={<FiArrowRight size={18} />}
      sx={{
        minHeight: 62,
        px: { xs: 3, sm: 4.2 },
        borderRadius: '12px',
        bgcolor: '#ff6b12',
        color: '#fff',
        fontSize: '1.02rem',
        fontWeight: 900,
        textTransform: 'none',
        width: { xs: '100%', sm: 'auto' },
        boxShadow: '0 14px 30px rgba(249, 115, 22, 0.28)',
        '&:hover': {
          bgcolor: '#ea580c',
          boxShadow: '0 14px 30px rgba(249, 115, 22, 0.28)',
        },
      }}
    >
      {children}
    </Button>
  )
}

function OutlineButton({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant="outlined"
      sx={{
        minHeight: 62,
        px: { xs: 3, sm: 4.2 },
        borderRadius: '12px',
        color: '#11182d',
        borderColor: alpha('#11182d', 0.1),
        bgcolor: '#fff',
        fontSize: '1.02rem',
        fontWeight: 900,
        textTransform: 'none',
        width: { xs: '100%', sm: 'auto' },
        '&:hover': {
          borderColor: alpha('#7867f3', 0.32),
          bgcolor: alpha('#7867f3', 0.04),
        },
      }}
    >
      {children}
    </Button>
  )
}

function DarkOutlineButton({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant="outlined"
      sx={{
        minHeight: 66,
        px: { xs: 3, sm: 4.7 },
        borderRadius: '12px',
        color: '#fff',
        borderColor: alpha('#fff', 0.16),
        bgcolor: 'transparent',
        fontSize: '1.02rem',
        fontWeight: 900,
        textTransform: 'none',
        width: { xs: '100%', sm: 'auto' },
        '&:hover': {
          borderColor: alpha('#fff', 0.34),
          bgcolor: alpha('#fff', 0.06),
        },
      }}
    >
      {children}
    </Button>
  )
}

function CourierCard({
  courier,
  index,
}: {
  courier: (typeof courierPartners)[number]
  index: number
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.42, delay: index * 0.035 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 285,
        p: { xs: 3, md: 3.8 },
        borderRadius: '16px',
        bgcolor: '#fff',
        border: `1px solid ${alpha('#0f172a', 0.08)}`,
        boxShadow: '0 22px 48px rgba(15, 23, 42, 0.03)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          bgcolor: courier.color,
        },
      }}
    >
      <Stack spacing={2.45} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '10px',
              bgcolor: '#fff',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={courier.logo}
              alt=""
              sx={{ width: 40, height: 40, objectFit: 'contain' }}
            />
          </Box>
          <Box>
            <Typography sx={{ color: '#06122d', fontSize: '1.2rem', fontWeight: 900 }}>
              {courier.name}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.86rem', fontWeight: 600 }}>
              {courier.type}
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ color: '#64748b', fontSize: '1.02rem', lineHeight: 1.5 }}>
          {courier.description}
        </Typography>

        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 'auto' }}>
          <FiMapPin color="#6c5ce7" size={17} />
          <Typography sx={{ color: '#5b4cf0', fontSize: '0.88rem', fontWeight: 800 }}>
            {courier.reach}
          </Typography>
        </Stack>
      </Stack>
    </MotionBox>
  )
}

export default function CourierPartnersPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <Box sx={{ bgcolor: '#f8fafc', color: '#0f172a', overflowX: 'hidden' }}>
      <PublicNavbar solid primaryLabel="Go to Dashboard" primaryTo="/dashboard" />

      <Box
        component="main"
        sx={{
          bgcolor: '#fff',
          pt: { xs: 15, md: 20, lg: 23 },
          pb: { xs: 11, md: 19, lg: 24 },
          backgroundImage: lightDottedBackground,
          backgroundSize: '28px 28px, auto',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <MotionBox
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Stack alignItems="center" textAlign="center" spacing={3}>
              <PillBadge label="Courier Partners" />
              <Typography
                variant="h1"
                sx={{
                  color: '#0f172a',
                  fontSize: { xs: '2.45rem', sm: '3.2rem', md: '4.1rem', lg: '4.35rem' },
                  lineHeight: { xs: 1.08, md: 0.99 },
                  fontWeight: 950,
                  letterSpacing: 0,
                  maxWidth: { xs: 340, sm: 800, md: 1100 },
                  overflowWrap: 'break-word',
                }}
              >
                India's Most Trusted{' '}
                <HighlightText>
                  Courier
                  <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
                    {' '}
                    Network
                  </Box>
                </HighlightText>
              </Typography>
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: { xs: '1rem', md: '1.34rem' },
                  lineHeight: 1.45,
                  maxWidth: { xs: 340, sm: 760, md: 940 },
                }}
              >
                Access 25+ top courier partners through a single integration. Smart routing ensures
                every package goes through the fastest, cheapest option available.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.8}
                justifyContent="center"
                sx={{ pt: 2.1, width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: 340, sm: 'none' } }}
              >
                <PrimaryButton to="/signup">Start Shipping</PrimaryButton>
                <OutlineButton to="/resources/rate-calculator">Compare Rates</OutlineButton>
              </Stack>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: '#fff', pt: { xs: 8, md: 9 }, pb: { xs: 10, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <Stack alignItems="center" textAlign="center" spacing={2.2}>
            <PillBadge label="Our Network" tone="purple" />
            <Typography
              variant="h2"
              sx={{
                color: '#0f172a',
                fontSize: { xs: '2.15rem', sm: '2.8rem', md: '3.45rem' },
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: 0,
              }}
            >
              One integration, <HighlightText color="#7867f3">25+ couriers</HighlightText>
            </Typography>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '1.02rem', md: '1.24rem' },
                lineHeight: 1.45,
                maxWidth: 800,
              }}
            >
              Every partner is pre-negotiated with discounted rates so you save on every shipment
              automatically.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: { xs: 3, md: 4 },
              mt: { xs: 7, md: 9 },
            }}
          >
            {courierPartners.map((courier, index) => (
              <CourierCard key={courier.name} courier={courier} index={index} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{ bgcolor: '#f8fafc', pt: { xs: 9, md: 10.5 }, pb: { xs: 9, md: 12 } }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <Stack alignItems="center" textAlign="center" spacing={2.1}>
            <Typography
              variant="h2"
              sx={{
                color: '#0f172a',
                fontSize: { xs: '2rem', sm: '2.55rem', md: '3rem' },
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: 0,
              }}
            >
              Unmatched <HighlightText color="#7867f3">coverage</HighlightText>
            </Typography>
            <Typography
              sx={{ color: '#64748b', fontSize: { xs: '1rem', md: '1.18rem' }, maxWidth: 700 }}
            >
              From metros to remote villages &mdash; we've got India covered, and the world too.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 4, md: 6 },
              mt: { xs: 6, md: 7.5 },
            }}
          >
            {stats.map((stat) => (
              <Stack key={stat.label} alignItems="center" textAlign="center" spacing={0.4}>
                <Typography
                  sx={{
                    color: '#7867f3',
                    fontSize: { xs: '2.05rem', md: '3rem' },
                    fontWeight: 950,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  {stat.label}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: '#fff', pt: { xs: 10, md: 12 }, pb: { xs: 10, md: 13 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <Stack alignItems="center" textAlign="center" spacing={2.2}>
            <PillBadge label="Smart Routing" />
            <Typography
              variant="h2"
              sx={{
                color: '#0f172a',
                fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.35rem' },
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: 0,
                maxWidth: 1050,
              }}
            >
              We pick the <HighlightText>best courier</HighlightText> for every order
            </Typography>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '1.02rem', md: '1.24rem' },
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              Our AI-powered recommendation engine evaluates every shipment on three key
              dimensions.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4.5 },
              mt: { xs: 6.5, md: 8.5 },
            }}
          >
            {routingCards.map((card, index) => (
              <MotionBox
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                sx={{
                  minHeight: 306,
                  p: { xs: 3.3, md: 4.5 },
                  borderRadius: '16px',
                  bgcolor: '#fff',
                  border: `1px solid ${alpha('#0f172a', 0.08)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '18px',
                    bgcolor: alpha('#f97316', 0.1),
                    color: '#f97316',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 28,
                    mb: 3,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography sx={{ color: '#06122d', fontSize: '1.35rem', fontWeight: 900, mb: 1.5 }}>
                  {card.title}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.55 }}>
                  {card.description}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          bgcolor: '#0f172a',
          color: '#fff',
          backgroundImage: darkDottedBackground,
          backgroundSize: '35px 35px, auto',
          py: { xs: 9, md: 12.5 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Stack alignItems="center" textAlign="center" spacing={3}>
            <Typography
              variant="h2"
              sx={{
                color: '#fff',
                fontSize: { xs: '2.35rem', md: '4.1rem' },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: 0,
                maxWidth: 850,
              }}
            >
              Ship with India's best courier network
            </Typography>
            <Typography
              sx={{
                color: alpha('#fff', 0.66),
                fontSize: { xs: '1.08rem', md: '1.35rem' },
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              One integration, 25+ couriers, zero hassle. Start shipping smarter today.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.8}
              justifyContent="center"
              sx={{ pt: 2, width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: 340, sm: 'none' } }}
            >
              <PrimaryButton to="/signup">Start Shipping Free</PrimaryButton>
              <DarkOutlineButton to="/integrations/sales-channels">View Sales Channels</DarkOutlineButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  )
}
