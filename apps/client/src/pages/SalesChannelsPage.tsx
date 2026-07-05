import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import {
  FiArrowRight,
  FiBox,
  FiLayers,
  FiRefreshCw,
  FiRepeat,
  FiShoppingBag,
} from 'react-icons/fi'
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

const channels = [
  {
    name: 'Amazon',
    color: '#ff9900',
    logo: '/logo/integrations/amazon.png',
    description:
      'Sync Amazon Seller Central orders automatically. Manage FBA and FBM shipments from one place.',
    tags: ['Auto order import', 'FBA/FBM support', 'Returns sync', 'Inventory update'],
  },
  {
    name: 'Flipkart',
    color: '#2874f0',
    mark: (
      <Box
        sx={{
          width: 43,
          height: 43,
          borderRadius: '50%',
          bgcolor: '#ffe600',
          color: '#2874f0',
          display: 'grid',
          placeItems: 'center',
          fontSize: 33,
          fontWeight: 1000,
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        f
      </Box>
    ),
    description:
      'Connect your Flipkart seller account for seamless order sync, label generation, and dispatch.',
    tags: ['One-click connect', 'Smart dispatch', 'SLA tracking', 'Auto manifest'],
  },
  {
    name: 'Shopify',
    color: '#95bf47',
    logo: '/logo/integrations/shopify.webp',
    description:
      'Install our Shopify app and start shipping within minutes. Full order lifecycle management.',
    tags: ['Shopify app', 'Order webhooks', 'Tracking page', 'Discount rates'],
  },
  {
    name: 'WooCommerce',
    color: '#96588a',
    logo: '/logo/integrations/woocommerce.webp',
    description:
      'WordPress + WooCommerce integration with a simple plugin. Works with all major themes.',
    tags: ['WP plugin', 'REST API sync', 'Custom fields', 'Multi-site ready'],
  },
  {
    name: 'Magento',
    color: '#ff5c16',
    logo: '/logo/integrations/magento.png',
    description:
      'Enterprise-grade Magento integration for high-volume stores with complex fulfillment needs.',
    tags: ['Magento 2 extension', 'Multi-store', 'Custom workflows', 'Bulk import'],
  },
  {
    name: 'OpenCart',
    color: '#35bde9',
    mark: (
      <Box
        sx={{
          width: 43,
          height: 43,
          borderRadius: '10px',
          color: '#35bde9',
          display: 'grid',
          placeItems: 'center',
          fontSize: 29,
        }}
      >
        <FiShoppingBag />
      </Box>
    ),
    description:
      'Lightweight OpenCart module for quick setup. Sync orders and manage shipments effortlessly.',
    tags: ['Quick install', 'Order auto-sync', 'Shipping calculator', 'Status updates'],
  },
]

const benefits = [
  {
    title: 'Automatic Order Sync',
    description:
      "New orders flow into your Ship Aggregator dashboard the moment they're placed &mdash; zero manual work.",
    icon: <FiRefreshCw />,
  },
  {
    title: 'Real-Time Inventory',
    description: 'Stock levels sync across every channel instantly, preventing overselling and stock-outs.',
    icon: <FiLayers />,
  },
  {
    title: 'Bulk Processing',
    description:
      'Process hundreds of orders in minutes with one-click label generation and manifest creation.',
    icon: <FiBox />,
  },
  {
    title: 'Returns Management',
    description:
      'Handle returns from all channels in one unified view with automated reverse logistics.',
    icon: <FiRepeat />,
  },
]

const steps = [
  {
    title: 'Select Channel',
    description: 'Choose from our supported sales channels and click connect.',
  },
  {
    title: 'Authorize Access',
    description: 'Securely authorize Ship Aggregator to sync your orders and inventory.',
  },
  {
    title: 'Start Shipping',
    description: "Orders start flowing in automatically. You're ready to ship!",
  },
]

function HighlightText({
  children,
  color = '#7867f3',
}: {
  children: ReactNode
  color?: string
}) {
  return <Box component="span" sx={{ color }}>{children}</Box>
}

function PillBadge({
  label,
  tone = 'purple',
}: {
  label: string
  tone?: 'purple' | 'orange'
}) {
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
        boxShadow: '0 14px 30px rgba(249, 115, 22, 0.28)',
        '&:hover': {
          bgcolor: '#ea580c',
          boxShadow: '0 14px 30px rgba(249, 115, 22, 0.28)',
        },
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      {children}
    </Button>
  )
}

function OutlineButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
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
        '&:hover': {
          borderColor: alpha('#7867f3', 0.32),
          bgcolor: alpha('#7867f3', 0.04),
        },
        width: { xs: '100%', sm: 'auto' },
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
        '&:hover': {
          borderColor: alpha('#fff', 0.34),
          bgcolor: alpha('#fff', 0.06),
        },
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      {children}
    </Button>
  )
}

function SectionHeading({
  badge,
  title,
  highlight,
  highlightColor = '#7867f3',
  subtitle,
  badgeTone = 'purple',
}: {
  badge: string
  title: string
  highlight: string
  highlightColor?: string
  subtitle: string
  badgeTone?: 'purple' | 'orange'
}) {
  const beforeHighlight = title.split(highlight)[0]
  const afterHighlight = title.split(highlight)[1] ?? ''

  return (
    <Stack alignItems="center" textAlign="center" spacing={2.2}>
      <PillBadge label={badge} tone={badgeTone} />
      <Typography
        variant="h2"
        sx={{
          color: '#0f172a',
          fontSize: { xs: '2rem', sm: '2.6rem', md: '3.25rem', lg: '3.55rem' },
          lineHeight: { xs: 1.12, md: 1.05 },
          fontWeight: 950,
          letterSpacing: 0,
          maxWidth: { xs: 340, sm: 720, md: 1050 },
          overflowWrap: 'break-word',
        }}
      >
        {beforeHighlight}
        <HighlightText color={highlightColor}>{highlight}</HighlightText>
        {afterHighlight}
      </Typography>
      <Typography
        sx={{
          color: '#64748b',
          fontSize: { xs: '1.02rem', md: '1.35rem' },
          lineHeight: 1.45,
          maxWidth: { xs: 340, sm: 720, md: 850 },
        }}
      >
        {subtitle}
      </Typography>
    </Stack>
  )
}

function ChannelCard({ channel, index }: { channel: (typeof channels)[number]; index: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 332,
        p: { xs: 3, md: 4.2 },
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
          bgcolor: channel.color,
        },
      }}
    >
      <Stack spacing={3.1} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={2.1} alignItems="center">
          {channel.logo ? (
            <Box
              component="img"
              src={channel.logo}
              alt=""
              sx={{
                width: 43,
                height: 43,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          ) : (
            channel.mark
          )}
          <Typography
            component="h3"
            sx={{
              color: '#06122d',
              fontSize: { xs: '1.35rem', md: '1.52rem' },
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            {channel.name}
          </Typography>
        </Stack>

        <Typography sx={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.55 }}>
          {channel.description}
        </Typography>

        <Stack direction="row" gap={1.1} flexWrap="wrap" sx={{ mt: 'auto' }}>
          {channel.tags.map((tag) => (
            <Box
              key={tag}
              component="span"
              sx={{
                px: 1.4,
                py: 0.62,
                borderRadius: '8px',
                border: `1px solid ${alpha('#0f172a', 0.08)}`,
                bgcolor: '#fff',
                color: '#06122d',
                fontSize: '0.86rem',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {tag}
            </Box>
          ))}
        </Stack>
      </Stack>
    </MotionBox>
  )
}

function BenefitCard({ item, index }: { item: (typeof benefits)[number]; index: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
      sx={{
        p: { xs: 3.1, md: 4.1 },
        minHeight: 166,
        borderRadius: '16px',
        bgcolor: '#fff',
        border: `1px solid ${alpha('#0f172a', 0.08)}`,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '62px 1fr' },
        gap: { xs: 2, sm: 2.4 },
        alignItems: 'start',
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '16px',
          bgcolor: alpha('#7867f3', 0.1),
          color: '#6c5ce7',
          display: 'grid',
          placeItems: 'center',
          fontSize: 28,
        }}
      >
        {item.icon}
      </Box>
      <Box>
        <Typography
          component="h3"
          sx={{ color: '#06122d', fontSize: '1.32rem', fontWeight: 900, mb: 1.2 }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{ color: '#64748b', fontSize: '1.02rem', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      </Box>
    </MotionBox>
  )
}

export default function SalesChannelsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const scrollToChannels = () => {
    document.getElementById('channels')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', color: '#0f172a', overflowX: 'hidden' }}>
      <PublicNavbar solid primaryLabel="Go to Dashboard" primaryTo="/dashboard" />

      <Box
        component="main"
        sx={{
          bgcolor: '#fff',
          pt: { xs: 15, md: 20, lg: 23 },
          pb: { xs: 11, md: 20, lg: 25 },
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
              <PillBadge label="Sales Channels" />
              <Typography
                variant="h1"
                sx={{
                  color: '#0f172a',
                  fontSize: { xs: '2.35rem', sm: '3.2rem', md: '4.1rem', lg: '4.35rem' },
                  lineHeight: { xs: 1.08, md: 0.99 },
                  fontWeight: 950,
                  letterSpacing: 0,
                  maxWidth: { xs: 340, sm: 760, md: 1120 },
                  overflowWrap: 'break-word',
                }}
              >
                <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
                  Connect
                  <br />
                  <Box component="span" sx={{ color: '#7867f3' }}>
                    Every Sales
                  </Box>
                  <br />
                  <Box component="span" sx={{ color: '#7867f3' }}>
                    Channel
                  </Box>
                  <br />
                  in One Click
                </Box>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Connect <HighlightText>Every Sales Channel</HighlightText> in One Click
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: { xs: '1rem', md: '1.34rem' },
                  lineHeight: 1.45,
                  maxWidth: { xs: 340, sm: 720, md: 940 },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Automatically sync orders from Amazon, Flipkart, Shopify, and more. No manual data
                  entry, no missed orders &mdash; ever.
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Automatically sync orders from Amazon, Flipkart, Shopify, and more. No manual data
                  entry, no missed orders &mdash; ever.
                </Box>
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.8}
                justifyContent="center"
                sx={{ pt: 2.1, width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: 340, sm: 'none' } }}
              >
                <PrimaryButton to="/signup">Get Started Free</PrimaryButton>
                <OutlineButton onClick={scrollToChannels}>View All Integrations</OutlineButton>
              </Stack>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      <Box
        id="channels"
        component="section"
        sx={{ bgcolor: '#fff', pt: { xs: 9, md: 10.5 }, pb: { xs: 10, md: 14 } }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            badge="Supported Channels"
            badgeTone="orange"
            title="Sell anywhere, ship from one place"
            highlight="ship from one place"
            highlightColor="#f59e0b"
            subtitle="One-click integrations with India's top marketplaces and e-commerce platforms."
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4, xl: 4.5 },
              mt: { xs: 7, md: 9 },
            }}
          >
            {channels.map((channel, index) => (
              <ChannelCard key={channel.name} channel={channel} index={index} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{ bgcolor: '#f8fafc', pt: { xs: 10, md: 15.5 }, pb: { xs: 10, md: 12.5 } }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            badge="Benefits"
            title="Why sellers love our integrations"
            highlight="integrations"
            subtitle="Spend less time on operations and more time growing your business."
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              gap: { xs: 3, md: 4 },
              mt: { xs: 6.5, md: 8.5 },
            }}
          >
            {benefits.map((item, index) => (
              <BenefitCard key={item.title} item={item} index={index} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{ bgcolor: '#fff', pt: { xs: 10, md: 12 }, pb: { xs: 10, md: 13 } }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <SectionHeading
            badge="How It Works"
            badgeTone="orange"
            title="Go live in 3 easy steps"
            highlight="3 easy steps"
            highlightColor="#f59e0b"
            subtitle=""
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 6, md: 7 },
              mt: { xs: 7, md: 9 },
            }}
          >
            {steps.map((step, index) => (
              <Stack key={step.title} alignItems="center" textAlign="center" spacing={2.6}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 950,
                    background: 'linear-gradient(135deg, #7867f3 0%, #f97316 100%)',
                    boxShadow: '0 14px 30px rgba(249, 115, 22, 0.22)',
                  }}
                >
                  {index + 1}
                </Box>
                <Box>
                  <Typography
                    component="h3"
                    sx={{
                      color: '#06122d',
                      fontSize: { xs: '1.18rem', md: '1.28rem' },
                      fontWeight: 900,
                      mb: 1.4,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '1.02rem', lineHeight: 1.55 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>

          <Stack alignItems="center" sx={{ mt: { xs: 6, md: 7 } }}>
            <PrimaryButton to="/signup">Connect Your Store</PrimaryButton>
          </Stack>
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
                fontSize: { xs: '2.45rem', md: '4.1rem' },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: 0,
                maxWidth: 800,
              }}
            >
              Ready to connect your sales channels?
            </Typography>
            <Typography
              sx={{
                color: alpha('#fff', 0.66),
                fontSize: { xs: '1.08rem', md: '1.35rem' },
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              Start syncing orders from all your marketplaces in under 5 minutes. No technical setup
              required.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.8}
              justifyContent="center"
              sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
            >
              <PrimaryButton to="/signup">Start Free Trial</PrimaryButton>
              <DarkOutlineButton to="/integrations/courier-partners">View Courier Partners</DarkOutlineButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  )
}
