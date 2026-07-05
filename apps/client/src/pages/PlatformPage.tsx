import { alpha, Box, Button, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { type ReactNode, useEffect } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiBox,
  FiCheck,
  FiGlobe,
  FiGrid,
  FiHeadphones,
  FiMapPin,
  FiMessageCircle,
  FiShield,
  FiTruck,
} from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import PublicFooter from '../components/public/PublicFooter'
import PublicNavbar from '../components/public/PublicNavbar'
import { brandIdentity } from '../theme/brand'

const navy = '#0b1028'
const navy2 = '#19154d'
const ink = '#11182d'
const muted = '#667795'
const border = '#e6ebf3'
const page = '#f8fafc'
const purple = '#7867f3'
const orange = '#ff6b16'
const amber = '#f5a313'
const green = '#10b981'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.45 },
}

const stats = [
  { value: '25+', label: 'Courier Partners' },
  { value: '29,000+', label: 'Pincodes Covered' },
  { value: '99.5%', label: 'Platform Uptime' },
  { value: '50ms', label: 'Avg Response' },
]

const benefits = [
  {
    title: 'Pan-India Coverage',
    text: 'Deliver to 29,000+ pin codes across all states and union territories, including tier-2 and tier-3 cities.',
    icon: <FiMapPin />,
  },
  {
    title: 'Trusted Courier Network',
    text: 'Access 25+ vetted courier partners including BlueDart, Delhivery, DTDC, XpressBees, and Ekart.',
    icon: <FiTruck />,
  },
  {
    title: 'Live Shipment Tracking',
    text: 'Real-time tracking updates for both sellers and buyers with branded tracking pages and notifications.',
    icon: <FiShield />,
  },
  {
    title: 'Smart NDR Management',
    text: 'Reduce failed deliveries by 20% with automated non-delivery report handling and buyer re-confirmation.',
    icon: <FiMessageCircle />,
  },
  {
    title: 'Rapid COD Settlements',
    text: 'Same-day COD remittance options to improve your cash flow. Track every rupee with transparent reconciliation.',
    icon: <FiBarChart2 />,
  },
  {
    title: 'International Shipping',
    text: 'Door-to-door global delivery with top international partners. Ship to 220+ countries from one dashboard.',
    icon: <FiGlobe />,
  },
]

const modules = [
  {
    title: 'Centralized Dashboard',
    text: 'Manage all your orders, shipments, returns, and pickups from one unified command center. No more juggling between courier portals.',
    icon: <FiGrid />,
    points: ['Unified order management', 'Bulk label generation', 'One-click manifest creation'],
  },
  {
    title: 'Inventory Management',
    text: 'Live stock tracking across multiple warehouses and sales channels. Automatic sync ensures you never oversell or miss a restock.',
    icon: <FiBox />,
    points: ['Multi-warehouse support', 'Channel-level sync', 'Low-stock alerts'],
  },
  {
    title: 'Performance Analytics',
    text: 'Deep insights into delivery SLAs, shipping costs, RTO rates, and courier performance. Make data-driven decisions effortlessly.',
    icon: <FiBarChart2 />,
    points: ['Courier scorecards', 'Cost breakdown reports', 'RTO trend analysis'],
  },
]

const support = [
  {
    title: 'Dedicated Support',
    text: 'Direct helpline with priority resolution for all your shipping queries and escalations.',
    icon: <FiHeadphones />,
  },
  {
    title: '24/7 Live Chat',
    text: 'Round-the-clock chat assistance for urgent issues. Average response time under 2 minutes.',
    icon: <FiMessageCircle />,
  },
  {
    title: 'Performance Reviews',
    text: 'Regular performance reviews with a dedicated account manager to optimize your shipping operations.',
    icon: <FiBarChart2 />,
  },
]

function DottedBand({ children, sx = {} }: { children: ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        color: '#fff',
        backgroundColor: navy,
        backgroundImage: `
          radial-gradient(circle at 90% 14%, rgba(124, 92, 255, 0.24), transparent 25%),
          radial-gradient(circle at 12px 12px, rgba(124, 92, 255, 0.35) 1px, transparent 1px),
          linear-gradient(120deg, ${navy} 0%, #101633 45%, ${navy2} 100%)
        `,
        backgroundSize: 'auto, 35px 35px, auto',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string
  title: ReactNode
  copy: string
}) {
  return (
    <Stack component={motion.div} {...fadeUp} spacing={1.8} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
      {eyebrow ? (
        <Typography
          sx={{
            px: 1.9,
            py: 0.55,
            borderRadius: 999,
            bgcolor: alpha(purple, 0.1),
            color: purple,
            fontWeight: 800,
            fontSize: '0.82rem',
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        component="h2"
        sx={{
          color: ink,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: 0,
          fontSize: { xs: '2.1rem', sm: '2.85rem', md: '3.45rem' },
          maxWidth: 900,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: muted, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.6, maxWidth: 720 }}>
        {copy}
      </Typography>
    </Stack>
  )
}

function FeatureCard({ item }: { item: (typeof benefits)[number] }) {
  return (
    <Stack
      component={motion.article}
      {...fadeUp}
      spacing={2.4}
      sx={{
        minHeight: 296,
        p: { xs: 3, md: 4 },
        borderRadius: '18px',
        bgcolor: '#fff',
        border: `1px solid ${border}`,
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '18px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(purple, 0.1),
          color: purple,
          fontSize: 28,
        }}
      >
        {item.icon}
      </Box>
      <Typography sx={{ color: ink, fontSize: '1.35rem', fontWeight: 900 }}>{item.title}</Typography>
      <Typography sx={{ color: muted, fontSize: '1rem', lineHeight: 1.62 }}>{item.text}</Typography>
    </Stack>
  )
}

function ModuleCard({ item }: { item: (typeof modules)[number] }) {
  return (
    <Stack
      component={motion.article}
      {...fadeUp}
      spacing={2.3}
      sx={{
        minHeight: 475,
        p: { xs: 3, md: 4 },
        borderRadius: '18px',
        bgcolor: '#fff',
        border: `1px solid ${border}`,
        borderTop: '10px solid transparent',
        borderImage: `linear-gradient(90deg, ${purple}, ${orange}) 1`,
      }}
    >
      <Box
        sx={{
          width: 70,
          height: 70,
          borderRadius: '18px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(purple, 0.1),
          color: purple,
          fontSize: 30,
        }}
      >
        {item.icon}
      </Box>
      <Typography sx={{ color: ink, fontSize: '1.45rem', fontWeight: 900 }}>{item.title}</Typography>
      <Typography sx={{ color: muted, fontSize: '1rem', lineHeight: 1.65 }}>{item.text}</Typography>
      <Stack spacing={1.4} sx={{ pt: 1 }}>
        {item.points.map((point) => (
          <Stack key={point} direction="row" spacing={1.3} alignItems="center">
            <Box sx={{ color: green, display: 'grid', placeItems: 'center' }}>
              <FiCheck />
            </Box>
            <Typography sx={{ color: ink, fontWeight: 700 }}>{point}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

export default function PlatformPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: page, color: ink }}>
      <DottedBand sx={{ minHeight: { xs: 760, md: 900 }, pt: { xs: 12, md: 14 } }}>
        <PublicNavbar primaryLabel="Go to Dashboard" primaryTo="/login" />
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 }, py: { xs: 9, md: 13 } }}>
          <Stack component={motion.section} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} spacing={3.2} alignItems="center" textAlign="center">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.8,
                borderRadius: 999,
                border: `1px solid ${alpha('#fff', 0.18)}`,
                bgcolor: alpha('#fff', 0.12),
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.86rem',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: green }} />
              Our Platform
            </Box>

            <Typography
              component="h1"
              sx={{
                color: '#fff',
                maxWidth: 940,
                fontSize: { xs: '3rem', sm: '4.2rem', lg: '5.35rem' },
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              One Platform to Power{' '}
              <Box component="span" sx={{ color: orange }}>
                All Your Shipping
              </Box>
            </Typography>

            <Typography sx={{ color: alpha('#fff', 0.64), fontSize: { xs: '1.12rem', md: '1.35rem' }, lineHeight: 1.45, maxWidth: 760 }}>
              Consolidate your entire logistics operation into a single, powerful dashboard. Sync orders, compare rates, print labels, and track shipments - all from one window.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight />} sx={{ minHeight: 60, px: 4, borderRadius: '12px', bgcolor: orange, fontSize: '1rem', fontWeight: 900, boxShadow: '0 16px 34px rgba(249, 115, 22, 0.32)', '&:hover': { bgcolor: '#ea580c' } }}>
                Start Free Trial
              </Button>
              <Button component={RouterLink} to="/platform" variant="outlined" sx={{ minHeight: 60, px: 4, borderRadius: '12px', borderColor: alpha('#fff', 0.22), color: '#fff', fontSize: '1rem', fontWeight: 900, '&:hover': { bgcolor: alpha('#fff', 0.08), borderColor: alpha('#fff', 0.38) } }}>
                Watch Demo
              </Button>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 3, md: 6 }, width: '100%', maxWidth: 760, pt: 4 }}>
              {stats.map((stat) => (
                <Box key={stat.label}>
                  <Typography sx={{ color: '#fff', fontSize: { xs: '2rem', md: '2.55rem' }, lineHeight: 1, fontWeight: 900 }}>{stat.value}</Typography>
                  <Typography sx={{ color: alpha('#fff', 0.54), mt: 1, fontSize: '0.92rem', fontWeight: 700 }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </Container>
      </DottedBand>

      <Box component="section" sx={{ py: { xs: 9, md: 12 }, bgcolor: page }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeader
            eyebrow="Why Choose Ship Aggregator"
            title={
              <>
                Everything you need to{' '}
                <Box component="span" sx={{ color: purple }}>
                  ship with confidence
                </Box>
              </>
            }
            copy="Built from the ground up for Indian e-commerce - reliable, affordable, and incredibly easy to use."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {benefits.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 9, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeader
            eyebrow="Platform Capabilities"
            title={
              <>
                Your shipping{' '}
                <Box component="span" sx={{ color: amber }}>
                  command center
                </Box>
              </>
            }
            copy="Three powerful modules that work together to streamline every part of your logistics workflow."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {modules.map((item) => (
              <ModuleCard key={item.title} item={item} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 9, md: 12 }, bgcolor: page }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeader
            eyebrow="Support"
            title={
              <>
                We're with you{' '}
                <Box component="span" sx={{ color: purple }}>
                  every step
                </Box>
              </>
            }
            copy="Shipping issues don't wait - and neither do we. Get help whenever you need it."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, textAlign: 'center' }}>
            {support.map((item) => (
              <Stack key={item.title} component={motion.article} {...fadeUp} spacing={2.2} alignItems="center">
                <Box sx={{ width: 70, height: 70, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: alpha(purple, 0.1), color: purple, fontSize: 31 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: ink, fontSize: '1.35rem', fontWeight: 900 }}>{item.title}</Typography>
                <Typography sx={{ color: muted, maxWidth: 420, lineHeight: 1.62 }}>{item.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <DottedBand sx={{ py: { xs: 9, md: 11 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Stack component={motion.section} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
            <Typography component="h2" sx={{ color: '#fff', fontSize: { xs: '2.6rem', md: '3.8rem' }, lineHeight: 1.04, fontWeight: 900 }}>
              Ready to streamline
              <Box component="span" sx={{ display: 'block' }}>
                your shipping?
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.62), fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.62, maxWidth: 660 }}>
              Join 1.5 Lakh+ businesses already shipping smarter with {brandIdentity.name}. Set up your account in under 5 minutes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
              <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight />} sx={{ minHeight: 64, px: 4.6, borderRadius: '12px', bgcolor: orange, fontSize: '1rem', fontWeight: 900, '&:hover': { bgcolor: '#ea580c' } }}>
                Start Shipping Free
              </Button>
              <Button component={RouterLink} to="/contact" variant="outlined" sx={{ minHeight: 64, px: 4.6, borderRadius: '12px', borderColor: alpha('#fff', 0.22), color: '#fff', fontSize: '1rem', fontWeight: 900, '&:hover': { bgcolor: alpha('#fff', 0.08), borderColor: alpha('#fff', 0.38) } }}>
                Talk to Sales
              </Button>
            </Stack>
          </Stack>
        </Container>
      </DottedBand>

      <PublicFooter />
    </Box>
  )
}
