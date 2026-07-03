import { alpha, Box, Button, Collapse, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiHome,
  FiLayers,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiZap,
} from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import PublicNavbar from '../components/public/PublicNavbar'
import { brand, brandIdentity } from '../theme/brand'

const darkBg = '#121638'
const pageBg = '#f7f8fc'
const text = '#151943'
const muted = '#667085'
const line = '#e8ecf4'

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
  {
    title: 'Order #8472 delivered',
    subtitle: 'BlueDart -- Mumbai',
    icon: <FiCheckCircle />,
    color: '#34d399',
    sx: { top: 24, left: 8 },
  },
  {
    title: 'Shipment picked up',
    subtitle: 'Delhivery -- Delhi NCR',
    icon: <FiPackage />,
    color: '#a78bfa',
    sx: { top: 120, right: 0 },
  },
  {
    title: 'In transit to Bangalore',
    subtitle: 'DTDC -- Express',
    icon: <FiClock />,
    color: '#fbbf24',
    sx: { top: 240, left: 28 },
  },
  {
    title: 'Out for delivery',
    subtitle: 'XpressBees -- Pune',
    icon: <FiMapPin />,
    color: '#fb7185',
    sx: { bottom: 24, right: 8 },
  },
]

const logos = [
  { name: 'BlueDart', src: '/logo/integrations/bluedart.png' },
  { name: 'Delhivery', src: '/logo/integrations/delhivery.png' },
  { name: 'DTDC', src: '/logo/integrations/dtdc.png' },
  { name: 'XpressBees', src: '/logo/integrations/xpressbees.png' },
  { name: 'Ekart', src: '/logo/integrations/ekart.png' },
  { name: 'Shadowfax', src: '/logo/integrations/shadowfax.png' },
  { name: 'Amazon', src: '/logo/integrations/amazon.png' },
  { name: 'Flipkart' },
  { name: 'Shopify', src: '/logo/integrations/shopify.webp' },
  { name: 'WooCommerce', src: '/logo/integrations/woocommerce.webp' },
  { name: 'OpenCart' },
  { name: 'Meesho' },
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
    icon: <FiDollarSign />,
  },
  {
    title: 'Multi-Courier Network',
    text: 'Seamlessly choose from 25+ courier partners and ship to every pincode.',
    icon: <FiLayers />,
  },
]

const steps = [
  {
    title: 'Connect Your Store',
    text: 'Link your Shopify, Amazon, or WooCommerce store in one click.',
  },
  {
    title: 'Add Couriers',
    text: 'Choose from 25+ courier partners or use our negotiated rates.',
  },
  {
    title: 'Sync Orders',
    text: 'Orders sync automatically from all your sales channels.',
  },
  {
    title: 'Generate Labels',
    text: 'Create shipping labels in bulk with one click, ready to go.',
  },
  {
    title: 'Ship & Track',
    text: 'Ship out orders and track every package in real-time.',
  },
]

const platformFeatures = [
  {
    title: 'Smart Order Routing',
    text: 'Automatically assign the best courier based on speed, cost, and serviceability.',
    icon: <FiTruck />,
  },
  {
    title: 'COD Management',
    text: 'Track cash-on-delivery remittances and reconcile payments effortlessly.',
    icon: <FiDollarSign />,
  },
  {
    title: 'Real-Time Analytics',
    text: 'Monitor delivery performance, shipping costs, and RTO rates on a live dashboard.',
    icon: <FiBarChart2 />,
  },
  {
    title: 'NDR Management',
    text: 'Reduce returns with automated non-delivery report handling and buyer re-confirmation.',
    icon: <FiRefreshCcw />,
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
  {
    q: 'What services does Ship Aggregator provide?',
    a: 'Ship Aggregator provides courier aggregation, rate comparison, label generation, shipment tracking, COD visibility, integrations, and shipping workflow tools.',
  },
  {
    q: 'How can I track my shipment?',
    a: 'Use Track Shipment from the homepage and enter your tracking details to view the latest shipment status.',
  },
  {
    q: 'What areas do you cover for delivery?',
    a: 'The platform is designed for nationwide Indian courier coverage, with support for 29,000+ pincodes through connected courier partners.',
  },
  {
    q: 'What are your delivery timelines?',
    a: 'Delivery timelines depend on courier partner, service type, pickup city, destination city, and shipment mode.',
  },
  {
    q: 'What payment options are available?',
    a: 'The platform supports prepaid and COD shipment workflows, with wallet and billing tools available inside the dashboard.',
  },
  {
    q: 'Is my shipment insured?',
    a: 'Insurance and liability depend on courier partner terms, declared value, shipment type, and enabled service options.',
  },
  {
    q: 'How can I contact customer support?',
    a: 'You can contact support from the dashboard support area or use the contact information listed in company policy pages.',
  },
  {
    q: 'What are the packaging guidelines?',
    a: 'Use secure, shipment-safe packaging with correct dimensions, weight, labels, and product declarations for each courier movement.',
  },
]

function SectionHeading({
  eyebrow,
  title,
  copy,
  dark = false,
}: {
  eyebrow: string
  title: string
  copy: string
  dark?: boolean
}) {
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      spacing={1.6}
      sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 5, md: 8 }, textAlign: 'center' }}
    >
      <Typography
        sx={{
          alignSelf: 'center',
          px: 2,
          py: 0.75,
          borderRadius: 999,
          bgcolor: dark ? alpha('#FFFFFF', 0.08) : alpha(brand.accent, 0.1),
          color: dark ? '#ffd8bd' : brand.accent,
          fontSize: '0.72rem',
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        component="h2"
        sx={{
          color: dark ? '#FFFFFF' : text,
          fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
          fontSize: { xs: '2.1rem', md: '3.15rem' },
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: dark ? alpha('#FFFFFF', 0.58) : muted,
          fontSize: { xs: '1rem', md: '1.1rem' },
          lineHeight: 1.75,
        }}
      >
        {copy}
      </Typography>
    </Stack>
  )
}

function LogoPill({ logo }: { logo: (typeof logos)[number] }) {
  return (
    <Box
      sx={{
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.2,
        px: 2.2,
        py: 1.3,
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${line}`,
        boxShadow: '0 10px 26px rgba(21,25,67,0.04)',
        minWidth: 150,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: '#f7f8fc',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          color: brand.accent,
          fontWeight: 900,
        }}
      >
        {logo.src ? (
          <Box component="img" src={logo.src} alt={logo.name} sx={{ width: 28, height: 28, objectFit: 'contain' }} />
        ) : (
          logo.name.charAt(0)
        )}
      </Box>
      <Typography sx={{ color: alpha(text, 0.72), fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
        {logo.name}
      </Typography>
    </Box>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <Box className="site-shell" sx={{ minHeight: '100vh', bgcolor: pageBg }}>
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: { xs: 820, lg: '90vh' },
          display: 'flex',
          alignItems: 'center',
          pt: { xs: 8, lg: 9 },
          overflow: 'hidden',
          color: '#FFFFFF',
          backgroundColor: darkBg,
          backgroundImage: `
            radial-gradient(circle at 14% 20%, rgba(255,132,36,0.16), transparent 23%),
            radial-gradient(circle at 85% 14%, rgba(94,92,230,0.18), transparent 24%),
            radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px),
            linear-gradient(115deg, #111638 0%, #171b46 55%, #1f2255 100%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 32px 32px, 100% 100%',
        }}
      >
        <PublicNavbar primaryLabel="Sign Up" primaryTo="/signup" />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 7, lg: 12 }, px: { xs: 2, sm: 3, lg: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(420px, 0.92fr)' },
              alignItems: 'center',
              gap: { xs: 6, lg: 8 },
            }}
          >
            <Stack
              component={motion.section}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              spacing={2.5}
              sx={{
                textAlign: { xs: 'center', lg: 'left' },
                alignItems: { xs: 'center', lg: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.85,
                  borderRadius: 999,
                  bgcolor: alpha('#FFFFFF', 0.1),
                  border: `1px solid ${alpha('#FFFFFF', 0.15)}`,
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399', boxShadow: '0 0 0 4px rgba(52,211,153,0.16)' }} />
                <Typography sx={{ color: alpha('#FFFFFF', 0.9), fontSize: '0.76rem', fontWeight: 700 }}>
                  Customized Supply Chain Solutions
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
                  fontSize: { xs: '2.9rem', sm: '4rem', lg: '3.65rem', xl: '4.35rem' },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: 0,
                }}
              >
                Ship Smarter.
                <Box component="span" sx={{ display: 'block' }}>
                  Ship Faster.
                </Box>
                <Box component="span" sx={{ display: 'block' }}>
                  Ship{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #ff8a28 0%, #ffbf70 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Easier.
                  </Box>
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 560,
                  color: alpha('#FFFFFF', 0.62),
                  fontSize: { xs: '1rem', sm: '1.12rem' },
                  lineHeight: 1.75,
                }}
              >
                Connect multiple couriers, track orders in real-time, and cut shipping costs -- all from one powerful dashboard.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  endIcon={<FiArrowRight size={18} />}
                  sx={{
                    minHeight: 52,
                    px: 3.2,
                    borderRadius: '8px',
                    bgcolor: brand.accent,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    boxShadow: '0 16px 34px rgba(255, 132, 36, 0.25)',
                    '&:hover': { bgcolor: '#f47b14', boxShadow: '0 18px 38px rgba(255, 132, 36, 0.34)' },
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
                    minHeight: 52,
                    px: 3.2,
                    borderRadius: '8px',
                    borderColor: alpha('#FFFFFF', 0.2),
                    color: '#FFFFFF',
                    fontWeight: 800,
                    '&:hover': {
                      borderColor: alpha('#FFFFFF', 0.35),
                      bgcolor: alpha('#FFFFFF', 0.08),
                    },
                  }}
                >
                  Track Shipment
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: { xs: 2.2, sm: 3.4 },
                  width: '100%',
                  maxWidth: 660,
                  pt: 3,
                }}
              >
                {heroStats.map((item) => (
                  <Box key={item.label} sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                    <Typography sx={{ color: '#FFFFFF', fontSize: { xs: '1.55rem', sm: '2rem' }, fontWeight: 900 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.48), fontSize: '0.76rem', mt: 0.4 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>

            <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', height: 440 }}>
              <Box sx={{ position: 'absolute', inset: 3, borderRadius: '24px', border: `1px solid ${alpha('#FFFFFF', 0.06)}`, bgcolor: alpha('#FFFFFF', 0.02) }} />
              {shipmentCards.map((card) => (
                <Box
                  key={card.title}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  sx={{
                    position: 'absolute',
                    minWidth: 260,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.4,
                    px: 2,
                    py: 1.6,
                    borderRadius: '12px',
                    bgcolor: alpha('#FFFFFF', 0.1),
                    border: `1px solid ${alpha('#FFFFFF', 0.15)}`,
                    backdropFilter: 'blur(12px)',
                    ...card.sx,
                  }}
                >
                  <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: alpha('#FFFFFF', 0.1), color: card.color, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem' }}>{card.title}</Typography>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.5), fontSize: '0.76rem', mt: 0.35 }}>{card.subtitle}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: pageBg, py: { xs: 6, md: 8 }, overflow: 'hidden' }}>
        <Typography sx={{ textAlign: 'center', color: muted, fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase', mb: 4 }}>
          Powering 25+ Integrations
        </Typography>
        <Stack spacing={2.2}>
          {[0, 1].map((row) => (
            <Box key={row} sx={{ overflow: 'hidden' }}>
              <Box
                className={row === 0 ? 'landing-marquee-left' : 'landing-marquee-right'}
                sx={{ display: 'flex', gap: 2, width: 'max-content' }}
              >
                {[...logos, ...logos, ...logos].map((logo, index) => (
                  <LogoPill key={`${row}-${logo.name}-${index}`} logo={logo} />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Why Ship Aggregator"
            title="Everything you need to ship with confidence"
            copy="We built this to make shipping simpler, cheaper, and smarter for every seller across India."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.2 }}>
            {valueCards.map((item) => (
              <Stack
                key={item.title}
                component={motion.div}
                {...fadeUp}
                spacing={1.5}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: `1px solid ${line}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 16px 36px rgba(21,25,67,0.05)',
                }}
              >
                <Box sx={{ width: 50, height: 50, borderRadius: '14px', bgcolor: alpha(brand.accent, 0.1), color: brand.accent, display: 'grid', placeItems: 'center', fontSize: 22 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: text, fontWeight: 900, fontSize: '1.08rem' }}>{item.title}</Typography>
                <Typography sx={{ color: muted, lineHeight: 1.7 }}>{item.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: pageBg, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="How It Works"
            title="From store to doorstep in 5 simple steps"
            copy="One smooth path from connecting your store to delivering every order on time."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 1.6 }}>
            {steps.map((step, index) => (
              <Stack
                key={step.title}
                component={motion.div}
                {...fadeUp}
                spacing={1.2}
                sx={{
                  p: 2.2,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${line}`,
                  minHeight: 210,
                }}
              >
                <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: index === 0 ? brand.accent : alpha(brand.accent, 0.1), color: index === 0 ? '#FFFFFF' : brand.accent, display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                  {index + 1}
                </Box>
                <Typography sx={{ color: text, fontWeight: 900, lineHeight: 1.25 }}>{step.title}</Typography>
                <Typography sx={{ color: muted, fontSize: '0.9rem', lineHeight: 1.65 }}>{step.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Integrations"
            title="Connect with your entire ecosystem"
            copy="Plug into your favourite sales channels and courier partners with one-click integrations."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.2 }}>
            {[
              { title: 'Sales Channels', copy: 'Sell everywhere, manage here', names: ['Amazon', 'Flipkart', 'Shopify', 'WooCommerce', 'OpenCart', 'Meesho'], icon: <FiShoppingBag /> },
              { title: 'Courier Partners', copy: 'Ship with the best, automatically', names: ['BlueDart', 'Delhivery', 'DTDC', 'XpressBees', 'Ekart', 'Shadowfax'], icon: <FiTruck /> },
            ].map((group) => (
              <Stack key={group.title} spacing={2} sx={{ p: { xs: 2.4, md: 3 }, borderRadius: '18px', border: `1px solid ${line}`, bgcolor: pageBg }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(brand.accent, 0.1), color: brand.accent, display: 'grid', placeItems: 'center', fontSize: 20 }}>
                    {group.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: text, fontWeight: 900 }}>{group.title}</Typography>
                    <Typography sx={{ color: muted, fontSize: '0.86rem' }}>{group.copy}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2 }}>
                  {group.names.map((name) => (
                    <Box key={name} sx={{ px: 1.5, py: 1.15, borderRadius: '10px', bgcolor: '#FFFFFF', border: `1px solid ${line}`, color: alpha(text, 0.74), fontWeight: 800, fontSize: '0.86rem' }}>
                      {name}
                    </Box>
                  ))}
                </Box>
              </Stack>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mt: 2 }}>
            {['13+ Total Integrations', '1-Click Setup Time', '99.9% API Uptime'].map((item) => (
              <Box key={item} sx={{ p: 2.2, borderRadius: '14px', bgcolor: darkBg, color: '#FFFFFF', textAlign: 'center', fontWeight: 900 }}>
                {item}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: pageBg, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Platform"
            title="Powerful tools for every shipping need"
            copy="From smart routing to NDR management -- everything a modern D2C brand needs under one roof."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.8 }}>
            {platformFeatures.map((item) => (
              <Stack key={item.title} component={motion.div} {...fadeUp} spacing={1.5} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${line}` }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(brand.accent, 0.1), color: brand.accent, display: 'grid', placeItems: 'center', fontSize: 20 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: text, fontWeight: 900 }}>{item.title}</Typography>
                <Typography sx={{ color: muted, lineHeight: 1.7, fontSize: '0.92rem' }}>{item.text}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by 1.5 Lakh+ businesses"
            copy="Do not just take our word for it -- hear from sellers who transformed their shipping."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {testimonials.map((item) => (
              <Stack key={item.name} component={motion.div} {...fadeUp} spacing={2} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${line}`, bgcolor: '#FFFFFF', minHeight: 300 }}>
                <FiMessageSquare size={32} color={alpha(brand.accent, 0.25)} />
                <Typography sx={{ color: alpha(text, 0.82), lineHeight: 1.75, flex: 1 }}>&quot;{item.quote}&quot;</Typography>
                <Stack direction="row" spacing={1.3} alignItems="center" sx={{ pt: 2, borderTop: `1px solid ${line}` }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha(brand.accent, 0.12), color: brand.accent, display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                    {item.initials}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: text, fontWeight: 900, fontSize: '0.92rem' }}>{item.name}</Typography>
                    <Typography sx={{ color: muted, fontSize: '0.76rem' }}>{item.role}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.2} sx={{ ml: 'auto', color: '#fbbf24' }}>
                    {[0, 1, 2, 3, 4].map((star) => (
                      <FiStar key={star} size={14} fill="currentColor" />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: pageBg, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <SectionHeading
            eyebrow="FAQs"
            title="Frequently Asked Questions"
            copy="Everything you need to know about our shipping and logistics services."
          />
          <Stack spacing={1.4}>
            {faqs.map((item, index) => {
              const open = openFaq === index
              return (
                <Box key={item.q} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${open ? alpha(brand.accent, 0.25) : line}`, overflow: 'hidden' }}>
                  <Button
                    fullWidth
                    onClick={() => setOpenFaq(open ? null : index)}
                    sx={{
                      justifyContent: 'space-between',
                      px: { xs: 2, sm: 3 },
                      py: 2.2,
                      color: text,
                      textAlign: 'left',
                    }}
                    endIcon={<FiChevronDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(brand.accent, 0.1), color: brand.accent, display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0, fontSize: '0.78rem' }}>
                        {String(index + 1).padStart(2, '0')}
                      </Box>
                      <Typography sx={{ color: text, fontWeight: 800, fontSize: { xs: '0.88rem', sm: '1rem' }, lineHeight: 1.35 }}>
                        {item.q}
                      </Typography>
                    </Stack>
                  </Button>
                  <Collapse in={open}>
                    <Typography sx={{ color: muted, lineHeight: 1.75, px: { xs: 2, sm: 3 }, pb: 2.4, pl: { xs: 2, sm: 8.5 } }}>
                      {item.a}
                    </Typography>
                  </Collapse>
                </Box>
              )
            })}
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          position: 'relative',
          bgcolor: darkBg,
          py: { xs: 9, md: 13 },
          color: '#FFFFFF',
          overflow: 'hidden',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(255,132,36,0.16), transparent 32%),
            radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(135deg, #111638 0%, #1b1f50 100%)
          `,
          backgroundSize: '100% 100%, 32px 32px, 100% 100%',
        }}
      >
        <Container maxWidth="md">
          <Stack component={motion.div} {...fadeUp} spacing={2.2} alignItems="center" textAlign="center">
            <Typography component="h2" sx={{ fontFamily: '"Barlow", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif', fontSize: { xs: '2.3rem', md: '3.4rem' }, lineHeight: 1.05, fontWeight: 900, letterSpacing: 0 }}>
              Ready to transform
              <Box component="span" sx={{ display: 'block' }}>
                your shipping?
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#FFFFFF', 0.58), fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.75, maxWidth: 560 }}>
              Join 1.5 Lakh+ businesses already shipping smarter with {brandIdentity.name}. Set up your account in under 5 minutes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1.3 }}>
              <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight size={18} />} sx={{ minHeight: 54, px: 3.4, borderRadius: '8px', bgcolor: brand.accent, color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: '#f47b14' } }}>
                Start Shipping Free
              </Button>
              <Button component={RouterLink} to="/" variant="outlined" sx={{ minHeight: 54, px: 3.4, borderRadius: '8px', borderColor: alpha('#FFFFFF', 0.2), color: '#FFFFFF', fontWeight: 900, '&:hover': { bgcolor: alpha('#FFFFFF', 0.08), borderColor: alpha('#FFFFFF', 0.35) } }}>
                Explore Platform
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
