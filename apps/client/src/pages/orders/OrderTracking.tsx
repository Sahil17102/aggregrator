import {
  alpha,
  Box,
  Chip,
  Container,
  Grid,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  styled,
} from '@mui/material'
import { FaBoxOpen, FaBuilding, FaExclamationTriangle, FaShippingFast, FaStore, FaTruck } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import BrandSurface from '../../components/brand/BrandSurface'
import PublicFooter from '../../components/public/PublicFooter'
import PublicNavbar from '../../components/public/PublicNavbar'
import { useTracking } from '../../hooks/Orders/useTracking'
import { brand, brandGradients } from '../../theme/brand'

const stages = [
  { label: 'Booked', icon: <FaStore /> },
  { label: 'Pending Pickup', icon: <FaBuilding /> },
  { label: 'In Transit', icon: <FaTruck /> },
  { label: 'Out for Delivery', icon: <FaShippingFast /> },
  { label: 'Delivered', icon: <FaBoxOpen /> },
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

export default function TrackingPage() {
  const [searchParams] = useSearchParams()
  const awb = searchParams.get('awb')?.trim() || null
  const order = searchParams.get('orderNumber')?.trim() || null
  const contact = searchParams.get('contact')?.trim() || null
  const { data: trackingData, isLoading, error } = useTracking(awb, order, contact)
  const trackingMeta = trackingData as typeof trackingData & {
    consignee?: { name?: string; city?: string; pincode?: string }
    weight?: string | number
    dimensions?: string
  }
  const displayAwb = trackingData?.awb_number || awb || 'N/A'
  const displayOrderNumber = trackingData?.order_number || order || 'N/A'

  const currentStage =
    Math.max(
      0,
      trackingData?.history?.findIndex((h) => {
      const timelineStatus = formatTrackingStatus(h.status_code)
      return normalizeTrackingStatus(timelineStatus) === normalizeTrackingStatus(trackingData.status)
      }) ?? 0,
    )

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 6 }}>
          <BrandSurface variant="hero" sx={{ minHeight: 420, alignItems: 'center', justifyContent: 'center' }}>
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 82,
                  height: 82,
                  borderRadius: 999,
                  border: `6px solid ${alpha(brand.accent, 0.14)}`,
                  borderTopColor: brand.accent,
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.3rem' }}>
                Fetching tracking details...
              </Typography>
              <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
            </Stack>
          </BrandSurface>
        </Container>
        <PublicFooter />
      </Box>
    )
  }

  if (error || !trackingData) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <PublicNavbar />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 6 }}>
          <BrandSurface variant="card" sx={{ p: { xs: 2.8, md: 4 }, textAlign: 'center', alignItems: 'center' }}>
            <FaExclamationTriangle size={60} color={brand.accent} />
            <Typography sx={{ mt: 2, color: brand.ink, fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.4rem' } }}>
              No Shipment Data Found
            </Typography>
            <Typography sx={{ mt: 1.2, color: brand.inkSoft, lineHeight: 1.8, maxWidth: 520 }}>
              We could not locate any shipment with AWB <strong>{awb}</strong>. Please check the tracking number and try again.
            </Typography>
            <Chip
              label="Back to previous page"
              onClick={() => window.history.back()}
              sx={{
                mt: 2.2,
                px: 1.8,
                py: 2.1,
                borderRadius: 999,
                background: brandGradients.button,
                color: '#FFFFFF',
                fontWeight: 800,
              }}
            />
          </BrandSurface>
        </Container>
        <PublicFooter />
      </Box>
    )
  }

  const isCancelled = trackingData.status === 'Cancelled'
  const isRTO = trackingData.status?.includes('RTO')

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PublicNavbar />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, pb: 8 }}>
        <Stack spacing={3.2} sx={{ pt: { xs: 1.5, md: 3 } }}>
          <BrandSurface
            variant="hero"
            sx={{
              p: { xs: 2.5, md: 3.4 },
              background: `
                radial-gradient(circle at 100% 0%, rgba(255, 156, 75, 0.18), transparent 24%),
                ${brandGradients.analytics}
              `,
            }}
          >
            <Grid container spacing={{ xs: 2.2, md: 3 }} alignItems="center">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Typography sx={{ color: brand.accent, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                  Shipment status
                </Typography>
                <Typography sx={{ mt: 1, color: brand.ink, fontWeight: 900, fontSize: { xs: '2.2rem', md: '3.4rem' }, lineHeight: 0.98, letterSpacing: '-0.05em' }}>
                  {formatTrackingStatus(trackingData.status)}
                </Typography>
                <Typography sx={{ mt: 1.1, color: brand.inkSoft, lineHeight: 1.8 }}>
                  Track every parcel with a clearer public timeline while reusing the current tracking API and history data.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={1.2}>
                  <BrandSurface variant="glass" sx={{ p: 1.8, borderRadius: '24px' }}>
                    <Typography sx={{ color: brand.inkSoft, fontSize: '0.8rem', fontWeight: 700 }}>AWB</Typography>
                    <Typography sx={{ mt: 0.5, color: brand.ink, fontWeight: 800 }}>{displayAwb}</Typography>
                  </BrandSurface>
                  <BrandSurface variant="glass" sx={{ p: 1.8, borderRadius: '24px' }}>
                    <Typography sx={{ color: brand.inkSoft, fontSize: '0.8rem', fontWeight: 700 }}>Order Number</Typography>
                    <Typography sx={{ mt: 0.5, color: brand.ink, fontWeight: 800 }}>{displayOrderNumber}</Typography>
                  </BrandSurface>
                  <BrandSurface variant="glass" sx={{ p: 1.8, borderRadius: '24px' }}>
                    <Typography sx={{ color: brand.inkSoft, fontSize: '0.8rem', fontWeight: 700 }}>Estimated Delivery</Typography>
                    <Typography sx={{ mt: 0.5, color: brand.ink, fontWeight: 800 }}>{trackingData.edd || 'To be updated'}</Typography>
                  </BrandSurface>
                </Stack>
              </Grid>
            </Grid>
          </BrandSurface>

          <Grid container spacing={2.2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <BrandSurface variant="card" sx={{ p: { xs: 2.2, md: 3 }, borderRadius: '32px' }}>
                <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.25rem', mb: 3 }}>
                  Tracking Timeline
                </Typography>

                {!isCancelled && !isRTO ? (
                  <Stepper alternativeLabel activeStep={currentStage} connector={<TrackingConnector />} sx={{ mb: 5 }}>
                    {stages.map((stage, index) => (
                      <Step key={stage.label}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: index <= currentStage ? brand.accent : alpha(brand.ink, 0.12),
                                color: index <= currentStage ? '#FFFFFF' : brand.inkSoft,
                                boxShadow: index <= currentStage ? '0 16px 28px rgba(255,122,21,0.22)' : 'none',
                              }}
                            >
                              {stage.icon}
                            </Box>
                          )}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              mt: 1.5,
                              color: index <= currentStage ? brand.ink : brand.inkSoft,
                              fontSize: '0.82rem',
                            }}
                          >
                            {stage.label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                ) : (
                  <BrandSurface
                    variant="soft"
                    sx={{
                      p: 2.4,
                      borderRadius: '24px',
                      mb: 4,
                      background: alpha(brand.accent, 0.08),
                      border: `1px solid ${alpha(brand.accent, 0.22)}`,
                    }}
                  >
                    <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.05rem' }}>
                      {isCancelled ? 'Order Cancelled' : 'RTO Initiated'}
                    </Typography>
                  </BrandSurface>
                )}

                <Stack spacing={1.8}>
                  {trackingData.history?.map((event, index) => {
                    const exactStatus = formatTrackingStatus(event.status_code)
                    const tone = getTrackingTone(event.status_code)
                    const isLatest = index === 0

                    return (
                      <Box
                        key={`${event.event_time}-${index}`}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '150px 24px 1fr' },
                          gap: { xs: 1.2, sm: 1.6 },
                          p: { xs: 1.8, md: 2.2 },
                          borderRadius: '24px',
                          border: `1px solid ${alpha(brand.ink, 0.08)}`,
                          bgcolor: isLatest ? alpha(brand.accent, 0.04) : '#FFFFFF',
                          boxShadow: '0 10px 22px rgba(68, 92, 138, 0.06)',
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'column' },
                            alignItems: { xs: 'center', sm: 'flex-end' },
                            justifyContent: { xs: 'space-between', sm: 'center' },
                            gap: 0.6,
                          }}
                        >
                          <Typography sx={{ color: brand.ink, fontWeight: 900, fontSize: '0.95rem', textAlign: { xs: 'left', sm: 'right' } }}>
                            {formatTrackingDate(event.event_time)}
                          </Typography>
                          <Typography sx={{ color: brand.inkSoft, fontSize: '0.82rem', fontWeight: 700, textAlign: { xs: 'right', sm: 'right' } }}>
                            {formatTrackingTime(event.event_time)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: { xs: 'none', sm: 'flex' },
                            justifyContent: 'center',
                            pt: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              bgcolor: isLatest ? brand.accent : alpha(brand.ink, 0.2),
                              boxShadow: isLatest ? '0 0 0 6px rgba(255,122,21,0.12)' : 'none',
                              position: 'relative',
                            }}
                          >
                            {index < (trackingData.history?.length ?? 0) - 1 ? (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 5,
                                  top: 12,
                                  bottom: -28,
                                  width: 2,
                                  bgcolor: alpha(brand.ink, 0.08),
                                }}
                              />
                            ) : null}
                          </Box>
                        </Box>

                        <Box sx={{ pb: 0.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={exactStatus}
                              size="small"
                              sx={{
                                bgcolor: tone.bg,
                                color: tone.fg,
                                fontWeight: 800,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                            <Typography sx={{ color: brand.inkSoft, fontSize: '0.78rem', fontWeight: 700 }}>
                              Exact Status
                            </Typography>
                          </Stack>

                          <Typography sx={{ color: brand.ink, fontWeight: 800, mt: 0.8, lineHeight: 1.6 }}>
                            {event.message || exactStatus}
                          </Typography>

                          <Typography sx={{ color: brand.inkSoft, mt: 0.8, lineHeight: 1.6 }}>
                            <strong style={{ color: brand.ink }}>Location:</strong> {event.location || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              </BrandSurface>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2.2}>
                <BrandSurface variant="card" sx={{ p: 2.4, borderRadius: '30px' }}>
                  <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.05rem', mb: 2 }}>
                    Consignee Info
                  </Typography>
                  <Stack spacing={1.4}>
                    <Box>
                      <Typography sx={{ color: brand.inkSoft, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                        Recipient
                      </Typography>
                      <Typography sx={{ color: brand.ink, fontWeight: 700, mt: 0.45 }}>
                        {trackingMeta?.consignee?.name || 'Customer'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: brand.inkSoft, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                        Destination
                      </Typography>
                      <Typography sx={{ color: brand.ink, mt: 0.45 }}>
                        {trackingMeta?.consignee?.city || 'N/A'}, {trackingMeta?.consignee?.pincode || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </BrandSurface>

                <BrandSurface variant="card" sx={{ p: 2.4, borderRadius: '30px' }}>
                  <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.05rem', mb: 2 }}>
                    Shipment Content
                  </Typography>
                  <Stack spacing={1.4}>
                    <Box>
                      <Typography sx={{ color: brand.inkSoft, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                        Weight
                      </Typography>
                      <Typography sx={{ color: brand.ink, fontWeight: 700, mt: 0.45 }}>
                        {trackingMeta?.weight || '0.5'} kg
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: brand.inkSoft, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                        Dimensions
                      </Typography>
                      <Typography sx={{ color: brand.ink, mt: 0.45 }}>
                        {trackingMeta?.dimensions || trackingData.shipment_info || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </BrandSurface>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <PublicFooter />
    </Box>
  )
}
