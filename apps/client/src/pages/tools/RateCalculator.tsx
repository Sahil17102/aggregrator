import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaPlane, FaTruck } from 'react-icons/fa'
import {
  FiArrowRight,
  FiBox,
  FiBriefcase,
  FiPackage,
  FiZap,
} from 'react-icons/fi'
import { TbRulerMeasure, TbScale } from 'react-icons/tb'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import type { Courier } from '../../components/CourierRateCard'
import PublicFooter from '../../components/public/PublicFooter'
import PublicNavbar from '../../components/public/PublicNavbar'
import { useAvailableCouriersMutation } from '../../hooks/Integrations/useCouriers'
import { usePincodeLookup } from '../../hooks/User/usePincodeLookup'
import { brand, brandGradients } from '../../theme/brand'
import { defaultLogo } from '../../utils/constants'
import { getCourierDisplayName, getCourierLogo } from '../../utils/courierDisplay'
import { kgToGrams, MIN_B2C_CHARGEABLE_WEIGHT_GRAMS } from '../../utils/weight'

type MovementType = 'forward' | 'return'

type RateCalculatorFormValues = {
  movementType: MovementType
  pickupPincode: string
  pickupCity: string
  pickupState: string
  deliveryPincode: string
  deliveryCity: string
  deliveryState: string
  paymentType: 'prepaid' | 'cod'
  length: string
  breadth: string
  height: string
  weight: string
  orderAmount: string
}

interface RateCalculatorProps {
  publicView?: 'rate' | 'weight'
}

const defaultFormValues: RateCalculatorFormValues = {
  movementType: 'forward',
  pickupPincode: '',
  pickupCity: '',
  pickupState: '',
  deliveryPincode: '',
  deliveryCity: '',
  deliveryState: '',
  paymentType: 'prepaid',
  length: '',
  breadth: '',
  height: '',
  weight: '',
  orderAmount: '',
}

const ui = {
  ink: brand.ink,
  muted: brand.inkSoft,
  accent: brand.accent,
  accentDark: '#D96200',
  success: '#1B9A55',
  line: alpha(brand.ink, 0.1),
  panelShadow: '0 16px 34px rgba(15, 44, 67, 0.08)',
  softAccent: alpha(brand.accent, 0.1),
  softNavy: alpha(brand.ink, 0.055),
}

const publicColors = {
  ink: '#0f172a',
  muted: '#667895',
  purple: '#7867f3',
  orange: '#f97316',
  amber: '#f59e0b',
  page: '#f8fafc',
  line: '#e6eaf2',
  navy: '#0f172a',
  navy2: '#17154a',
}

const dottedLightBackground = `
  radial-gradient(circle, rgba(120, 103, 243, 0.12) 1px, transparent 1px),
  linear-gradient(180deg, #fbfcff 0%, #ffffff 100%)
`

const dottedDarkBackground = `
  radial-gradient(circle, rgba(120, 103, 243, 0.34) 1px, transparent 1.2px),
  linear-gradient(120deg, ${publicColors.navy} 0%, #11183f 48%, ${publicColors.navy2} 100%)
`

const publicCardSx = {
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  minWidth: 0,
  borderRadius: '18px',
  border: `1px solid ${publicColors.line}`,
  bgcolor: '#ffffff',
  boxShadow: '0 22px 42px rgba(15, 23, 42, 0.14)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    background: `linear-gradient(90deg, ${publicColors.purple} 0%, ${publicColors.orange} 50%, ${publicColors.purple} 100%)`,
  },
}

const estimatorInputSx = {
  '& .MuiOutlinedInput-root': {
    height: 60,
    borderRadius: '18px',
    bgcolor: '#f8fafc',
    color: publicColors.ink,
    fontSize: '1rem',
    fontWeight: 700,
    '& fieldset': {
      borderColor: '#e3e8f2',
      borderWidth: 1.5,
    },
    '&:hover fieldset': {
      borderColor: alpha(publicColors.purple, 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: publicColors.purple,
      borderWidth: 1.5,
    },
  },
  '& input::placeholder': {
    color: '#8393b1',
    opacity: 1,
    fontWeight: 600,
  },
}

const estimatorLabelSx = {
  mb: 1,
  color: '#52627d',
  fontSize: '0.92rem',
  fontWeight: 700,
}

const metricBoxSx = {
  p: 2,
  borderRadius: '14px',
  border: `1px solid ${alpha(publicColors.purple, 0.16)}`,
  bgcolor: alpha(publicColors.purple, 0.055),
}

export const cardStyles = {
  borderRadius: '34px',
  border: `1px solid ${alpha(brand.ink, 0.08)}`,
  background: brandGradients.surface,
  boxShadow: '0 18px 36px rgba(68, 92, 138, 0.1)',
}

const panelSx = {
  borderRadius: '12px',
  border: `1px solid ${ui.line}`,
  background: '#FFFFFF',
  boxShadow: ui.panelShadow,
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    height: 44,
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    fontWeight: 600,
    '& fieldset': {
      borderColor: ui.line,
    },
    '&:hover fieldset': {
      borderColor: alpha(ui.accent, 0.48),
    },
    '&.Mui-focused fieldset': {
      borderColor: ui.accent,
      borderWidth: 1.5,
    },
  },
  '& .MuiInputBase-input': {
    px: 1.45,
    py: 1,
    color: ui.ink,
  },
  '& .MuiFormHelperText-root': {
    ml: 0,
    mt: 0.45,
    fontSize: '0.7rem',
    fontWeight: 600,
  },
}

const highlightedInputSx = {
  ...inputSx,
  '& .MuiOutlinedInput-root': {
    ...inputSx['& .MuiOutlinedInput-root'],
    backgroundColor: alpha(brand.sky, 0.46),
  },
}

const formatLocation = (city?: string, state?: string, pincode?: string) => {
  const location = [city, state].filter(Boolean).join(', ')
  return location || pincode || '-'
}

const toNumber = (value: unknown) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const formatAmount = (value: number) =>
  value.toLocaleString('en-IN', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })

const formatWeightKg = (value: unknown) => {
  const numeric = toNumber(value)
  if (!numeric) return '-'
  const kg = numeric > 20 ? numeric / 1000 : numeric
  return `${kg.toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg`
}

const getCompactCourierName = (courier: Courier) => getCourierDisplayName(courier)

const getCompactCourierMode = (courier: Courier) => {
  const text = [
    courier.localRates?.forward?.mode,
    courier.name,
    courier.displayName,
    courier.serviceProvider,
    courier.service_provider,
    courier.integration_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return text.includes('air') || text.includes('express') ? 'air' : 'surface'
}

const getCompactFreight = (courier: Courier) => {
  const forward = courier.localRates?.forward
  return toNumber(
    courier.rate ??
      courier.seller_freight_charge ??
      courier.final_freight_charge ??
      courier.platform_rate ??
      forward?.rate,
  )
}

const getCompactCod = (courier: Courier) => toNumber(courier.localRates?.forward?.cod_charges)

const getZoneChipLabel = (courier: Courier) => {
  const courierWithZone = courier as Courier & {
    zone?: string | { code?: string | null; name?: string | null } | null
    zone_code?: string | null
    zone_name?: string | null
    pricing_zone?: string | null
    pricingZone?: string | null
    delivery_location?: string | null
  }
  const zone = (courier.approxZone || courierWithZone.zone) as
    | string
    | { code?: string | null; name?: string | null }
    | null
    | undefined
  const pricingZone = String(courierWithZone.pricing_zone || courierWithZone.pricingZone || '').trim()
  const deliveryLocation = String(courierWithZone.delivery_location || '').trim()

  if (typeof zone === 'string') {
    return zone.trim() || pricingZone || deliveryLocation || 'Not returned'
  }

  const code = String(zone?.code || courierWithZone.zone_code || '').trim()
  const name = String(zone?.name || courierWithZone.zone_name || '').trim()

  if (code && name) return `${code} - ${name}`
  if (code || name) return code || name
  if (pricingZone) return pricingZone
  if (deliveryLocation) return deliveryLocation
  if (courier.special_zone) return 'Special Zone'
  return 'Not returned'
}

function PublicSectionBadge({ label, dotColor = publicColors.purple }: { label: string; dotColor?: string }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.8,
        py: 0.8,
        borderRadius: '999px',
        bgcolor: alpha(dotColor, 0.1),
        color: dotColor,
        fontSize: '0.92rem',
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
      {label}
    </Box>
  )
}

function CalculatorInput({
  label,
  name,
  placeholder,
  endLabel,
  icon,
  register,
}: {
  label: string
  name: keyof Pick<RateCalculatorFormValues, 'length' | 'breadth' | 'height' | 'weight'>
  placeholder: string
  endLabel: string
  icon: ReactNode
  register: ReturnType<typeof useForm<RateCalculatorFormValues>>['register']
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={estimatorLabelSx}>{label}</Typography>
      <TextField
        type="number"
        placeholder={placeholder}
        {...register(name)}
        fullWidth
        inputProps={{ min: 0, step: name === 'weight' ? 0.1 : 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ color: '#70809b', display: 'flex', fontSize: 21 }}>{icon}</Box>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Typography sx={{ color: '#52627d', fontSize: '0.9rem', fontWeight: 700 }}>
                {endLabel}
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={estimatorInputSx}
      />
    </Box>
  )
}

function BreakdownMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={metricBoxSx}>
      <Typography sx={{ color: publicColors.muted, fontSize: '0.82rem', fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          color: highlight ? publicColors.orange : publicColors.ink,
          fontSize: { xs: '1.55rem', sm: '1.85rem' },
          fontWeight: 900,
          lineHeight: 1.05,
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function TipCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <Stack
      direction="row"
      spacing={2.3}
      sx={{
        minHeight: 153,
        p: { xs: 2.5, md: 3 },
        borderRadius: '18px',
        border: `1px solid ${publicColors.line}`,
        bgcolor: '#ffffff',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: '18px',
          bgcolor: alpha(publicColors.orange, 0.1),
          color: publicColors.orange,
          display: 'grid',
          placeItems: 'center',
          fontSize: 23,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: '#020617', fontSize: '1.18rem', fontWeight: 900, lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 1, color: '#61718e', fontSize: '1rem', lineHeight: 1.55, fontWeight: 500 }}>
          {text}
        </Typography>
      </Box>
    </Stack>
  )
}

export function RateCalculator({ publicView }: RateCalculatorProps) {
  const isPublic = Boolean(publicView)
  const navigate = useNavigate()
  const { mutateAsync, isPending, isError, error } = useAvailableCouriersMutation()
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([])
  const [hasCalculated, setHasCalculated] = useState(false)

  const methods = useForm<RateCalculatorFormValues>({
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  })

  const {
    watch,
    setValue,
    setError,
    clearErrors,
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const pickupPincode = watch('pickupPincode')
  const deliveryPincode = watch('deliveryPincode')
  const watchedLength = watch('length')
  const watchedBreadth = watch('breadth')
  const watchedHeight = watch('height')
  const watchedWeight = watch('weight')
  const watchedPaymentType = watch('paymentType')
  const watchedMovementType = watch('movementType')
  const watchedOrderAmount = watch('orderAmount')
  const pickupLocationLabel = formatLocation(watch('pickupCity'), watch('pickupState'), pickupPincode)
  const deliveryLocationLabel = formatLocation(
    watch('deliveryCity'),
    watch('deliveryState'),
    deliveryPincode,
  )
  const routeZoneLabel = useMemo(() => {
    if (!availableCouriers.length) return hasCalculated ? 'No rates found' : 'Calculate first'

    const returnedZones = availableCouriers
      .map(getZoneChipLabel)
      .filter((label) => label && label !== 'Not returned')
    const uniqueZones = Array.from(new Set(returnedZones))

    if (uniqueZones.length === 1) return uniqueZones[0]
    if (uniqueZones.length > 1) return 'Multiple zones'
    return 'Not returned'
  }, [availableCouriers, hasCalculated])

  usePincodeLookup(pickupPincode, 'pickup', setValue, setError, clearErrors)
  usePincodeLookup(deliveryPincode, 'delivery', setValue, setError, clearErrors)

  const clientMetrics = useMemo(() => {
    const length = toNumber(watchedLength)
    const breadth = toNumber(watchedBreadth)
    const height = toNumber(watchedHeight)
    const actualWeightGrams = kgToGrams(toNumber(watchedWeight))
    const volumetricWeightGrams = Math.round(((length * breadth * height) / 5000) * 1000)
    const applicableWeightGrams = Math.max(
      actualWeightGrams,
      volumetricWeightGrams,
      MIN_B2C_CHARGEABLE_WEIGHT_GRAMS,
    )

    return {
      volumetricWeightKg: (volumetricWeightGrams / 1000).toFixed(2),
      applicableWeightKg: (applicableWeightGrams / 1000).toFixed(2),
      applicableWeightGrams,
    }
  }, [watchedBreadth, watchedHeight, watchedLength, watchedWeight])

  const onSubmit = async (formData: RateCalculatorFormValues) => {
    try {
      const length = toNumber(formData.length)
      const breadth = toNumber(formData.breadth)
      const height = toNumber(formData.height)
      const shipmentValue = formData.paymentType === 'cod' ? toNumber(formData.orderAmount) : 0

      const result = await mutateAsync({
        pickupPincode: formData.pickupPincode,
        deliveryPincode: formData.deliveryPincode,
        weight: clientMetrics.applicableWeightGrams,
        cod: formData.paymentType === 'cod' ? Math.max(shipmentValue, 1) : 0,
        length,
        breadth,
        height,
        orderAmount: shipmentValue > 0 ? shipmentValue : undefined,
        codChargeBasis: Math.max(shipmentValue, 0),
        shipmentType: 'b2c',
        payment_type: formData.paymentType,
        context: 'rate_calculator',
        useGuest: isPublic,
      })

      setAvailableCouriers((result ?? []) as Courier[])
      setHasCalculated(true)
    } catch (err) {
      setAvailableCouriers([])
      setHasCalculated(true)
      console.error('Failed fetching couriers:', err)
    }
  }

  const handleReset = () => {
    methods.reset(defaultFormValues)
    setAvailableCouriers([])
    setHasCalculated(false)
  }

  const optionSx = (selected: boolean) => ({
    flex: 1,
    minHeight: 46,
    px: 1.35,
    borderRadius: '8px',
    border: `1.5px solid ${selected ? ui.accent : ui.line}`,
    bgcolor: selected ? ui.softAccent : '#FFFFFF',
    color: selected ? ui.accentDark : ui.ink,
    fontWeight: 800,
    justifyContent: 'flex-start',
    textTransform: 'none',
    boxShadow: selected ? `0 0 0 1px ${alpha(ui.accent, 0.08)}` : 'none',
    '&:hover': {
      borderColor: ui.accent,
      bgcolor: selected ? ui.softAccent : alpha(ui.accent, 0.055),
    },
  })

  const renderRadioDot = (selected: boolean) => (
    <Box
      sx={{
        width: 18,
        height: 18,
        mr: 1,
        borderRadius: '50%',
        border: `1.5px solid ${selected ? ui.accent : alpha(ui.ink, 0.55)}`,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {selected ? <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ui.accent }} /> : null}
    </Box>
  )

  const renderLocationChip = (label: string) => (
    <Box
      sx={{
        mt: 0.7,
        minHeight: 39,
        px: 1.15,
        py: 0.75,
        borderRadius: '7px',
        bgcolor: alpha(ui.accent, 0.08),
        color: ui.accentDark,
        display: 'flex',
        alignItems: 'center',
        gap: 0.6,
        fontSize: '0.72rem',
        fontWeight: 900,
        lineHeight: 1.25,
      }}
    >
      <Box component="span">{label}</Box>
    </Box>
  )

  const renderMoney = (value: number, color = ui.success, showZero = false) => (
    <Typography sx={{ fontSize: '0.86rem', fontWeight: 900, color, whiteSpace: 'nowrap' }}>
      {value > 0 || showZero ? (
        <>
          <Box component="span">&#8377;</Box>
          {formatAmount(value)}
        </>
      ) : (
        'N/A'
      )}
    </Typography>
  )

  const resultsGridColumns = {
    xs: 'minmax(112px, 1.5fr) 38px 64px minmax(60px, 0.7fr) 66px 52px',
    sm: 'minmax(132px, 1.5fr) 44px 72px minmax(70px, 0.72fr) 76px 58px',
  }

  const handleViewRateCard = () => {
    if (!isPublic) navigate('/tools/rate_card')
  }

  const hasEstimatorCalculation =
    toNumber(watchedLength) > 0 &&
    toNumber(watchedBreadth) > 0 &&
    toNumber(watchedHeight) > 0 &&
    toNumber(watchedWeight) > 0
  const actualWeightKg = toNumber(watchedWeight)
  const volumetricWeightKg = toNumber(clientMetrics.volumetricWeightKg)
  const chargeableWeightKg = hasEstimatorCalculation
    ? Math.max(actualWeightKg, volumetricWeightKg, 0.5)
    : 0

  const publicWeightEstimator = (
    <Box sx={{ bgcolor: publicColors.page, minHeight: '100vh', overflowX: 'hidden' }}>
      <PublicNavbar solid primaryLabel="Go to Dashboard" primaryTo="/dashboard" />
      <Box component="main">
        <Box
          id="calculator"
          component="section"
          sx={{
            pt: { xs: 14, md: 18.5, lg: 23 },
            pb: { xs: 8, md: 13, lg: 17 },
            textAlign: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: dottedLightBackground,
            backgroundSize: '34px 34px, auto',
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
            <PublicSectionBadge label="Weight Estimator" />
            <Typography
              component="h1"
              sx={{
                mt: 3.5,
                color: publicColors.ink,
                mx: 'auto',
                maxWidth: 1040,
                fontSize: { xs: '1.82rem', sm: '3.45rem', lg: '4rem' },
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: 0,
              }}
            >
              Calculate Your{' '}
              <Box component="span" sx={{ color: publicColors.purple, display: { xs: 'block', sm: 'inline' } }}>
                Shipping Weight
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2.7,
                mx: 'auto',
                maxWidth: { xs: 330, sm: 820 },
                px: { xs: 1, sm: 0 },
                color: '#667895',
                fontSize: { xs: '1.08rem', md: '1.36rem' },
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Couriers charge based on the higher of actual weight vs volumetric weight. Use
              this tool to find your chargeable weight before shipping.
            </Typography>
          </Container>
        </Box>

        <Box
          component="section"
          sx={{
            bgcolor: publicColors.page,
            pt: { xs: 6, md: 10, lg: 15.5 },
            pb: { xs: 10, md: 15, lg: 19 },
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
            <Grid
              container
              spacing={{ xs: 3, lg: 5.5 }}
              sx={{
                maxWidth: 1220,
                width: '100%',
                mx: 'auto',
                alignItems: 'stretch',
                '& > .MuiGrid-root': { minWidth: 0 },
              }}
            >
              <Grid size={{ xs: 12, lg: 6 }}>
                <Box sx={{ ...publicCardSx, minHeight: { xs: 420, md: 372 }, p: { xs: 3, md: 4 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '16px',
                        bgcolor: alpha(publicColors.purple, 0.08),
                        color: publicColors.purple,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 24,
                      }}
                    >
                      <TbScale />
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#020617', fontSize: '1.35rem', fontWeight: 900 }}>
                        Package Dimensions
                      </Typography>
                      <Typography sx={{ mt: 0.25, color: publicColors.muted, fontWeight: 600 }}>
                        All fields required for calculation
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CalculatorInput
                        label="Length"
                        name="length"
                        placeholder="0"
                        endLabel="cm"
                        icon={<TbRulerMeasure />}
                        register={register}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CalculatorInput
                        label="Width"
                        name="breadth"
                        placeholder="0"
                        endLabel="cm"
                        icon={<TbRulerMeasure />}
                        register={register}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CalculatorInput
                        label="Height"
                        name="height"
                        placeholder="0"
                        endLabel="cm"
                        icon={<FiBox />}
                        register={register}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <CalculatorInput
                      label="Actual Weight"
                      name="weight"
                      placeholder="e.g. 0.5"
                      endLabel="kg"
                      icon={<FiBriefcase />}
                      register={register}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Box sx={{ ...publicCardSx, minHeight: { xs: 360, md: 372 }, p: { xs: 3, md: 4 } }}>
                  <Typography sx={{ color: '#020617', fontSize: '1.35rem', fontWeight: 900 }}>
                    Weight Breakdown
                  </Typography>

                  {hasEstimatorCalculation ? (
                    <Stack spacing={2.2} sx={{ mt: 4 }}>
                      <BreakdownMetric
                        label="Actual Weight"
                        value={`${actualWeightKg.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })} kg`}
                      />
                      <BreakdownMetric
                        label="Volumetric Weight"
                        value={`${volumetricWeightKg.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })} kg`}
                      />
                      <BreakdownMetric
                        label="Chargeable Weight"
                        value={`${chargeableWeightKg.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })} kg`}
                        highlight
                      />
                    </Stack>
                  ) : (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                      sx={{ minHeight: 250, color: publicColors.muted, px: 3 }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '20px',
                          bgcolor: '#fafbfe',
                          color: publicColors.ink,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 42,
                          mb: 2.7,
                        }}
                      >
                        <TbScale />
                      </Box>
                      <Typography sx={{ maxWidth: 480, color: '#52627d', fontWeight: 600, lineHeight: 1.45 }}>
                        Enter package dimensions and weight on the left to see
                        your chargeable weight instantly.
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box id="tips" sx={{ mt: { xs: 11, md: 18, lg: 25 }, textAlign: 'center' }}>
              <PublicSectionBadge label="Pro Tips" dotColor={publicColors.orange} />
              <Typography
                component="h2"
                sx={{
                  mt: 2.6,
                  color: publicColors.ink,
                  fontSize: { xs: '2.1rem', sm: '2.9rem' },
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: 0,
                }}
              >
                Reduce your{' '}
                <Box component="span" sx={{ color: publicColors.orange }}>
                  shipping weight
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  mx: 'auto',
                  maxWidth: 720,
                  color: publicColors.muted,
                  fontSize: { xs: '1rem', md: '1.18rem' },
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Small packaging optimizations can save you thousands in shipping costs
                every month.
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2.5, lg: 5 }} sx={{ mt: { xs: 6, md: 8.5 }, maxWidth: 1380, mx: 'auto' }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TipCard
                  icon={<FiPackage />}
                  title="Use the right box size"
                  text="Avoid oversized boxes - they increase volumetric weight and cost more. Trim packaging to fit snugly."
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TipCard
                  icon={<TbRulerMeasure />}
                  title="Measure accurately"
                  text="Measure the longest, widest, and tallest points of the packed box. Round up to the nearest centimeter."
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TipCard
                  icon={<FiBriefcase />}
                  title="Weigh after packing"
                  text="Always weigh your package after adding padding, bubble wrap, and the outer box to get the actual weight."
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <TipCard
                  icon={<FiZap />}
                  title="Consider lightweight materials"
                  text="Switch to lighter packaging materials like poly mailers for non-fragile items to save on shipping."
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box
          id="cta"
          component="section"
          sx={{
            color: '#ffffff',
            backgroundColor: publicColors.navy,
            backgroundImage: dottedDarkBackground,
            backgroundSize: '35px 35px, auto',
            pt: { xs: 9, md: 13.5 },
            pb: { xs: 9, md: 12 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography
              component="h2"
              sx={{
                color: '#ffffff',
                fontSize: { xs: '2.4rem', md: '3.8rem' },
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: 0,
              }}
            >
              Ready to optimize
              <br />
              your shipping costs?
            </Typography>
            <Typography
              sx={{
                mt: 3,
                color: alpha('#ffffff', 0.62),
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              Join 1.5 Lakh+ businesses using Ship Aggregator to ship
              smarter and cheaper across India.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.4}
              justifyContent="center"
              sx={{ mt: 5.5 }}
            >
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                endIcon={<FiArrowRight />}
                sx={{
                  minHeight: 66,
                  px: 4,
                  borderRadius: '14px',
                  bgcolor: publicColors.orange,
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 900,
                  boxShadow: '0 18px 34px rgba(249, 115, 22, 0.28)',
                  '&:hover': { bgcolor: '#ea580c', boxShadow: '0 18px 34px rgba(249, 115, 22, 0.28)' },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                component={RouterLink}
                to="/resources/rate-calculator"
                variant="outlined"
                sx={{
                  minHeight: 66,
                  px: 4,
                  borderRadius: '14px',
                  color: '#ffffff',
                  borderColor: alpha('#ffffff', 0.18),
                  bgcolor: 'transparent',
                  fontSize: '1rem',
                  fontWeight: 900,
                  '&:hover': {
                    borderColor: alpha('#ffffff', 0.32),
                    bgcolor: alpha('#ffffff', 0.06),
                  },
                }}
              >
                Compare Rates
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
      <PublicFooter />
    </Box>
  )

  if (isPublic && publicView === 'weight') return publicWeightEstimator

  const calculatorPanel = (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 1340,
          mx: 'auto',
          px: { xs: 0, lg: 1 },
          pt: { xs: 1.2, md: 2.1 },
          pb: { xs: 2, md: 2.8 },
          color: ui.ink,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 2.15 }}
        >
          <Box>
            <Typography sx={{ fontSize: '1.32rem', fontWeight: 900, color: ui.ink, lineHeight: 1.1 }}>
              Rate Calculator
            </Typography>
            <Typography sx={{ mt: 0.45, fontSize: '0.95rem', color: ui.muted, fontWeight: 500 }}>
              Calculate shipping rates for your shipments
            </Typography>
          </Box>
          {!isPublic && (
            <Button
              variant="outlined"
              onClick={handleViewRateCard}
              sx={{
                minHeight: 38,
                px: 1.6,
                borderRadius: '8px',
                color: ui.accentDark,
                borderColor: alpha(ui.accent, 0.32),
                bgcolor: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 800,
                '&:hover': {
                  borderColor: ui.accent,
                  bgcolor: alpha(ui.accent, 0.06),
                },
              }}
            >
              View Rate Card
            </Button>
          )}
        </Stack>

        <Grid container spacing={{ xs: 1.8, lg: 2.2 }}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ ...panelSx, p: { xs: 2, md: 2.6 }, minHeight: { lg: 655 } }}>
              <Stack spacing={1.95}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ color: ui.accent, display: 'flex' }}>
                    <TbScale size={20} />
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: ui.ink }}>
                    Shipment Details
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                    Shipment Type
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => setValue('movementType', 'forward')}
                      sx={optionSx(watchedMovementType === 'forward')}
                    >
                      {renderRadioDot(watchedMovementType === 'forward')}
                      Forward
                    </Button>
                    <Button
                      onClick={() => setValue('movementType', 'return')}
                      sx={optionSx(watchedMovementType === 'return')}
                    >
                      {renderRadioDot(watchedMovementType === 'return')}
                      Return
                    </Button>
                  </Stack>
                </Stack>

                <Grid container spacing={1.1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ mb: 0.75, fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                      Pickup Pincode
                    </Typography>
                    <TextField
                      {...register('pickupPincode', {
                        required: 'Pickup pincode is required',
                        pattern: {
                          value: /^[1-9][0-9]{5}$/,
                          message: 'Enter a valid 6-digit pincode',
                        },
                      })}
                      fullWidth
                      error={!!errors.pickupPincode}
                      helperText={errors.pickupPincode?.message}
                      sx={highlightedInputSx}
                    />
                    {renderLocationChip(pickupLocationLabel)}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ mb: 0.75, fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                      Delivery Pincode
                    </Typography>
                    <TextField
                      {...register('deliveryPincode', {
                        required: 'Delivery pincode is required',
                        pattern: {
                          value: /^[1-9][0-9]{5}$/,
                          message: 'Enter a valid 6-digit pincode',
                        },
                      })}
                      fullWidth
                      error={!!errors.deliveryPincode}
                      helperText={errors.deliveryPincode?.message}
                      sx={inputSx}
                    />
                    {renderLocationChip(deliveryLocationLabel)}
                  </Grid>
                </Grid>

                <Stack spacing={0.7}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                    Actual Weight (KG)
                  </Typography>
                  <TextField
                    type="number"
                    {...register('weight', {
                      required: 'Actual weight is required',
                      min: { value: 0.1, message: 'Weight must be greater than 0' },
                    })}
                    fullWidth
                    error={!!errors.weight}
                    helperText={errors.weight?.message || 'Minimum chargeable weight is 0.5kg'}
                    sx={inputSx}
                  />
                </Stack>

                <Stack spacing={0.9}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                    Dimensions (cm)
                  </Typography>
                  <Grid container spacing={1.05}>
                    {[
                      { name: 'length' as const, label: 'Length is required' },
                      { name: 'breadth' as const, label: 'Breadth is required' },
                      { name: 'height' as const, label: 'Height is required' },
                    ].map((field) => (
                      <Grid key={field.name} size={{ xs: 12, sm: 4 }}>
                        <TextField
                          type="number"
                          {...register(field.name, {
                            required: field.label,
                            min: { value: 1, message: 'Must be greater than 0' },
                          })}
                          fullWidth
                          error={!!errors[field.name]}
                          helperText={String(errors[field.name]?.message || '')}
                          sx={inputSx}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>

                <Grid
                  container
                  spacing={1}
                  sx={{
                    p: 1.35,
                    borderRadius: '8px',
                    border: `1px solid ${alpha(ui.accent, 0.16)}`,
                    bgcolor: ui.softAccent,
                  }}
                >
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: ui.muted }}>
                      Volumetric Weight
                    </Typography>
                    <Typography sx={{ mt: 0.45, fontSize: '0.98rem', fontWeight: 900, color: ui.ink }}>
                      {clientMetrics.volumetricWeightKg} KG
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: ui.muted }}>
                      Applicable Weight
                    </Typography>
                    <Typography sx={{ mt: 0.45, fontSize: '0.98rem', fontWeight: 900, color: ui.accentDark }}>
                      {clientMetrics.applicableWeightKg} KG
                    </Typography>
                  </Grid>
                </Grid>

                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                    Payment Type
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => {
                        setValue('paymentType', 'prepaid')
                        clearErrors('orderAmount')
                      }}
                      sx={optionSx(watchedPaymentType === 'prepaid')}
                    >
                      {renderRadioDot(watchedPaymentType === 'prepaid')}
                      Prepaid
                    </Button>
                    <Button
                      onClick={() => setValue('paymentType', 'cod')}
                      sx={optionSx(watchedPaymentType === 'cod')}
                    >
                      {renderRadioDot(watchedPaymentType === 'cod')}
                      COD
                    </Button>
                  </Stack>
                </Stack>

                <Stack spacing={0.7}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: ui.ink }}>
                      Shipment Value
                    </Typography>
                    <Typography
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '999px',
                        bgcolor: watchedPaymentType === 'cod' ? alpha(ui.accent, 0.14) : alpha(ui.muted, 0.1),
                        color: watchedPaymentType === 'cod' ? ui.accentDark : ui.muted,
                        fontSize: '0.64rem',
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Required for COD
                    </Typography>
                  </Stack>
                  <TextField
                    type="number"
                    placeholder="Enter shipment value"
                    {...register('orderAmount', {
                      validate: (value) =>
                        watchedPaymentType !== 'cod' ||
                        toNumber(value) > 0 ||
                        'Shipment value is required for COD',
                    })}
                    fullWidth
                    error={!!errors.orderAmount}
                    helperText={
                      errors.orderAmount?.message ||
                      (watchedPaymentType === 'cod'
                        ? watchedOrderAmount
                          ? `COD charge basis: Rs. ${formatAmount(toNumber(watchedOrderAmount))}`
                          : 'Enter the invoice/shipment value to calculate exact COD charges.'
                        : 'Used when COD is selected; prepaid calculations ignore this value.')
                    }
                    inputProps={{ min: 1, step: 1 }}
                    sx={watchedPaymentType === 'cod' ? highlightedInputSx : inputSx}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.05}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isPending}
                    sx={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 900,
                      bgcolor: ui.accent,
                      boxShadow: `0 12px 20px ${alpha(ui.accent, 0.26)}`,
                      '&:hover': { bgcolor: ui.accentDark },
                    }}
                  >
                    {isPending ? 'Calculating...' : 'Calculate Rates'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                      width: { xs: '100%', sm: 88 },
                      minHeight: 48,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 800,
                      color: ui.muted,
                      borderColor: ui.line,
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ ...panelSx, p: { xs: 2, md: 2.6 }, minHeight: { lg: 655 } }}>
              <Stack spacing={2.15}>
                <Box
                  sx={{
                    p: 1.9,
                    borderRadius: '10px',
                    border: `1px solid ${alpha(ui.accent, 0.16)}`,
                    bgcolor: ui.softAccent,
                  }}
                >
                  <Stack>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={0.8}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        sx={{ mb: 1.3 }}
                      >
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: ui.ink }}>
                          Route Information
                        </Typography>
                        <Box
                          title={`Pricing zone: ${routeZoneLabel}`}
                          sx={{
                            px: 0.9,
                            py: 0.45,
                            borderRadius: '999px',
                            bgcolor:
                              ['Calculate first', 'No rates found', 'Not returned'].includes(routeZoneLabel)
                                ? alpha(ui.muted, 0.1)
                                : alpha(ui.accent, 0.16),
                            color:
                              ['Calculate first', 'No rates found', 'Not returned'].includes(routeZoneLabel)
                                ? ui.muted
                                : ui.accentDark,
                            border: `1px solid ${
                              ['Calculate first', 'No rates found', 'Not returned'].includes(routeZoneLabel)
                                ? alpha(ui.muted, 0.18)
                                : alpha(ui.accent, 0.22)
                            }`,
                            fontSize: '0.68rem',
                            fontWeight: 900,
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Zone: {routeZoneLabel}
                        </Box>
                      </Stack>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: ui.muted }}>
                            Pickup
                          </Typography>
                          <Typography sx={{ mt: 0.2, fontSize: '0.82rem', fontWeight: 900, color: ui.ink, lineHeight: 1.25 }}>
                            {pickupLocationLabel}
                          </Typography>
                        </Grid>
                        <Grid
                          size={{ xs: 12, sm: 6 }}
                          sx={{
                            borderLeft: { sm: `1px solid ${alpha(ui.accent, 0.16)}` },
                            pl: { sm: 1.2 },
                          }}
                        >
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: ui.muted }}>
                            Delivery
                          </Typography>
                          <Typography sx={{ mt: 0.2, fontSize: '0.82rem', fontWeight: 900, color: ui.ink, lineHeight: 1.25 }}>
                            {deliveryLocationLabel}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: ui.ink }}>
                      Rate Card Results
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: '0.76rem', color: ui.muted, fontWeight: 600 }}>
                      Courier pricing, zone, freight, and COD charge from the active rate card.
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ width: '100%', overflow: 'hidden' }}>
                  <Box sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: resultsGridColumns,
                        columnGap: 0.75,
                        px: 1,
                        pb: 1,
                        color: ui.muted,
                        fontSize: '0.64rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                      }}
                    >
                      <Box>Courier</Box>
                      <Box>Mode</Box>
                      <Box>Weight</Box>
                      <Box>Zone</Box>
                      <Box>Rate</Box>
                      <Box>COD</Box>
                    </Box>

                    {isPending ? (
                      <Stack alignItems="center" justifyContent="center" sx={{ py: 5, color: ui.muted }}>
                        <CircularProgress size={22} />
                        <Typography sx={{ mt: 1, fontSize: '0.82rem', fontWeight: 700 }}>
                          Loading available couriers...
                        </Typography>
                      </Stack>
                    ) : availableCouriers.length ? (
                      <Stack spacing={1}>
                        {availableCouriers.map((courier, index) => {
                          const displayName = getCompactCourierName(courier)
                          const mode = getCompactCourierMode(courier)
                          const zoneLabel = getZoneChipLabel(courier)
                          const logo = getCourierLogo(courier, defaultLogo)
                          const hasLogo = Boolean(logo && logo !== defaultLogo)
                          const freight = getCompactFreight(courier)
                          const cod = getCompactCod(courier)

                          return (
                            <Box
                              key={courier.id || `${displayName}-${index}`}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: resultsGridColumns,
                                columnGap: 0.75,
                                alignItems: 'center',
                                minHeight: 58,
                                px: 1,
                                bgcolor: '#F5F6F8',
                                borderBottom: `1px solid ${alpha(ui.ink, 0.04)}`,
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1.1} sx={{ minWidth: 0 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: '#FFFFFF',
                                    color: ui.muted,
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '0.62rem',
                                    fontWeight: 900,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                  }}
                                >
                                  {hasLogo ? (
                                    <Box
                                      component="img"
                                      src={logo}
                                      alt={displayName}
                                      sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.25 }}
                                    />
                                  ) : (
                                    'DEL'
                                  )}
                                </Box>
                                <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                                  <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#273044' }}>
                                    {displayName}
                                  </Typography>
                                </Stack>
                              </Stack>
                              <Box sx={{ color: mode === 'air' ? ui.accentDark : '#68707E', display: 'flex' }}>
                                {mode === 'air' ? <FaPlane size={18} /> : <FaTruck size={18} />}
                              </Box>
                              <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#273044' }}>
                                {formatWeightKg(courier.chargeable_weight)}
                              </Typography>
                              <Box
                                title={`Pricing zone: ${zoneLabel}`}
                                sx={{
                                  justifySelf: 'start',
                                  maxWidth: 82,
                                  px: 0.7,
                                  py: 0.35,
                                  borderRadius: '999px',
                                  bgcolor:
                                    zoneLabel === 'Not returned'
                                      ? alpha(ui.muted, 0.1)
                                      : alpha(ui.accent, 0.14),
                                  color: zoneLabel === 'Not returned' ? ui.muted : ui.accentDark,
                                  border: `1px solid ${
                                    zoneLabel === 'Not returned'
                                      ? alpha(ui.muted, 0.18)
                                      : alpha(ui.accent, 0.2)
                                  }`,
                                  fontSize: '0.62rem',
                                  fontWeight: 900,
                                  lineHeight: 1.15,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {zoneLabel}
                              </Box>
                              {renderMoney(freight)}
                              {renderMoney(cod, '#606570', true)}
                            </Box>
                          )
                        })}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          minHeight: 190,
                          borderRadius: '8px',
                          border: `1px dashed ${alpha(ui.accent, 0.24)}`,
                          display: 'grid',
                          placeItems: 'center',
                          textAlign: 'center',
                          color: ui.muted,
                          px: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700 }}>
                          {hasCalculated
                            ? 'No rate card results were returned for these shipment details. Please recheck the pincodes or try another route.'
                            : 'Enter shipment details and click Calculate Rates to see the rate card results.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {isError ? (
                  <Typography sx={{ color: brand.danger, fontSize: '0.82rem', fontWeight: 700 }}>
                    Failed to fetch couriers: {error?.message ?? 'Unknown error'}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  )

  if (!isPublic) return calculatorPanel

  return (
    <Box>
      <PublicNavbar />
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 }, pb: 8 }}>
        {calculatorPanel}
      </Container>
      <PublicFooter />
    </Box>
  )
}

export default RateCalculator
