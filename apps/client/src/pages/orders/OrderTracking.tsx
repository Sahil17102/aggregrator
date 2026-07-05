import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  styled,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { FaBoxOpen, FaBuilding, FaShippingFast, FaStore, FaTruck } from 'react-icons/fa'
import { FiArrowRight, FiBox, FiChevronDown, FiHelpCircle, FiSearch } from 'react-icons/fi'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import PublicFooter from '../../components/public/PublicFooter'
import PublicNavbar from '../../components/public/PublicNavbar'
import { useTracking } from '../../hooks/Orders/useTracking'
import { brand, brandGradients } from '../../theme/brand'

const navy = '#0b1028'
const navy2 = '#19154d'
const ink = '#11182d'
const muted = '#667795'
const border = '#e6ebf3'
const page = '#f8fafc'
const purple = '#7867f3'
const orange = '#ff6b16'
const amber = '#f5a313'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.42 },
}

const stages = [
  { label: 'Booked', icon: <FaStore /> },
  { label: 'Pending Pickup', icon: <FaBuilding /> },
  { label: 'In Transit', icon: <FaTruck /> },
  { label: 'Out for Delivery', icon: <FaShippingFast /> },
  { label: 'Delivered', icon: <FaBoxOpen /> },
]

const faqItems = [
  'Where do I find my AWB / tracking number?',
  'How often is tracking information updated?',
  'What if my tracking shows no updates?',
  'Can I track multiple shipments at once?',
]

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  booked: 'Booked',
  manifest_generated: 'Manifest Generated',
  shipment_created: 'Shipment Created',
  pickup_initiated: 'Pickup Initiated',
  PP: 'Pending Pickup',
  IT: 'In Transit',
  OFD: 'Out for Delivery',
  DL: 'Delivered',
  CAN: 'Cancelled',
  RT: 'RTO',
  'RT-IT': 'RTO In Transit',
  'RT-DL': 'RTO Delivered',
  EX: 'Exception',
  ndr: 'NDR',
  rto_initiated: 'RTO Initiated',
  rto_in_transit: 'RTO In Transit',
  rto_delivered: 'RTO Delivered',
}

const normalizeTrackingStatus = (status?: string | null) =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

const formatTrackingStatus = (status?: string | null) => {
  const normalized = normalizeTrackingStatus(status)
  return statusLabels[normalized] || statusLabels[normalized.toUpperCase()] || status || 'Unknown'
}

const formatTrackingDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatTrackingTime = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

const getTrackingTone = (status?: string | null) => {
  const normalized = normalizeTrackingStatus(status)
  if (normalized.includes('deliver')) return { bg: '#DCFCE7', fg: '#166534' }
  if (normalized.includes('transit')) return { bg: '#E0F2FE', fg: '#075985' }
  if (normalized.includes('cancel') || normalized.includes('failed'))
    return { bg: '#FEE2E2', fg: '#991B1B' }
  if (normalized.includes('rto') || normalized.includes('ndr'))
    return { bg: '#FEF3C7', fg: '#92400E' }

  return { bg: '#E7E5E4', fg: '#44403C' }
}

const TrackingConnector = styled(StepConnector)(() => ({
  '&.MuiStepConnector-alternativeLabel': { top: 22 },
  '& .MuiStepConnector-line': {
    height: 4,
    border: 0,
    background: alpha(brand.ink, 0.12),
    borderRadius: 999,
  },
  '&.Mui-active .MuiStepConnector-line': {
    background: brandGradients.button,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    background: brandGradients.button,
  },
}))

function DottedBand({ children }: { children: ReactNode }) {
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
      }}
    >
      {children}
    </Box>
  )
}

function EmptyTrackingState() {
  return (
    <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Stack component={motion.div} {...fadeUp} spacing={2} alignItems="center" textAlign="center">
          <Box sx={{ color: ink, fontSize: 48, display: 'grid', placeItems: 'center' }}>
            <FiBox />
          </Box>
          <Typography component="h2" sx={{ color: ink, fontSize: { xs: '1.65rem', md: '2rem' }, fontWeight: 900 }}>
            Enter a tracking number
          </Typography>
          <Typography sx={{ color: muted, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.6, maxWidth: 560 }}>
            Type your AWB number or order ID in the search box above to see real-time shipment updates from any courier partner.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

function LoadingPanel() {
  return (
    <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: 999,
              border: `6px solid ${alpha(orange, 0.14)}`,
              borderTopColor: orange,
              animation: 'spin 1s linear infinite',
            }}
          />
          <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.3rem' }}>
            Fetching tracking details...
          </Typography>
          <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
        </Stack>
      </Container>
    </Box>
  )
}

function NotFoundPanel({ awb }: { awb: string | null }) {
  return (
    <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Stack
          component={motion.div}
          {...fadeUp}
          spacing={2}
          alignItems="center"
          textAlign="center"
          sx={{ p: { xs: 3, md: 4 }, borderRadius: '18px', border: `1px solid ${border}`, bgcolor: '#fff' }}
        >
          <Box sx={{ color: orange, fontSize: 48, display: 'grid', placeItems: 'center' }}>
            <FiHelpCircle />
          </Box>
          <Typography component="h2" sx={{ color: ink, fontSize: { xs: '1.7rem', md: '2.25rem' }, fontWeight: 900 }}>
            No Shipment Data Found
          </Typography>
          <Typography sx={{ color: muted, lineHeight: 1.7, maxWidth: 540 }}>
            We could not locate any shipment with AWB <strong>{awb || 'provided number'}</strong>. Please check the tracking number and try again.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

function FaqSection() {
  return (
    <Box component="section" sx={{ bgcolor: page, py: { xs: 10, md: 13 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Stack component={motion.div} {...fadeUp} spacing={4.5} alignItems="center" textAlign="center">
          <Stack spacing={1.8} alignItems="center">
            <Typography
              sx={{
                px: 1.8,
                py: 0.55,
                borderRadius: 999,
                bgcolor: alpha(purple, 0.1),
                color: purple,
                fontWeight: 900,
                fontSize: '0.84rem',
              }}
            >
              FAQs
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: ink,
                fontWeight: 900,
                lineHeight: 1.08,
                fontSize: { xs: '2.35rem', md: '3.15rem' },
              }}
            >
              Common{' '}
              <Box component="span" sx={{ color: purple }}>
                tracking questions
              </Box>
            </Typography>
          </Stack>

          <Stack spacing={1.6} sx={{ width: '100%' }}>
            {faqItems.map((item) => (
              <Stack
                key={item}
                direction="row"
                alignItems="center"
                spacing={1.8}
                sx={{
                  minHeight: 72,
                  px: { xs: 2, md: 3 },
                  borderRadius: '18px',
                  bgcolor: '#fff',
                  border: `1px solid ${border}`,
                  textAlign: 'left',
                }}
              >
                <Box sx={{ color: purple, fontSize: 28, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <FiHelpCircle />
                </Box>
                <Typography sx={{ color: ink, fontWeight: 850, fontSize: { xs: '0.98rem', md: '1.05rem' }, flex: 1 }}>
                  {item}
                </Typography>
                <Box sx={{ color: '#53657e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <FiChevronDown />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

function CtaSection() {
  return (
    <DottedBand>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 9, md: 11 } }}>
        <Stack component={motion.section} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
          <Typography component="h2" sx={{ color: '#fff', fontSize: { xs: '2.35rem', md: '3.7rem' }, lineHeight: 1.05, fontWeight: 900 }}>
            Want to track all
            <Box component="span" sx={{ display: 'block' }}>
              shipments in one place?
            </Box>
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.62), fontSize: { xs: '1.05rem', md: '1.18rem' }, lineHeight: 1.6, maxWidth: 660 }}>
            Sign up for the Ship Aggregator dashboard and get a unified tracking view for every order, every courier.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
            <Button component={RouterLink} to="/signup" variant="contained" endIcon={<FiArrowRight />} sx={{ minHeight: 64, px: 4.6, borderRadius: '12px', bgcolor: orange, fontSize: '1rem', fontWeight: 900, boxShadow: '0 16px 34px rgba(249, 115, 22, 0.32)', '&:hover': { bgcolor: '#ea580c' } }}>
              Start Free Trial
            </Button>
            <Button component={RouterLink} to="/platform" variant="outlined" sx={{ minHeight: 64, px: 4.6, borderRadius: '12px', borderColor: alpha('#fff', 0.22), color: '#fff', fontSize: '1rem', fontWeight: 900, '&:hover': { bgcolor: alpha('#fff', 0.08), borderColor: alpha('#fff', 0.38) } }}>
              Explore Platform
            </Button>
          </Stack>
        </Stack>
      </Container>
    </DottedBand>
  )
}

export default function TrackingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const awb = searchParams.get('awb')?.trim() || null
  const order = searchParams.get('orderNumber')?.trim() || null
  const contact = searchParams.get('contact')?.trim() || null
  const hasTrackingQuery = Boolean(awb || (order && contact))
  const [trackingInput, setTrackingInput] = useState(awb || order || '')
  const { data: trackingData, isLoading, error } = useTracking(awb, order, contact)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    setTrackingInput(awb || order || '')
  }, [awb, order])

  const handleTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = trackingInput.trim()
    if (!value) return
    navigate(`/track?awb=${encodeURIComponent(value)}`)
  }

  const renderTrackingDetails = () => {
    if (!hasTrackingQuery) return <EmptyTrackingState />
    if (isLoading) return <LoadingPanel />
    if (error || !trackingData) return <NotFoundPanel awb={awb || order} />

    const trackingMeta = trackingData as typeof trackingData & {
      consignee?: { name?: string; city?: string; pincode?: string }
      weight?: string | number
      dimensions?: string
    }
    const displayAwb = trackingData.awb_number || awb || 'N/A'
    const displayOrderNumber = trackingData.order_number || order || 'N/A'
    const currentStage = Math.max(
      0,
      trackingData.history?.findIndex((h) => {
        const timelineStatus = formatTrackingStatus(h.status_code)
        return normalizeTrackingStatus(timelineStatus) === normalizeTrackingStatus(trackingData.status)
      }) ?? 0,
    )
    const isCancelled = trackingData.status === 'Cancelled'
    const isRTO = trackingData.status?.includes('RTO')

    return (
      <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 8, md: 11 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                <Stack
                  component={motion.div}
                  {...fadeUp}
                  spacing={1.2}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '18px',
                    bgcolor: page,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Typography sx={{ color: orange, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    Shipment status
                  </Typography>
                  <Typography sx={{ color: ink, fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.05 }}>
                    {formatTrackingStatus(trackingData.status)}
                  </Typography>
                  <Typography sx={{ color: muted, lineHeight: 1.7 }}>
                    Live shipment details for AWB {displayAwb}.
                  </Typography>
                </Stack>

                <Stack
                  component={motion.div}
                  {...fadeUp}
                  spacing={3}
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: '18px',
                    bgcolor: '#fff',
                    border: `1px solid ${border}`,
                  }}
                >
                  <Typography sx={{ color: ink, fontWeight: 900, fontSize: '1.25rem' }}>
                    Tracking Timeline
                  </Typography>

                  {!isCancelled && !isRTO ? (
                    <Stepper alternativeLabel activeStep={currentStage} connector={<TrackingConnector />} sx={{ mb: 2 }}>
                      {stages.map((stage, index) => (
                        <Step key={stage.label}>
                          <StepLabel
                            StepIconComponent={() => (
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: index <= currentStage ? orange : alpha(ink, 0.1),
                                  color: index <= currentStage ? '#fff' : muted,
                                }}
                              >
                                {stage.icon}
                              </Box>
                            )}
                          >
                            <Typography sx={{ fontWeight: 800, mt: 1, color: index <= currentStage ? ink : muted, fontSize: '0.8rem' }}>
                              {stage.label}
                            </Typography>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  ) : null}

                  <Stack spacing={1.6}>
                    {trackingData.history?.map((event, index) => {
                      const exactStatus = formatTrackingStatus(event.status_code)
                      const tone = getTrackingTone(event.status_code)
                      const isLatest = index === 0

                      return (
                        <Box
                          key={`${event.event_time}-${index}`}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' },
                            gap: 1.7,
                            p: { xs: 1.8, md: 2.2 },
                            borderRadius: '16px',
                            border: `1px solid ${alpha(ink, 0.08)}`,
                            bgcolor: isLatest ? alpha(orange, 0.04) : '#fff',
                          }}
                        >
                          <Box>
                            <Typography sx={{ color: ink, fontWeight: 900 }}>{formatTrackingDate(event.event_time)}</Typography>
                            <Typography sx={{ color: muted, fontSize: '0.84rem', fontWeight: 700 }}>{formatTrackingTime(event.event_time)}</Typography>
                          </Box>
                          <Box>
                            <Chip
                              label={exactStatus}
                              size="small"
                              sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 800, mb: 1 }}
                            />
                            <Typography sx={{ color: ink, fontWeight: 800, lineHeight: 1.55 }}>
                              {event.message || exactStatus}
                            </Typography>
                            <Typography sx={{ color: muted, mt: 0.7 }}>
                              Location: {event.location || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2.2}>
                {[
                  ['AWB', displayAwb],
                  ['Order Number', displayOrderNumber],
                  ['Estimated Delivery', trackingData.edd || 'To be updated'],
                  ['Recipient', trackingMeta?.consignee?.name || 'Customer'],
                  ['Destination', `${trackingMeta?.consignee?.city || 'N/A'}, ${trackingMeta?.consignee?.pincode || 'N/A'}`],
                  ['Weight', `${trackingMeta?.weight || '0.5'} kg`],
                ].map(([label, value]) => (
                  <Stack
                    key={label}
                    spacing={0.6}
                    sx={{
                      p: 2.3,
                      borderRadius: '16px',
                      bgcolor: '#fff',
                      border: `1px solid ${border}`,
                    }}
                  >
                    <Typography sx={{ color: muted, fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      {label}
                    </Typography>
                    <Typography sx={{ color: ink, fontWeight: 800 }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: ink }}>
      <PublicNavbar solid />

      <Box
        component="main"
        sx={{
          pt: { xs: 15, md: 17 },
          pb: { xs: 10, md: 13 },
          backgroundImage: 'radial-gradient(circle at 12px 12px, rgba(120, 103, 243, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Stack component={motion.section} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }} spacing={3} alignItems="center" textAlign="center">
            <Typography
              sx={{
                px: 1.9,
                py: 0.62,
                borderRadius: 999,
                bgcolor: alpha(orange, 0.1),
                color: orange,
                fontWeight: 900,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: orange }} />
              Track Shipment
            </Typography>

            <Typography
              component="h1"
              sx={{
                color: ink,
                maxWidth: 940,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: 0,
                fontSize: { xs: '3rem', sm: '4.2rem', lg: '5rem' },
              }}
            >
              Track Your Shipment in{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${orange}, ${amber})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Real-Time
              </Box>
            </Typography>

            <Typography sx={{ color: muted, maxWidth: 760, fontSize: { xs: '1.08rem', md: '1.32rem' }, lineHeight: 1.5 }}>
              Enter your AWB number or order ID to get instant tracking updates from any courier partner.
            </Typography>

            <Box
              component="form"
              onSubmit={handleTrack}
              sx={{
                width: '100%',
                maxWidth: 720,
                mt: 2.5,
                p: 1,
                borderRadius: '18px',
                bgcolor: '#fff',
                border: `1px solid ${border}`,
                boxShadow: '0 18px 48px rgba(17, 24, 45, 0.12)',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 136px' },
                gap: 1,
              }}
            >
              <TextField
                value={trackingInput}
                onChange={(event) => setTrackingInput(event.target.value)}
                placeholder="Enter AWB number or Order ID"
                fullWidth
                InputProps={{
                  startAdornment: <FiSearch style={{ marginRight: 10, color: '#667795', fontSize: 24 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: 62,
                    borderRadius: '14px',
                    color: ink,
                    '& fieldset': { border: 'none' },
                  },
                  '& input': { fontSize: '1rem', fontWeight: 650 },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<FiArrowRight />}
                sx={{
                  minHeight: 60,
                  borderRadius: '14px',
                  bgcolor: orange,
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#ea580c', boxShadow: 'none' },
                }}
              >
                Track
              </Button>
            </Box>

            <Typography sx={{ color: muted, fontSize: '0.92rem', fontWeight: 650 }}>
              Supports all major couriers: BlueDart, Delhivery, DTDC, XpressBees & more
            </Typography>
          </Stack>
        </Container>
      </Box>

      {renderTrackingDetails()}
      <FaqSection />
      <CtaSection />
      <PublicFooter />
    </Box>
  )
}
