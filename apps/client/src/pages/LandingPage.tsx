import { alpha, Box, Button, Container, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { type ReactNode, useEffect } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiChevronDown,
  FiCreditCard,
  FiGlobe,
  FiPackage,
  FiRepeat,
  FiSearch,
  FiShield,
  FiTruck,
  FiZap,
} from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import PublicFooter from '../components/public/PublicFooter'
import PublicNavbar from '../components/public/PublicNavbar'
import { brandIdentity } from '../theme/brand'

const navy = '#0f172a'
const navy2 = '#15134a'
const page = '#fafbfe'
const ink = '#0f172a'
const muted = '#64748b'
const border = '#e2e8f0'
const purple = '#6c5ce7'
const orange = '#f97316'
const amber = '#fbbf24'
const green = '#34d399'
const rose = '#fb7185'

const fadeUp = {
  initial: { opacity: 0, y: 26 },
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

const heroUpdates = [
  { title: 'Order #8472 delivered', meta: 'BlueDart - Mumbai', color: green },
  { title: 'Shipment picked up', meta: 'Delhivery - Delhi NCR', color: purple },
  { title: 'In transit to Bangalore', meta: 'DTDC - Express', color: amber },
  { title: 'Out for delivery', meta: 'XpressBees - Pune', color: rose },
]

const integrations = [
  { name: 'BlueDart', logo: '/logo/integrations/bluedart.png' },
  { name: 'Delhivery', logo: '/logo/integrations/delhivery.png' },
  { name: 'DTDC', logo: '/logo/integrations/dtdc.png' },
  { name: 'XpressBees', logo: '/logo/integrations/xpressbees.png' },
  { name: 'Ekart', logo: '/logo/integrations/ekart.png' },
  { name: 'Shadowfax', logo: '/logo/integrations/shadowfax.png' },
  { name: 'Amazon', logo: '/logo/integrations/amazon.png' },
  { name: 'Flipkart', logo: '/logo/integrations/default-courier.png' },
  { name: 'Shopify', logo: '/logo/integrations/shopify.webp' },
  { name: 'WooCommerce', logo: '/logo/integrations/woocommerce.webp' },
  { name: 'OpenCart', logo: '/logo/integrations/default-courier.png' },
  { name: 'Meesho', logo: '/logo/integrations/default-courier.png' },
]

const whyCards = [
  {
    title: 'Lightning-Fast Setup',
    text: 'Connect your store and start shipping in minutes - no technical setup needed.',
    icon: <FiZap />,
  },
  {
    title: 'Cheapest Shipping Rates',
    text: 'Access discounted courier rates across India with zero hidden fees.',
    icon: <FiCreditCard />,
  },
  {
    title: 'Multi-Courier Network',
    text: 'Seamlessly choose from 25+ courier partners and ship to every pincode.',
    icon: <FiTruck />,
  },
]

const steps = [
  ['Connect Your Store', 'Link your Shopify, Amazon, or WooCommerce store in one click.'],
  ['Add Couriers', 'Choose from 25+ courier partners or use our negotiated rates.'],
  ['Sync Orders', 'Orders sync automatically from all your sales channels.'],
  ['Generate Labels', 'Create shipping labels in bulk with one click, ready to go.'],
  ['Ship & Track', 'Ship out orders and track every package in real-time.'],
]

const platformTools = [
  {
    title: 'Smart Order Routing',
    text: 'Automatically assign the best courier based on speed, cost, and serviceability.',
    icon: <FiRepeat />,
  },
  {
    title: 'COD Management',
    text: 'Track cash-on-delivery remittances and reconcile payments effortlessly.',
    icon: <FiCreditCard />,
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
    text: 'Generate compliant shipping labels in bulk - no manual entry required.',
    icon: <FiPackage />,
  },
  {
    title: 'Multi-Warehouse',
    text: 'Manage inventory across multiple warehouse locations from one place.',
    icon: <FiGlobe />,
  },
]

const testimonials = [
  {
    quote:
      'Ship Aggregator cut our shipping costs by 30% and brought all our courier partners under one roof. The dashboard is a game changer.',
    initial: 'P',
    name: 'Priya Sharma',
    role: 'Founder, LoomCraft',
  },
  {
    quote:
      'We went from manually managing 5 courier accounts to one dashboard. Order processing time dropped from hours to minutes.',
    initial: 'R',
    name: 'Rahul Mehra',
    role: 'Operations Lead, UrbanBite',
  },
  {
    quote:
      'The smart routing feature alone saved us lakhs. Ship Aggregator picks the fastest, cheapest courier for every order automatically.',
    initial: 'A',
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

function DarkBand({ children, sx = {} }: { children: ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        color: '#fff',
        backgroundColor: navy,
        backgroundImage: `
          radial-gradient(circle at 18% 18%, rgba(108, 92, 231, 0.22), transparent 26%),
          linear-gradient(120deg, ${navy} 0%, #11183f 46%, ${navy2} 100%)
        `,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string
  title: ReactNode
  copy: string
  light?: boolean
}) {
  return (
    <Stack component={motion.div} {...fadeUp} spacing={1.8} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 7 } }}>
      <Typography
        sx={{
          color: light ? alpha('#fff', 0.62) : muted,
          fontSize: '0.82rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        component="h2"
        sx={{
          color: light ? '#fff' : ink,
          fontSize: { xs: '2rem', sm: '2.55rem', lg: '3.1rem' },
          lineHeight: 1.08,
          fontWeight: 800,
          letterSpacing: 0,
          maxWidth: 780,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: light ? alpha('#fff', 0.58) : muted, fontSize: { xs: '1rem', md: '1.12rem' }, maxWidth: 680, lineHeight: 1.65 }}>
        {copy}
      </Typography>
    </Stack>
  )
}

function IntegrationPill({ item }: { item: (typeof integrations)[number] }) {
  return (
    <Box
      sx={{
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.4,
        px: 2.1,
        py: 1.45,
        borderRadius: '12px',
        bgcolor: '#fff',
        border: `1px solid ${border}`,
        minWidth: 142,
        boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: '#f9fafb', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <Box component="img" src={item.logo} alt={item.name} sx={{ width: 28, height: 28, objectFit: 'contain' }} />
      </Box>
      <Typography sx={{ color: alpha(ink, 0.72), fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.name}</Typography>
    </Box>
  )
}

function Card({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <Stack
      component={motion.div}
      {...fadeUp}
      spacing={2}
      sx={{
        p: { xs: 3, md: 3.4 },
        borderRadius: '16px',
        bgcolor: dark ? alpha('#fff', 0.06) : '#fff',
        border: `1px solid ${dark ? alpha('#fff', 0.1) : border}`,
        minHeight: '100%',
      }}
    >
      {children}
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
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [location.pathname, location.hash])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: page, color: ink }}>
      <DarkBand sx={{ minHeight: { xs: 760, lg: 900 }, position: 'relative', overflow: 'hidden' }}>
        <PublicNavbar primaryLabel="Sign Up" primaryTo="/signup" />
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 }, pt: { xs: 16, md: 20 }, pb: { xs: 8, md: 10 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 6, lg: 10 }, alignItems: 'center' }}>
            <Stack component={motion.section} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} spacing={3} textAlign={{ xs: 'center', lg: 'left' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  alignSelf: { xs: 'center', lg: 'flex-start' },
                  px: 2,
                  py: 0.8,
                  borderRadius: 999,
                  border: `1px solid ${alpha('#fff', 0.15)}`,
                  bgcolor: alpha('#fff', 0.1),
                  color: alpha('#fff', 0.9),
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: green }} />
                Customized Supply Chain Solutions
              </Box>

              <Typography
                component="h1"
                sx={{
                  color: '#fff',
                  fontSize: { xs: '3rem', sm: '4.1rem', lg: '5.2rem' },
                  lineHeight: 0.98,
                  fontWeight: 800,
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
                    Easier.
                  </Box>
                </Box>
              </Typography>

              <Typography sx={{ color: alpha('#fff', 0.62), fontSize: { xs: '1.02rem', sm: '1.16rem' }, lineHeight: 1.65, maxWidth: 560, mx: { xs: 'auto', lg: 0 } }}>
                Connect multiple couriers, track orders in real-time, and cut shipping costs - all from one powerful dashboard.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} justifyContent={{ xs: 'center', lg: 'flex-start' }} sx={{ pt: 1 }}>
                <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight />} sx={{ minHeight: 48, px: 3.2, borderRadius: '8px', bgcolor: orange, fontWeight: 800, '&:hover': { bgcolor: '#ea580c' } }}>
                  Get Started Free
                </Button>
                <Button component={RouterLink} to="/track" variant="outlined" startIcon={<FiSearch />} sx={{ minHeight: 48, px: 3.2, borderRadius: '8px', color: '#fff', borderColor: alpha('#fff', 0.2), fontWeight: 800, '&:hover': { bgcolor: alpha('#fff', 0.08), borderColor: alpha('#fff', 0.36) } }}>
                  Track Shipment
                </Button>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 2.5, sm: 4 }, pt: 3 }}>
                {heroStats.map((stat) => (
                  <Box key={stat.label}>
                    <Typography sx={{ color: '#fff', fontSize: { xs: '1.65rem', sm: '2rem' }, fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                    <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.78rem', mt: 0.8 }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>

            <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', height: 440 }}>
              <Box sx={{ position: 'absolute', inset: 24, borderRadius: '28px', border: `1px solid ${alpha('#fff', 0.06)}`, bgcolor: alpha('#fff', 0.02) }} />
              {heroUpdates.map((item, index) => (
                <Stack
                  key={item.title}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    position: 'absolute',
                    left: index % 2 ? 260 : index === 2 ? 40 : 0,
                    top: [24, 120, 240, 350][index],
                    width: 260,
                    px: 2,
                    py: 1.6,
                    borderRadius: '12px',
                    bgcolor: alpha('#fff', 0.1),
                    border: `1px solid ${alpha('#fff', 0.15)}`,
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: '9px', bgcolor: alpha('#fff', 0.1), display: 'grid', placeItems: 'center', color: item.color }}>
                    <FiPackage />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{item.title}</Typography>
                    <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.76rem', mt: 0.2 }}>{item.meta}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Box>
        </Container>
      </DarkBand>

      <Box component="section" sx={{ py: { xs: 6, md: 8 }, bgcolor: page, overflow: 'hidden' }}>
        <Typography sx={{ textAlign: 'center', color: muted, fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.08em', mb: 4 }}>
          POWERING 25+ INTEGRATIONS
        </Typography>
        <Stack spacing={2.5}>
          {[0, 1].map((row) => (
            <Box key={row} sx={{ overflow: 'hidden' }}>
              <Box className={row === 0 ? 'landing-marquee-left' : 'landing-marquee-right'} sx={{ display: 'flex', gap: 3, width: 'max-content' }}>
                {[...integrations, ...integrations, ...integrations].map((item, index) => (
                  <IntegrationPill key={`${row}-${item.name}-${index}`} item={item} />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box id="platform" component="section" sx={{ py: { xs: 9, md: 13 }, bgcolor: '#fff' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            eyebrow="Why Ship Aggregator"
            title="Everything you need to ship with confidence"
            copy="We built this to make shipping simpler, cheaper, and smarter for every seller across India."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {whyCards.map((card) => (
              <Card key={card.title}>
                <Box sx={{ width: 52, height: 52, borderRadius: '12px', bgcolor: alpha(purple, 0.08), color: purple, display: 'grid', placeItems: 'center', fontSize: 25 }}>
                  {card.icon}
                </Box>
                <Typography sx={{ color: ink, fontWeight: 800, fontSize: '1.18rem' }}>{card.title}</Typography>
                <Typography sx={{ color: muted, lineHeight: 1.65 }}>{card.text}</Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <DarkBand sx={{ py: { xs: 9, md: 13 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            light
            eyebrow="How It Works"
            title="From store to doorstep in 5 simple steps"
            copy="One smooth path from connecting your store to delivering every order on time."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2.5 }}>
            {steps.map(([title, text], index) => (
              <Card key={title} dark>
                <Typography sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha('#fff', 0.1), color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                  {index + 1}
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 800 }}>{title}</Typography>
                <Typography sx={{ color: alpha('#fff', 0.56), fontSize: '0.92rem', lineHeight: 1.6 }}>{text}</Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </DarkBand>

      <Box id="integrations" component="section" sx={{ py: { xs: 9, md: 13 }, bgcolor: page }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            eyebrow="Integrations"
            title="Connect with your entire ecosystem"
            copy="Plug into your favourite sales channels and courier partners with one-click integrations."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
            {[
              ['Sales Channels', 'Sell everywhere, manage here', integrations.slice(6, 12)],
              ['Courier Partners', 'Ship with the best, automatically', integrations.slice(0, 6)],
            ].map(([title, copy, items]) => (
              <Card key={title as string}>
                <Typography sx={{ color: ink, fontWeight: 800, fontSize: '1.3rem' }}>{title as string}</Typography>
                <Typography sx={{ color: muted }}>{copy as string}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1.6, pt: 1 }}>
                  {(items as typeof integrations).map((item) => (
                    <IntegrationPill key={item.name} item={item} />
                  ))}
                </Box>
              </Card>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)' }, gap: 2, mt: 3 }}>
            {[
              ['13+', 'Total Integrations'],
              ['1-Click', 'Setup Time'],
              ['99.9%', 'API Uptime'],
            ].map(([value, label]) => (
              <Card key={label}>
                <Typography sx={{ color: orange, fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800 }}>{value}</Typography>
                <Typography sx={{ color: muted, fontWeight: 700 }}>{label}</Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 9, md: 13 }, bgcolor: '#fff' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            eyebrow="Platform"
            title="Powerful tools for every shipping need"
            copy="From smart routing to NDR management - everything a modern D2C brand needs under one roof."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {platformTools.map((tool) => (
              <Card key={tool.title}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: alpha(orange, 0.08), color: orange, display: 'grid', placeItems: 'center', fontSize: 24 }}>
                  {tool.icon}
                </Box>
                <Typography sx={{ color: ink, fontWeight: 800, fontSize: '1.12rem' }}>{tool.title}</Typography>
                <Typography sx={{ color: muted, lineHeight: 1.65 }}>{tool.text}</Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="blogs" component="section" sx={{ py: { xs: 9, md: 13 }, bgcolor: page }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by 1.5 Lakh+ businesses"
            copy="Don't just take our word for it - hear from sellers who transformed their shipping."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {testimonials.map((item) => (
              <Card key={item.name}>
                <Typography sx={{ color: ink, lineHeight: 1.75, fontSize: '1rem' }}>"{item.quote}"</Typography>
                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ pt: 1 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: purple, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                    {item.initial}
                  </Box>
                  <Box>
                    <Typography sx={{ color: ink, fontWeight: 800 }}>{item.name}</Typography>
                    <Typography sx={{ color: muted, fontSize: '0.88rem' }}>{item.role}</Typography>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 9, md: 13 }, bgcolor: '#fff' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <SectionHeading
            eyebrow="FAQs"
            title="Frequently Asked Questions"
            copy="Everything you need to know about our shipping and logistics services."
          />
          <Stack spacing={1.4}>
            {faqs.map((faq, index) => (
              <Box
                key={faq}
                component="button"
                type="button"
                sx={{
                  width: '100%',
                  border: `1px solid ${border}`,
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  px: { xs: 2, sm: 2.5 },
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: ink,
                  textAlign: 'left',
                }}
              >
                <Typography sx={{ color: muted, fontWeight: 800 }}>{String(index + 1).padStart(2, '0')}</Typography>
                <Typography sx={{ flex: 1, fontWeight: 800 }}>{faq}</Typography>
                <FiChevronDown />
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      <DarkBand sx={{ py: { xs: 9, md: 13 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Stack component={motion.div} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
            <Typography component="h2" sx={{ color: '#fff', fontSize: { xs: '2.5rem', sm: '3.4rem', lg: '4.2rem' }, lineHeight: 1.04, fontWeight: 800 }}>
              Ready to transform
              <Box component="span" sx={{ display: 'block' }}>
                your shipping?
              </Box>
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.58), fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.7, maxWidth: 620 }}>
              Join 1.5 Lakh+ businesses already shipping smarter with {brandIdentity.name}. Set up your account in under 5 minutes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
              <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight />} sx={{ minHeight: 54, px: 4, borderRadius: '8px', bgcolor: orange, fontWeight: 800, '&:hover': { bgcolor: '#ea580c' } }}>
                Start Shipping Free
              </Button>
              <Button component={RouterLink} to="/platform" variant="outlined" sx={{ minHeight: 54, px: 4, borderRadius: '8px', borderColor: alpha('#fff', 0.2), color: '#fff', fontWeight: 800, '&:hover': { bgcolor: alpha('#fff', 0.08), borderColor: alpha('#fff', 0.36) } }}>
                Explore Platform
              </Button>
            </Stack>
          </Stack>
        </Container>
      </DarkBand>

      <PublicFooter />
    </Box>
  )
}
