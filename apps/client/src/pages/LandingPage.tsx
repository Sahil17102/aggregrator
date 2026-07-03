import { alpha, Box, Button, Collapse, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { type ReactNode, useState } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiHome,
  FiLink,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiPhone,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiTruck,
  FiZap,
} from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import PublicNavbar from '../components/public/PublicNavbar'
import { brandIdentity } from '../theme/brand'

const navy = '#111638'
const page = '#f8f9fd'
const ink = '#11182d'
const muted = '#66758f'
const border = '#e7ebf3'
const purple = '#7967f2'
const orange = '#ff751a'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.45 },
}

const heroStats = [
  { value: '25+', label: 'Courier Partners' },
  { value: '29,000+', label: 'Pincodes Nationwide' },
  { value: '1.5L+', label: 'Businesses Annually' },
  { value: '220+', label: 'Countries Globally' },
]

const shipmentCards = [
  { title: 'Order #8472 delivered', subtitle: 'BlueDart -- Mumbai', icon: <FiCheckCircle />, color: '#34d399', sx: { top: 76, left: 0 } },
  { title: 'Shipment picked up', subtitle: 'Delhivery -- Delhi NCR', icon: <FiPackage />, color: '#a78bfa', sx: { top: 196, right: -30 } },
  { title: 'In transit to Bangalore', subtitle: 'DTDC -- Express', icon: <FiClock />, color: '#fbbf24', sx: { top: 346, left: 20 } },
  { title: 'Out for delivery', subtitle: 'XpressBees -- Pune', icon: <FiMapPin />, color: '#fb7185', sx: { bottom: 0, right: -20 } },
]

const logos = [
  { name: 'BlueDart', src: '/logo/integrations/bluedart.png' },
  { name: 'Delhivery', src: '/logo/integrations/delhivery.png' },
  { name: 'DTDC', src: '/logo/integrations/dtdc.png' },
  { name: 'XpressBees', src: '/logo/integrations/xpressbees.png' },
  { name: 'Ekart', src: '/logo/integrations/ekart.png' },
  { name: 'Shadowfax', src: '/logo/integrations/shadowfax.png' },
  { name: 'Amazon', src: '/logo/integrations/amazon.png' },
  { name: 'Flipkart', fallback: 'F', color: '#f8df00' },
  { name: 'Shopify', src: '/logo/integrations/shopify.webp' },
  { name: 'WooCommerce', src: '/logo/integrations/woocommerce.webp' },
  { name: 'OpenCart', fallback: 'O', color: '#e9fbff' },
  { name: 'Meesho', fallback: 'm', color: '#5b1238' },
]

const valueCards = [
  {
    title: 'Lightning-Fast Setup',
    text: 'Connect your store and start shipping in minutes -- no technical setup needed.',
    icon: <FiZap />,
  },
  {
    title: 'Cheapest Shipping Rates',
    text: 'Access discounted courier rates across India with zero hidden fees.',
    icon: <FiTrendingUp />,
  },
  {
    title: 'Multi-Courier Network',
    text: 'Seamlessly choose from 25+ courier partners and ship to every pincode.',
    icon: <FiShield />,
  },
]

const steps = [
  { title: 'Connect Your Store', text: 'Link your Shopify, Amazon, or WooCommerce store in one click.', icon: <FiLink /> },
  { title: 'Add Couriers', text: 'Choose from 25+ courier partners or use our negotiated rates.', icon: <FiTruck /> },
  { title: 'Sync Orders', text: 'Orders sync automatically from all your sales channels.', icon: <FiRefreshCcw /> },
  { title: 'Generate Labels', text: 'Create shipping labels in bulk with one click, ready to go.', icon: <FiFileText /> },
  { title: 'Ship & Track', text: 'Ship out orders and track every package in real-time.', icon: <FiBarChart2 /> },
]

const platformFeatures = [
  {
    title: 'Smart Order Routing',
    text: 'Automatically assign the best courier based on speed, cost, and serviceability.',
    icon: <FiRefreshCcw />,
  },
  {
    title: 'COD Management',
    text: 'Track cash-on-delivery remittances and reconcile payments effortlessly.',
    icon: <FiShoppingBag />,
  },
  {
    title: 'Real-Time Analytics',
    text: 'Monitor delivery performance, shipping costs, and RTO rates on a live dashboard.',
    icon: <FiBarChart2 />,
  },
  {
    title: 'NDR Management',
    text: 'Reduce returns with automated non-delivery report handling and buyer re-confirmation.',
    icon: <FiShield />,
  },
  {
    title: 'Automated Labels',
    text: 'Generate compliant shipping labels in bulk -- no manual entry required.',
    icon: <FiFileText />,
  },
  {
    title: 'Multi-Warehouse',
    text: 'Manage inventory across multiple warehouse locations from one place.',
    icon: <FiHome />,
  },
]

const salesChannels = ['Amazon', 'Flipkart', 'Shopify', 'WooCommerce', 'OpenCart', 'Meesho']
const courierPartners = ['BlueDart', 'Delhivery', 'DTDC', 'XpressBees', 'Ekart', 'Shadowfax']

const testimonials = [
  {
    quote:
      'Ship Aggregator cut our shipping costs by 30% and brought all our courier partners under one roof. The dashboard is a game changer.',
    initials: 'P',
    name: 'Priya Sharma',
    role: 'Founder, LoomCraft',
  },
  {
    quote:
      'We went from manually managing 5 courier accounts to one dashboard. Order processing time dropped from hours to minutes.',
    initials: 'R',
    name: 'Rahul Mehra',
    role: 'Operations Lead, UrbanBite',
  },
  {
    quote:
      'The smart routing feature alone saved us lakhs. Ship Aggregator picks the fastest, cheapest courier for every order automatically.',
    initials: 'A',
    name: 'Ananya Desai',
    role: 'E-commerce Manager, StyleNest',
  },
]

const faqs = [
  'What services does Ship Aggregator provide?',
  'How can I track my shipment?',
  'What areas do you cover for delivery?',
  'What are your delivery timelines?',
  'What payment options are available?',
  'Is my shipment insured?',
  'How can I contact customer support?',
  'What are the packaging guidelines?',
]

function DottedDark({ children, sx = {} }: { children: ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
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

function Badge({ children, tone = 'purple', dark = false }: { children: React.ReactNode; tone?: 'purple' | 'orange' | 'gold'; dark?: boolean }) {
  const color = tone === 'orange' ? orange : tone === 'gold' ? '#ffd33d' : purple
  return (
    <Typography
      component="span"
      sx={{
        alignSelf: 'center',
        px: 2,
        py: 0.65,
        borderRadius: 999,
        bgcolor: dark ? alpha(color, 0.14) : alpha(color, 0.11),
        border: dark ? `1px solid ${alpha(color, 0.32)}` : 'none',
        color,
        fontSize: '0.76rem',
        fontWeight: 900,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  )
}

function SectionHeading({
  eyebrow,
  before,
  highlight,
  after = '',
  copy,
  tone = 'purple',
  dark = false,
}: {
  eyebrow: string
  before: string
  highlight: string
  after?: string
  copy: string
  tone?: 'purple' | 'orange' | 'gold'
  dark?: boolean
}) {
  const highlightColor = tone === 'orange' ? 'linear-gradient(135deg, #ff751a, #ffb21f)' : purple
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      spacing={1.6}
      sx={{ maxWidth: 1080, mx: 'auto', mb: { xs: 6, md: 9 }, textAlign: 'center', alignItems: 'center' }}
    >
      <Badge tone={tone} dark={dark}>
        {eyebrow}
      </Badge>
      <Typography
        component="h2"
        sx={{
          color: dark ? '#FFFFFF' : ink,
          fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
          fontSize: { xs: '2.25rem', md: '4rem' },
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {before}{' '}
        <Box
          component="span"
          sx={{
            color: tone === 'orange' ? 'transparent' : highlightColor,
            background: tone === 'orange' ? highlightColor : 'none',
            WebkitBackgroundClip: tone === 'orange' ? 'text' : 'border-box',
            backgroundClip: tone === 'orange' ? 'text' : 'border-box',
          }}
        >
          {highlight}
        </Box>
        {after}
      </Typography>
      <Typography
        sx={{
          color: dark ? alpha('#FFFFFF', 0.55) : muted,
          fontSize: { xs: '1rem', md: '1.2rem' },
          lineHeight: 1.55,
          maxWidth: 790,
        }}
      >
        {copy}
      </Typography>
    </Stack>
  )
}

function LogoPill({ name }: { name: string }) {
  const logo = logos.find((item) => item.name === name)
  return (
    <Box
      sx={{
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.2,
        py: 1.4,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${border}`,
        boxShadow: '0 10px 24px rgba(17, 24, 45, 0.04)',
        minWidth: 156,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '11px',
          bgcolor: logo?.color ?? '#f8fafc',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          color: ink,
          fontWeight: 900,
        }}
      >
        {logo?.src ? (
          <Box component="img" src={logo.src} alt={name} sx={{ width: 30, height: 30, objectFit: 'contain' }} />
        ) : (
          logo?.fallback ?? name.charAt(0)
        )}
      </Box>
      <Typography sx={{ color: ink, fontWeight: 800, whiteSpace: 'nowrap' }}>{name}</Typography>
    </Box>
  )
}

function LogoCard({ name }: { name: string }) {
  return (
    <Box
      sx={{
        minHeight: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 1.6,
        px: 2.2,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${border}`,
      }}
    >
      <LogoPill name={name} />
    </Box>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <Box className="site-shell" sx={{ minHeight: '100vh', bgcolor: page }}>
      <DottedDark sx={{ minHeight: { xs: 900, lg: 940 }, pt: { xs: 13, lg: 16 }, display: 'flex', alignItems: 'center' }}>
        <PublicNavbar primaryLabel="Sign Up" primaryTo="/signup" />
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 }, pb: { xs: 8, lg: 4 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(480px, 0.95fr)' },
              alignItems: 'center',
              gap: { xs: 6, lg: 7 },
            }}
          >
            <Stack
              component={motion.section}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              spacing={2.5}
              sx={{ textAlign: { xs: 'center', lg: 'left' }, alignItems: { xs: 'center', lg: 'flex-start' } }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: 999,
                  bgcolor: alpha('#FFFFFF', 0.1),
                  border: `1px solid ${alpha('#FFFFFF', 0.18)}`,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2da67a' }} />
                <Typography sx={{ color: alpha('#FFFFFF', 0.9), fontSize: '0.82rem', fontWeight: 800 }}>
                  Customized Supply Chain Solutions
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
                  fontSize: { xs: '3rem', sm: '4.4rem', lg: '4.45rem' },
                  fontWeight: 900,
                  lineHeight: 0.96,
                  letterSpacing: 0,
                }}
              >
                Ship Smarter.
                <Box component="span" sx={{ display: 'block' }}>
                  Ship Faster.
                </Box>
                <Box component="span" sx={{ display: 'block' }}>
                  Ship{' '}
                  <Box component="span" sx={{ color: orange }}>
                    Safer.
                  </Box>
                </Box>
              </Typography>

              <Typography sx={{ maxWidth: 660, color: alpha('#FFFFFF', 0.62), fontSize: { xs: '1.05rem', md: '1.25rem' }, lineHeight: 1.55 }}>
                Connect multiple couriers, track orders in real-time, and cut shipping costs -- all from one powerful dashboard.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  endIcon={<FiArrowRight size={20} />}
                  sx={{ minHeight: 60, px: 3.5, borderRadius: '12px', bgcolor: orange, color: '#FFFFFF', fontWeight: 900, fontSize: '1rem', boxShadow: '0 18px 34px rgba(255, 117, 26, 0.32)', '&:hover': { bgcolor: '#f46b10' } }}
                >
                  Get Started Free
                </Button>
                <Button
                  component={RouterLink}
                  to="/tracking"
                  variant="outlined"
                  startIcon={<FiSearch size={20} />}
                  sx={{ minHeight: 60, px: 3.5, borderRadius: '12px', borderColor: alpha('#FFFFFF', 0.2), color: '#FFFFFF', fontWeight: 900, fontSize: '1rem', '&:hover': { borderColor: alpha('#FFFFFF', 0.35), bgcolor: alpha('#FFFFFF', 0.08) } }}
                >
                  Track Shipment
                </Button>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 2.2, sm: 3.6 }, width: '100%', maxWidth: 660, pt: 3 }}>
                {heroStats.map((item) => (
                  <Box key={item.label} sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                    <Typography sx={{ color: '#FFFFFF', fontSize: { xs: '1.8rem', sm: '2.25rem' }, fontWeight: 900, lineHeight: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.5), fontSize: '0.82rem', mt: 0.8 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>

            <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', height: 560 }}>
              <Box sx={{ position: 'absolute', inset: '80px 30px 20px 20px', borderRadius: '28px', border: `1px solid ${alpha('#FFFFFF', 0.08)}`, bgcolor: alpha('#FFFFFF', 0.02) }} />
              {shipmentCards.map((card) => (
                <Box
                  key={card.title}
                  component={motion.div}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  sx={{
                    position: 'absolute',
                    minWidth: 326,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.7,
                    borderRadius: '18px',
                    bgcolor: alpha('#FFFFFF', 0.13),
                    border: `1px solid ${alpha('#FFFFFF', 0.16)}`,
                    backdropFilter: 'blur(12px)',
                    ...card.sx,
                  }}
                >
                  <Box sx={{ width: 46, height: 46, borderRadius: '14px', bgcolor: alpha('#FFFFFF', 0.1), color: card.color, display: 'grid', placeItems: 'center', fontSize: 20 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.05rem' }}>{card.title}</Typography>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.55), fontSize: '0.88rem', mt: 0.3 }}>{card.subtitle}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </DottedDark>

      <Box component="section" sx={{ bgcolor: page, pt: { xs: 5, md: 7 }, pb: { xs: 13, md: 18 }, overflow: 'hidden' }}>
        <Typography sx={{ textAlign: 'center', color: muted, fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', mb: 4 }}>
          Powering 25+ Integrations
        </Typography>
        <Stack spacing={2.7}>
          {[0, 1].map((row) => (
            <Box key={row} sx={{ overflow: 'hidden' }}>
              <Box className={row === 0 ? 'landing-marquee-left' : 'landing-marquee-right'} sx={{ display: 'flex', gap: 3, width: 'max-content' }}>
                {[...logos, ...logos, ...logos].map((item, index) => (
                  <LogoPill key={`${row}-${item.name}-${index}`} name={item.name} />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box component="section" sx={{ bgcolor: page, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Why Ship Aggregator"
            before="Everything you need to"
            highlight="ship with confidence"
            copy="We built this to make shipping simpler, cheaper, and smarter for every seller across India."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {valueCards.map((item) => (
              <Stack
                key={item.title}
                component={motion.div}
                {...fadeUp}
                spacing={2}
                sx={{ p: 4, minHeight: 268, borderRadius: '18px', border: `1px solid ${border}`, bgcolor: '#FFFFFF' }}
              >
                <Box sx={{ width: 60, height: 60, borderRadius: '18px', bgcolor: alpha(purple, 0.1), color: purple, display: 'grid', placeItems: 'center', fontSize: 28 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.25rem', mt: 1 }}>{item.title}</Typography>
                <Typography sx={{ color: muted, fontSize: '1rem', lineHeight: 1.55 }}>{item.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <DottedDark sx={{ py: { xs: 9, md: 14 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="How It Works"
            before="From store to doorstep in"
            highlight="5 simple steps"
            copy="One smooth path from connecting your store to delivering every order on time."
            tone="orange"
            dark
          />
          <Box sx={{ position: 'relative', display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, mb: 5, px: 5 }}>
            <Box sx={{ position: 'absolute', left: '8%', right: '8%', top: 28, height: 3, bgcolor: alpha(purple, 0.75) }} />
            {steps.map((step, index) => (
              <Box key={step.title} sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                <Box sx={{ width: 58, height: 58, borderRadius: '50%', bgcolor: 'linear-gradient(135deg, #ff751a, #7a67f2)', background: 'linear-gradient(135deg, #ff751a, #7a67f2)', border: `6px solid ${alpha(purple, 0.65)}`, display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem' }}>
                  {index + 1}
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 3 }}>
            {steps.map((step) => (
              <Stack key={step.title} spacing={2.4} sx={{ p: 3, minHeight: 288, borderRadius: '18px', bgcolor: alpha('#FFFFFF', 0.07), border: `1px solid ${alpha('#FFFFFF', 0.1)}` }}>
                <Box sx={{ color: orange, fontSize: 22 }}>{step.icon}</Box>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.35 }}>{step.title}</Typography>
                <Typography sx={{ color: alpha('#FFFFFF', 0.52), lineHeight: 1.55 }}>{step.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </DottedDark>

      <Box id="integrations" component="section" sx={{ bgcolor: page, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Integrations"
            before="Connect with your"
            highlight="entire ecosystem"
            copy="Plug into your favourite sales channels and courier partners with one-click integrations."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 7, alignItems: 'start' }}>
            {[
              { title: 'Sales Channels', copy: 'Sell everywhere, manage here', names: salesChannels, icon: <FiShoppingBag />, tone: purple },
              { title: 'Courier Partners', copy: 'Ship with the best, automatically', names: courierPartners, icon: <FiTruck />, tone: orange },
            ].map((group) => (
              <Stack key={group.title} spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 50, height: 50, borderRadius: '16px', bgcolor: alpha(group.tone, 0.1), color: group.tone, display: 'grid', placeItems: 'center', fontSize: 22 }}>
                    {group.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.25rem' }}>{group.title}</Typography>
                    <Typography sx={{ color: muted }}>{group.copy}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {group.names.map((name) => (
                    <LogoCard key={name} name={name} />
                  ))}
                </Box>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="platform" component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Platform"
            before="Powerful tools for"
            highlight="every shipping need"
            copy="From smart routing to NDR management -- everything a modern D2C brand needs under one roof."
            tone="orange"
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {platformFeatures.map((item) => (
              <Stack key={item.title} component={motion.div} {...fadeUp} spacing={2} sx={{ p: 3.8, minHeight: 232, borderRadius: '16px', bgcolor: page, border: `1px solid ${border}` }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(purple, 0.1), color: purple, display: 'grid', placeItems: 'center', fontSize: 24 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.1rem' }}>{item.title}</Typography>
                <Typography sx={{ color: muted, lineHeight: 1.55 }}>{item.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: page, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <SectionHeading
            eyebrow="Testimonials"
            before="Loved by"
            highlight="1.5 Lakh+ businesses"
            copy="Don't just take our word for it -- hear from sellers who transformed their shipping."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {testimonials.map((item) => (
              <Stack key={item.name} component={motion.div} {...fadeUp} spacing={2.5} sx={{ p: 4, minHeight: 352, borderRadius: '18px', bgcolor: '#FFFFFF', border: `1px solid ${border}` }}>
                <FiMessageSquare size={34} color={ink} />
                <Typography sx={{ color: alpha(ink, 0.9), lineHeight: 1.6, flex: 1 }}>&quot;{item.quote}&quot;</Typography>
                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ pt: 2.2, borderTop: `1px solid ${border}` }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', color: purple, display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                    {item.initials}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: ink, fontWeight: 900 }}>{item.name}</Typography>
                    <Typography sx={{ color: muted, fontSize: '0.82rem' }}>{item.role}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.2} sx={{ ml: 'auto', color: '#ffb21f' }}>
                    {[0, 1, 2, 3, 4].map((star) => (
                      <FiStar key={star} size={15} fill="currentColor" />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <SectionHeading
            eyebrow="FAQs"
            before="Frequently Asked"
            highlight="Questions"
            copy="Everything you need to know about our shipping and logistics services."
          />
          <Stack spacing={2}>
            {faqs.map((question, index) => {
              const open = openFaq === index
              return (
                <Box key={question} sx={{ borderRadius: '18px', bgcolor: page, border: `1px solid ${border}`, overflow: 'hidden' }}>
                  <Button
                    fullWidth
                    onClick={() => setOpenFaq(open ? null : index)}
                    sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, py: 3, color: ink, textAlign: 'left' }}
                    endIcon={<FiChevronDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: alpha(purple, 0.1), color: purple, display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>
                        {String(index + 1).padStart(2, '0')}
                      </Box>
                      <Typography sx={{ color: ink, fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.35 }}>
                        {question}
                      </Typography>
                    </Stack>
                  </Button>
                  <Collapse in={open}>
                    <Typography sx={{ color: muted, lineHeight: 1.7, px: { xs: 2, sm: 3 }, pb: 2.5, pl: { xs: 2, sm: 9 } }}>
                      Ship Aggregator brings courier partners, sales channels, rates, labels, tracking, and delivery operations into one shipping dashboard.
                    </Typography>
                  </Collapse>
                </Box>
              )
            })}
          </Stack>
        </Container>
      </Box>

      <DottedDark sx={{ py: { xs: 9, md: 13 } }}>
        <Container maxWidth="md">
          <Stack component={motion.div} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
            <Typography component="h2" sx={{ fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif', fontSize: { xs: '2.4rem', md: '3.6rem' }, lineHeight: 1.06, fontWeight: 900 }}>
              Ready to transform
              <Box component="span" sx={{ display: 'block' }}>
                your shipping?
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#FFFFFF', 0.56), fontSize: { xs: '1rem', md: '1.18rem' }, lineHeight: 1.65, maxWidth: 620 }}>
              Join 1.5 Lakh+ businesses already shipping smarter with {brandIdentity.name}. Set up your account in under 5 minutes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1.5 }}>
              <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight size={18} />} sx={{ minHeight: 56, px: 3.7, borderRadius: '10px', bgcolor: orange, color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: '#f46b10' } }}>
                Start Shipping Free
              </Button>
              <Button component={RouterLink} to="#platform" variant="outlined" sx={{ minHeight: 56, px: 3.7, borderRadius: '10px', borderColor: alpha('#FFFFFF', 0.2), color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: alpha('#FFFFFF', 0.08), borderColor: alpha('#FFFFFF', 0.35) } }}>
                Explore Platform
              </Button>
            </Stack>
          </Stack>
        </Container>
      </DottedDark>

      <DottedDark sx={{ py: { xs: 8, md: 10 }, borderTop: `1px solid ${alpha('#FFFFFF', 0.08)}` }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 8 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 0.7fr 0.7fr 0.7fr' }, gap: { xs: 5, md: 8 } }}>
            <Stack spacing={2.4}>
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Box component="img" src={brandIdentity.logoSrc} alt="" sx={{ width: 48, height: 48, borderRadius: '50%' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.25rem' }}>{brandIdentity.name}</Typography>
              </Stack>
              <Typography sx={{ color: alpha('#FFFFFF', 0.55), lineHeight: 1.55, maxWidth: 400 }}>
                A leading courier aggregator company that delivers customized supply chain solutions. ISO (9001:2015) certified.
              </Typography>
              <Stack spacing={1.4} sx={{ color: alpha('#FFFFFF', 0.6) }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <FiMail color={purple} />
                  <Typography>cs@shipaggregator.com</Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <FiPhone color={purple} />
                  <Typography>+91 94038 91046</Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <FiMapPin color={purple} />
                  <Typography>G-10, Bajrang Complex, Telipara, Bilaspur, Chhattisgarh</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1.2}>
                {['X', 'in', 'ig', 'yt', 'f'].map((social) => (
                  <Box key={social} sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha('#FFFFFF', 0.08), color: alpha('#FFFFFF', 0.68), display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                    {social}
                  </Box>
                ))}
              </Stack>
            </Stack>
            {[
              { title: 'Product', items: ['Platform', 'Rate Calculator', 'Weight Estimator', 'Track Shipment', 'Integrations'] },
              { title: 'Company', items: ['About Us', 'Blogs', 'Careers', 'Contact Us', 'Partner With Us'] },
              { title: 'Legal', items: ['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'] },
            ].map((column) => (
              <Stack key={column.title} spacing={1.6}>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 900 }}>{column.title}</Typography>
                {column.items.map((item) => (
                  <Typography key={item} sx={{ color: alpha('#FFFFFF', 0.55) }}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            ))}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mt: 7, pt: 3, borderTop: `1px solid ${alpha('#FFFFFF', 0.1)}`, color: alpha('#FFFFFF', 0.45) }}>
            <Typography>© 2026 Ship Aggregator. All rights reserved.</Typography>
            <Typography>Made with care in India</Typography>
          </Stack>
        </Container>
      </DottedDark>
    </Box>
  )
}
