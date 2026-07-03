import { alpha, Box, Button, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { type ElementType, type ReactNode, useEffect } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiCreditCard,
  FiEye,
  FiGlobe,
  FiGrid,
  FiHeadphones,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiShield,
  FiTrendingUp,
  FiTruck,
} from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import PublicNavbar from '../components/public/PublicNavbar'
import { brandIdentity } from '../theme/brand'

const navy = '#111638'
const page = '#f8f9fd'
const ink = '#11182d'
const muted = '#66758f'
const border = '#e7ebf3'
const purple = '#7967f2'
const orange = '#ff751a'
const accentGradient = 'linear-gradient(135deg, #ff751a 0%, #ffb21f 100%)'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.42 },
}

const heroStats = [
  { value: '25+', label: 'Courier Partners' },
  { value: '29,000+', label: 'Pincodes Covered' },
  { value: '99.5%', label: 'Platform Uptime' },
  { value: '50ms', label: 'Avg Response' },
]

const whyCards = [
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
    icon: <FiEye />,
  },
  {
    title: 'Smart NDR Management',
    text: 'Reduce failed deliveries by 20% with automated non-delivery report handling and buyer re-confirmation.',
    icon: <FiShield />,
  },
  {
    title: 'Rapid COD Settlements',
    text: 'Same-day COD remittance options to improve your cash flow. Track every rupee with transparent reconciliation.',
    icon: <FiCreditCard />,
  },
  {
    title: 'International Shipping',
    text: 'Door-to-door global delivery with top international partners. Ship to 220+ countries from one dashboard.',
    icon: <FiGlobe />,
  },
]

const platformModules = [
  {
    title: 'Centralized Dashboard',
    text: 'Manage all your orders, shipments, returns, and pickups from one unified command center. No more juggling between courier portals.',
    icon: <FiGrid />,
    checks: ['Unified order management', 'Bulk label generation', 'One-click manifest creation'],
  },
  {
    title: 'Inventory Management',
    text: 'Live stock tracking across multiple warehouses and sales channels. Automatic sync ensures you never oversell or miss a restock.',
    icon: <FiPackage />,
    checks: ['Multi-warehouse support', 'Channel-level sync', 'Low-stock alerts'],
  },
  {
    title: 'Performance Analytics',
    text: 'Deep insights into delivery SLAs, shipping costs, RTO rates, and courier performance. Make data-driven decisions effortlessly.',
    icon: <FiBarChart2 />,
    checks: ['Courier scorecards', 'Cost breakdown reports', 'RTO trend analysis'],
  },
]

const supportItems = [
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
    icon: <FiTrendingUp />,
  },
]

function DottedDark({
  children,
  sx = {},
  component = 'div',
}: {
  children: ReactNode
  sx?: object
  component?: ElementType
}) {
  return (
    <Box
      component={component}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: '#FFFFFF',
        backgroundColor: navy,
        backgroundImage: `
          radial-gradient(circle, rgba(122,103,242,0.3) 1px, transparent 1px),
          linear-gradient(115deg, #101832 0%, #171a43 52%, #20205a 100%)
        `,
        backgroundSize: '35px 35px, 100% 100%',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function HeroBlob({ position }: { position: 'left' | 'right' }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: { xs: 260, md: 420 },
        height: { xs: 260, md: 420 },
        borderRadius: '50%',
        filter: 'blur(70px)',
        opacity: 0.28,
        bgcolor: position === 'left' ? purple : orange,
        top: position === 'left' ? 120 : -40,
        left: position === 'left' ? -160 : 'auto',
        right: position === 'right' ? -180 : 'auto',
      }}
    />
  )
}

function Badge({
  children,
  tone = 'purple',
  dark = false,
  pulse = false,
}: {
  children: ReactNode
  tone?: 'purple' | 'orange'
  dark?: boolean
  pulse?: boolean
}) {
  const color = tone === 'orange' ? orange : purple
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.8,
        py: 0.75,
        borderRadius: 999,
        bgcolor: dark ? alpha('#FFFFFF', 0.1) : alpha(color, 0.1),
        border: dark ? `1px solid ${alpha('#FFFFFF', 0.16)}` : 'none',
        color: dark ? alpha('#FFFFFF', 0.9) : color,
        fontSize: '0.76rem',
        fontWeight: 900,
        lineHeight: 1,
        textTransform: pulse ? 'none' : 'uppercase',
      }}
    >
      {pulse ? (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: '#34d399',
            boxShadow: '0 0 0 5px rgba(52, 211, 153, 0.12)',
          }}
        />
      ) : null}
      {children}
    </Box>
  )
}

function SectionHeading({
  eyebrow,
  before,
  highlight,
  after = '',
  copy,
  tone = 'purple',
}: {
  eyebrow: string
  before: string
  highlight: string
  after?: string
  copy: string
  tone?: 'purple' | 'orange'
}) {
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      spacing={1.7}
      sx={{ maxWidth: 850, mx: 'auto', mb: { xs: 6, md: 8 }, textAlign: 'center', alignItems: 'center' }}
    >
      <Badge tone={tone}>{eyebrow}</Badge>
      <Typography
        component="h2"
        sx={{
          color: ink,
          fontSize: { xs: '2.05rem', sm: '2.65rem', lg: '3.55rem' },
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {before}{' '}
        <Box
          component="span"
          sx={{
            color: tone === 'purple' ? purple : 'transparent',
            background: tone === 'orange' ? accentGradient : 'none',
            WebkitBackgroundClip: tone === 'orange' ? 'text' : 'border-box',
            backgroundClip: tone === 'orange' ? 'text' : 'border-box',
          }}
        >
          {highlight}
        </Box>
        {after}
      </Typography>
      <Typography sx={{ color: muted, fontSize: { xs: '1rem', md: '1.14rem' }, lineHeight: 1.6, maxWidth: 680 }}>
        {copy}
      </Typography>
    </Stack>
  )
}

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      spacing={2}
      sx={{
        p: { xs: 3, sm: 4 },
        minHeight: 246,
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${border}`,
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          borderColor: alpha(purple, 0.32),
          boxShadow: `0 22px 44px ${alpha(purple, 0.08)}`,
          transform: 'translateY(-3px)',
          '& .feature-icon': {
            bgcolor: purple,
            color: '#FFFFFF',
          },
        },
      }}
    >
      <Box
        className="feature-icon"
        sx={{
          width: 52,
          height: 52,
          borderRadius: '12px',
          bgcolor: alpha(purple, 0.1),
          color: purple,
          display: 'grid',
          placeItems: 'center',
          fontSize: 25,
          transition: 'background-color 0.18s ease, color 0.18s ease',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.12rem' }}>{title}</Typography>
      <Typography sx={{ color: muted, fontSize: '0.95rem', lineHeight: 1.65 }}>{text}</Typography>
    </Stack>
  )
}

function ModuleCard({ title, text, icon, checks }: { title: string; text: string; icon: ReactNode; checks: string[] }) {
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      sx={{
        minHeight: 420,
        overflow: 'hidden',
        borderRadius: '16px',
        bgcolor: page,
        border: `1px solid ${border}`,
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          borderColor: alpha(purple, 0.3),
          boxShadow: `0 22px 44px ${alpha(purple, 0.08)}`,
          transform: 'translateY(-3px)',
          '& .module-icon': {
            bgcolor: purple,
            color: '#FFFFFF',
          },
        },
      }}
    >
      <Box sx={{ height: 8, background: `linear-gradient(90deg, ${purple}, ${orange})` }} />
      <Stack spacing={2.4} sx={{ p: { xs: 3, sm: 4 }, flex: 1 }}>
        <Box
          className="module-icon"
          sx={{
            width: 58,
            height: 58,
            borderRadius: '16px',
            bgcolor: alpha(purple, 0.1),
            color: purple,
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
            transition: 'background-color 0.18s ease, color 0.18s ease',
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.28rem' }}>{title}</Typography>
        <Typography sx={{ color: muted, fontSize: '0.95rem', lineHeight: 1.65 }}>{text}</Typography>
        <Stack spacing={1.3} sx={{ pt: 0.5 }}>
          {checks.map((check) => (
            <Stack key={check} direction="row" spacing={1.2} alignItems="center">
              <FiCheckCircle size={17} color="#10b981" />
              <Typography sx={{ color: alpha(ink, 0.82), fontSize: '0.93rem', fontWeight: 700 }}>{check}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

function SupportItem({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <Stack component={motion.div} {...fadeUp} spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: '16px',
          bgcolor: alpha(purple, 0.1),
          color: purple,
          display: 'grid',
          placeItems: 'center',
          fontSize: 26,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.12rem' }}>{title}</Typography>
      <Typography sx={{ color: muted, fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 330 }}>{text}</Typography>
    </Stack>
  )
}

export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const id = location.hash.replace('#', '')
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.pathname, location.hash])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: page }}>
      <DottedDark component="section" sx={{ minHeight: { xs: 680, lg: 720 } }}>
        <HeroBlob position="left" />
        <HeroBlob position="right" />
        <PublicNavbar primaryLabel="Sign Up" primaryTo="/signup" />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, lg: 8 }, pt: { xs: 15, md: 18 }, pb: { xs: 8, md: 10 } }}>
          <Stack
            component={motion.div}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            spacing={3}
            alignItems="center"
            sx={{ maxWidth: 850, mx: 'auto', textAlign: 'center' }}
          >
            <Badge dark pulse>
              Our Platform
            </Badge>
            <Typography
              component="h1"
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '2.45rem', sm: '3.3rem', lg: '4.35rem' },
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              One Platform to Power{' '}
              <Box component="span" sx={{ color: 'transparent', background: accentGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                All Your Shipping
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#FFFFFF', 0.62), fontSize: { xs: '1rem', sm: '1.12rem' }, lineHeight: 1.7, maxWidth: 720 }}>
              Consolidate your entire logistics operation into a single, powerful dashboard. Sync orders,
              compare rates, print labels, and track shipments -- all from one window.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                endIcon={<FiArrowRight size={18} />}
                sx={{
                  minHeight: 52,
                  px: 3.7,
                  borderRadius: '10px',
                  bgcolor: orange,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  boxShadow: '0 18px 34px rgba(255, 117, 26, 0.28)',
                  '&:hover': { bgcolor: '#f46b10', boxShadow: '0 22px 42px rgba(255, 117, 26, 0.36)' },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                component={RouterLink}
                to="/tracking"
                variant="outlined"
                sx={{
                  minHeight: 52,
                  px: 3.7,
                  borderRadius: '10px',
                  borderColor: alpha('#FFFFFF', 0.2),
                  color: '#FFFFFF',
                  fontWeight: 900,
                  '&:hover': { bgcolor: alpha('#FFFFFF', 0.08), borderColor: alpha('#FFFFFF', 0.32) },
                }}
              >
                Watch Demo
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 3, sm: 5 }, maxWidth: 720, mx: 'auto', mt: { xs: 6, md: 7 } }}>
            {heroStats.map((item) => (
              <Box key={item.label} component={motion.div} {...fadeUp} sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: { xs: '1.65rem', sm: '2rem' }, fontWeight: 900, lineHeight: 1 }}>
                  {item.value}
                </Typography>
                <Typography sx={{ color: alpha('#FFFFFF', 0.5), fontSize: '0.78rem', mt: 1, letterSpacing: 0.2 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </DottedDark>

      <Box id="integrations" component="section" sx={{ bgcolor: page, py: { xs: 8, md: 12 }, scrollMarginTop: 96 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Why Choose Ship Aggregator"
            before="Everything you need to"
            highlight="ship with confidence"
            copy="Built from the ground up for Indian e-commerce -- reliable, affordable, and incredibly easy to use."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: { xs: 2.5, lg: 3.5 } }}>
            {whyCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="tools" component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 }, scrollMarginTop: 96 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Platform Capabilities"
            before="Your shipping"
            highlight="command center"
            copy="Three powerful modules that work together to streamline every part of your logistics workflow."
            tone="orange"
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: { xs: 2.5, lg: 3.5 } }}>
            {platformModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="support" component="section" sx={{ bgcolor: page, py: { xs: 8, md: 12 }, scrollMarginTop: 96 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <SectionHeading
            eyebrow="Support"
            before="We're with you"
            highlight="every step"
            copy="Shipping issues don't wait -- and neither do we. Get help whenever you need it."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 5, md: 4 } }}>
            {supportItems.map((item) => (
              <SupportItem key={item.title} {...item} />
            ))}
          </Box>
        </Container>
      </Box>

      <DottedDark component="section" sx={{ py: { xs: 9, md: 13 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
          <Stack component={motion.div} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
            <Typography
              component="h2"
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '2.4rem', sm: '3.1rem', lg: '4rem' },
                lineHeight: 1.06,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              Ready to streamline
              <Box component="span" sx={{ display: 'block' }}>
                your shipping?
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#FFFFFF', 0.56), fontSize: { xs: '1rem', md: '1.14rem' }, lineHeight: 1.7, maxWidth: 620 }}>
              Join 1.5 Lakh+ businesses already shipping smarter with {brandIdentity.name}. Set up your
              account in under 5 minutes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                endIcon={<FiArrowRight size={18} />}
                sx={{ minHeight: 56, px: 4, borderRadius: '10px', bgcolor: orange, color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: '#f46b10' } }}
              >
                Start Shipping Free
              </Button>
              <Button
                component={RouterLink}
                to="/tracking"
                variant="outlined"
                sx={{ minHeight: 56, px: 4, borderRadius: '10px', borderColor: alpha('#FFFFFF', 0.2), color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: alpha('#FFFFFF', 0.08), borderColor: alpha('#FFFFFF', 0.34) } }}
              >
                Talk to Sales
              </Button>
            </Stack>
          </Stack>
        </Container>
      </DottedDark>
    </Box>
  )
}
