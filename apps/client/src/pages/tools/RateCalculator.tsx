import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiRupee } from 'react-icons/bi'
import { FaPlane, FaTruck } from 'react-icons/fa'
import { TbCalculator, TbMapPins, TbScale } from 'react-icons/tb'
import CourierRateCards from '../../components/CourierRateCard'
import BrandSurface from '../../components/brand/BrandSurface'
import PublicFooter from '../../components/public/PublicFooter'
import PublicNavbar from '../../components/public/PublicNavbar'
import B2BRateCalculator from '../../components/tools/B2BRateCalculator'
import B2CRateCalculator from '../../components/tools/B2CRateCalculator'
import CustomIconLoadingButton from '../../components/UI/button/CustomLoadingButton'
import PageHeading from '../../components/UI/heading/PageHeading'
import CustomInput from '../../components/UI/inputs/CustomInput'
import { SmartTabs } from '../../components/UI/tab/Tabs'
import { useAvailableCouriersMutation } from '../../hooks/Integrations/useCouriers'
import { usePaymentOptions } from '../../hooks/usePaymentOptions'
import { usePincodeLookup } from '../../hooks/User/usePincodeLookup'
import { brand, brandGradients } from '../../theme/brand'
import { defaultLogo } from '../../utils/constants'
import { getCourierDisplayName, getCourierLogo } from '../../utils/courierDisplay'
import { kgToGrams, MIN_B2C_CHARGEABLE_WEIGHT_GRAMS } from '../../utils/weight'
import type { Courier } from '../../components/CourierRateCard'

type ShipmentType = 'b2b' | 'b2c'
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
  totalWeight: string
  numberOfBoxes: string
  orderAmount: string
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
  totalWeight: '',
  numberOfBoxes: '',
  orderAmount: '',
}

interface RateCalculatorProps {
  publicView?: 'rate' | 'weight'
}

const compactPanelSx = {
  borderRadius: '14px',
  border: '1px solid rgba(16, 24, 40, 0.08)',
  background: '#FFFFFF',
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)',
}

const compactInputSx = {
  '& .MuiOutlinedInput-root': {
    height: 44,
    borderRadius: '9px',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    fontWeight: 600,
    '& fieldset': {
      borderColor: 'rgba(17, 24, 39, 0.12)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(126, 87, 194, 0.38)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8E3DD0',
      borderWidth: 1.5,
    },
  },
  '& .MuiInputBase-input': {
    py: 1,
    px: 1.45,
    color: '#111827',
  },
  '& .MuiFormHelperText-root': {
    ml: 0,
    mt: 0.45,
    fontSize: '0.7rem',
    fontWeight: 600,
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

const getCompactCourierName = (courier: Courier) =>
  getCourierDisplayName(courier).replace(/^Delivery One/i, 'Delhivery')

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

const termsAndConditions = {
  b2c: [
    'Above shared commercials are exclusive of GST.',
    'Pricing is subject to courier updates or revised commercial terms.',
    'Chargeable weight is whichever is higher between actual and volumetric weight.',
    'Return charges may mirror forward charges where special RTO pricing is not shared.',
    'Fixed COD charge or COD percentage applies, whichever is higher.',
    'Additional charges such as address correction or handling may apply.',
  ],
  b2b: [
    'Above shared commercials are exclusive of GST.',
    'Pricing is subject to courier updates or revised commercial terms.',
    'Chargeable weight is whichever is higher between actual and volumetric weight.',
    'Additional charges such as address correction or handling may apply.',
    'Prohibited items should not be shipped through the platform.',
    'Delhivery B2B volumetric formula: (L x B x H / 27000) x CFT.',
  ],
}

export const cardStyles = {
  borderRadius: '34px',
  border: `1px solid ${alpha(brand.ink, 0.08)}`,
  background: brandGradients.surface,
  boxShadow: '0 18px 36px rgba(68, 92, 138, 0.1)',
}

export function RateCalculator({ publicView }: RateCalculatorProps) {
  const { mutateAsync, isPending, isError, error } = useAvailableCouriersMutation()
  const couriersRef = useRef<HTMLDivElement | null>(null)
  const [shipmentType, setShipmentType] = useState<ShipmentType>('b2c')
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([])
  const { data: paymentOptions } = usePaymentOptions()
  const isPublic = Boolean(publicView)
  const heading =
    publicView === 'weight'
      ? {
          eyebrow: 'Weight Calculator',
          title: 'Volumetric and chargeable weight made simple.',
          subtitle:
            'Use the same live courier-lookup logic while focusing on dimensions, applicable weight, and shipment economics.',
          icon: <TbScale size={18} />,
        }
      : {
          eyebrow: isPublic ? 'Rate Calculator' : 'Tools Panel',
          title: 'Compare shipping prices and courier availability instantly.',
          subtitle:
            'Estimate charges, compare courier availability, and validate shipment economics in a cleaner utility panel without changing the current calculator logic.',
          icon: <TbCalculator size={18} />,
        }

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

  const loadingPickup = usePincodeLookup(pickupPincode, 'pickup', setValue, setError, clearErrors)
  const loadingDelivery = usePincodeLookup(
    deliveryPincode,
    'delivery',
    setValue,
    setError,
    clearErrors,
  )

  const onSubmit = async (formData: RateCalculatorFormValues) => {
    try {
      const length = Number(formData.length) || 0
      const breadth = Number(formData.breadth) || 0
      const height = Number(formData.height) || 0
      const actualWeightKg = Number(formData.weight) || 0
      const volumetricWeightGrams = ((length * breadth * height) / 5000) * 1000
      const actualWeightGrams = kgToGrams(actualWeightKg)
      const applicableWeightGrams = Math.max(
        actualWeightGrams,
        Math.round(volumetricWeightGrams),
        MIN_B2C_CHARGEABLE_WEIGHT_GRAMS,
      )
      const orderAmountValue = Number(formData.orderAmount || 0)

      const payload = {
        pickupPincode: formData.pickupPincode,
        deliveryPincode: formData.deliveryPincode,
        weight: applicableWeightGrams,
        cod: formData.paymentType === 'cod' ? Math.max(orderAmountValue, 1) : 0,
        length,
        breadth,
        height,
        orderAmount: orderAmountValue > 0 ? orderAmountValue : undefined,
        codChargeBasis: Math.max(orderAmountValue, 0),
        shipmentType,
        payment_type: formData.paymentType,
        context: 'rate_calculator',
        useGuest: isPublic,
      }

      const result = await mutateAsync(payload)
      setAvailableCouriers((result ?? []) as Courier[])
    } catch (err) {
      setAvailableCouriers([])
      console.error('Failed fetching couriers:', err)
    }
  }

  useEffect(() => {
    if (isPublic && availableCouriers?.length > 0 && couriersRef.current) {
      couriersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [availableCouriers, isPublic])

  useEffect(() => {
    setAvailableCouriers([])
  }, [shipmentType])

  useEffect(() => {
    if (paymentOptions) {
      const currentPaymentType = methods.watch('paymentType')
      const isCurrentEnabled =
        (currentPaymentType === 'cod' && paymentOptions.codEnabled) ||
        (currentPaymentType === 'prepaid' && paymentOptions.prepaidEnabled)

      if (!isCurrentEnabled) {
        if (paymentOptions.codEnabled) {
          methods.setValue('paymentType', 'cod')
        } else if (paymentOptions.prepaidEnabled) {
          methods.setValue('paymentType', 'prepaid')
        }
      }
    }
  }, [paymentOptions, methods])

  const watchedLength = watch('length')
  const watchedBreadth = watch('breadth')
  const watchedHeight = watch('height')
  const watchedWeight = watch('weight')
  const watchedPaymentType = watch('paymentType')
  const watchedMovementType = watch('movementType')
  const pickupLocationLabel = formatLocation(watch('pickupCity'), watch('pickupState'), pickupPincode)
  const deliveryLocationLabel = formatLocation(
    watch('deliveryCity'),
    watch('deliveryState'),
    deliveryPincode,
  )

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
    }
  }, [watchedBreadth, watchedHeight, watchedLength, watchedWeight])

  const handleClientReset = () => {
    methods.reset(defaultFormValues)
    setAvailableCouriers([])
    setShipmentType('b2c')
  }

  const compactOptionSx = (selected: boolean) => ({
    flex: 1,
    minHeight: 46,
    px: 1.35,
    borderRadius: '9px',
    border: `1.5px solid ${selected ? '#9B3FD8' : 'rgba(17, 24, 39, 0.12)'}`,
    bgcolor: selected ? '#F7F0FF' : '#FFFFFF',
    color: selected ? '#7D3FB8' : '#111827',
    fontWeight: 700,
    justifyContent: 'flex-start',
    textTransform: 'none',
    boxShadow: selected ? '0 0 0 1px rgba(155, 63, 216, 0.08)' : 'none',
    '&:hover': {
      borderColor: '#9B3FD8',
      bgcolor: selected ? '#F7F0FF' : '#FBF7FF',
    },
  })

  const renderRadioDot = (selected: boolean) => (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `1.5px solid ${selected ? '#9B3FD8' : '#7C818C'}`,
        display: 'grid',
        placeItems: 'center',
        mr: 1,
        flexShrink: 0,
      }}
    >
      {selected ? (
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#9B3FD8' }} />
      ) : null}
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
        bgcolor: '#F8F2FF',
        color: '#7C4FA4',
        display: 'flex',
        alignItems: 'center',
        gap: 0.6,
        fontSize: '0.72rem',
        fontWeight: 800,
        lineHeight: 1.25,
      }}
    >
      <TbMapPins size={13} />
      <Box component="span">{label}</Box>
    </Box>
  )

  const renderMoney = (value: number, color = '#1B9A55', showZero = false) => (
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

  const clientShell = (
    <FormProvider {...methods}>
      <Box
        sx={{
          px: { xs: 0, lg: 0.5 },
          pt: { xs: 1.2, md: 2.2 },
          pb: { xs: 2, md: 2.8 },
          color: '#111827',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.3} sx={{ mb: 2.15 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '13px',
              background: 'linear-gradient(180deg, #2B68F4 0%, #164BC7 100%)',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 10px 22px rgba(31, 91, 226, 0.32)',
            }}
          >
            <TbCalculator size={25} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.32rem', fontWeight: 900, color: '#171439', lineHeight: 1.1 }}>
              Rate Calculator
            </Typography>
            <Typography sx={{ mt: 0.45, fontSize: '0.95rem', color: '#747385', fontWeight: 500 }}>
              Calculate shipping rates for your shipments
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={{ xs: 1.8, lg: 2.4 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ ...compactPanelSx, p: { xs: 2, md: 2.6 } }}>
              <Stack spacing={1.95}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ color: '#8054C7', display: 'flex' }}>
                    <TbScale size={20} />
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#171439' }}>
                    Shipment Details
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
                    Shipment Type
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => setValue('movementType', 'forward')}
                      sx={compactOptionSx(watchedMovementType === 'forward')}
                    >
                      {renderRadioDot(watchedMovementType === 'forward')}
                      Forward
                    </Button>
                    <Button
                      onClick={() => setValue('movementType', 'return')}
                      sx={compactOptionSx(watchedMovementType === 'return')}
                    >
                      {renderRadioDot(watchedMovementType === 'return')}
                      Return
                    </Button>
                  </Stack>
                </Stack>

                <Grid container spacing={1.1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ mb: 0.75, fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
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
                      sx={{
                        ...compactInputSx,
                        '& .MuiOutlinedInput-root': {
                          ...(compactInputSx['& .MuiOutlinedInput-root'] as object),
                          bgcolor: '#EDF3FF',
                        },
                      }}
                    />
                    {renderLocationChip(pickupLocationLabel)}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ mb: 0.75, fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
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
                      sx={compactInputSx}
                    />
                    {renderLocationChip(deliveryLocationLabel)}
                  </Grid>
                </Grid>

                <Stack spacing={0.7}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
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
                    sx={compactInputSx}
                  />
                </Stack>

                <Stack spacing={0.9}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
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
                          helperText={errors[field.name]?.message}
                          sx={compactInputSx}
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
                    borderRadius: '9px',
                    border: '1px solid rgba(126, 87, 194, 0.14)',
                    bgcolor: '#FAF6FF',
                  }}
                >
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#777083' }}>
                      Volumetric Weight
                    </Typography>
                    <Typography sx={{ mt: 0.45, fontSize: '0.98rem', fontWeight: 900, color: '#171439' }}>
                      {clientMetrics.volumetricWeightKg} KG
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#777083' }}>
                      Applicable Weight
                    </Typography>
                    <Typography sx={{ mt: 0.45, fontSize: '0.98rem', fontWeight: 900, color: '#9B3FD8' }}>
                      {clientMetrics.applicableWeightKg} KG
                    </Typography>
                  </Grid>
                </Grid>

                <Stack spacing={1}>
                  <Typography sx={{ fontSize: '0.79rem', fontWeight: 900, color: '#171439' }}>
                    Payment Type
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {(!paymentOptions || paymentOptions.prepaidEnabled) && (
                      <Button
                        onClick={() => setValue('paymentType', 'prepaid')}
                        sx={compactOptionSx(watchedPaymentType === 'prepaid')}
                      >
                        {renderRadioDot(watchedPaymentType === 'prepaid')}
                        Prepaid
                      </Button>
                    )}
                    {(!paymentOptions || paymentOptions.codEnabled) && (
                      <Button
                        onClick={() => setValue('paymentType', 'cod')}
                        sx={compactOptionSx(watchedPaymentType === 'cod')}
                      >
                        {renderRadioDot(watchedPaymentType === 'cod')}
                        COD
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.05}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isPending}
                    sx={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: '9px',
                      textTransform: 'none',
                      fontWeight: 900,
                      bgcolor: '#CB2F49',
                      boxShadow: '0 12px 20px rgba(203, 47, 73, 0.26)',
                      '&:hover': { bgcolor: '#B72740' },
                    }}
                  >
                    {isPending ? 'Calculating...' : 'Calculate Rates'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClientReset}
                    sx={{
                      width: { xs: '100%', sm: 88 },
                      minHeight: 48,
                      borderRadius: '9px',
                      textTransform: 'none',
                      fontWeight: 800,
                      color: '#6B6477',
                      borderColor: 'rgba(17, 24, 39, 0.12)',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ ...compactPanelSx, p: { xs: 2, md: 2.6 }, minHeight: { lg: 655 } }}>
              <Stack spacing={2.15}>
                <Box
                  sx={{
                    p: 1.9,
                    borderRadius: '11px',
                    border: '1px solid rgba(126, 87, 194, 0.14)',
                    bgcolor: '#FAF6FF',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#FFFFFF',
                        background: 'linear-gradient(180deg, #A04BD8 0%, #7A3BC4 100%)',
                        flexShrink: 0,
                      }}
                    >
                      <TbMapPins size={22} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#171439', mb: 1.3 }}>
                        Route Information
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#777083' }}>
                            Pickup
                          </Typography>
                          <Typography sx={{ mt: 0.2, fontSize: '0.82rem', fontWeight: 900, color: '#171439', lineHeight: 1.25 }}>
                            {pickupLocationLabel}
                          </Typography>
                        </Grid>
                        <Grid
                          size={{ xs: 12, sm: 6 }}
                          sx={{ borderLeft: { sm: '1px solid rgba(126, 87, 194, 0.13)' }, pl: { sm: 1.2 } }}
                        >
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#777083' }}>
                            Delivery
                          </Typography>
                          <Typography sx={{ mt: 0.2, fontSize: '0.82rem', fontWeight: 900, color: '#171439', lineHeight: 1.25 }}>
                            {deliveryLocationLabel}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </Box>

                <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#171439' }}>
                  Available Couriers
                </Typography>

                <Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(150px, 1.7fr) 0.55fr 0.7fr 0.6fr 0.55fr',
                      px: 1,
                      pb: 1,
                      color: '#777083',
                      fontSize: '0.64rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                    }}
                  >
                    <Box>Courier</Box>
                    <Box>Mode</Box>
                    <Box>Weight</Box>
                    <Box>Rate</Box>
                    <Box>COD</Box>
                  </Box>

                  {isPending ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 5, color: '#777083' }}>
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
                        const logo = getCourierLogo(courier, defaultLogo)
                        const showInitials =
                          displayName.toLowerCase().includes('delhivery') ||
                          displayName.toLowerCase().includes('delivery')
                        const freight = getCompactFreight(courier)
                        const cod = getCompactCod(courier)

                        return (
                          <Box
                            key={courier.id || `${displayName}-${index}`}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(150px, 1.7fr) 0.55fr 0.7fr 0.6fr 0.55fr',
                              alignItems: 'center',
                              minHeight: 62,
                              px: 1,
                              bgcolor: '#F5F5F6',
                              borderBottom: '1px solid rgba(17, 24, 39, 0.04)',
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1.1} sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '8px',
                                  bgcolor: showInitials ? '#5F6266' : '#FFFFFF',
                                  color: '#FFFFFF',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: '0.62rem',
                                  fontWeight: 900,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                {showInitials || !logo || logo === defaultLogo ? (
                                  'DEL'
                                ) : (
                                  <Box
                                    component="img"
                                    src={logo}
                                    alt={displayName}
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.35 }}
                                  />
                                )}
                              </Box>
                              <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#273044' }}>
                                {displayName}
                              </Typography>
                            </Stack>
                            <Box sx={{ color: mode === 'air' ? '#C57A17' : '#68707E', display: 'flex' }}>
                              {mode === 'air' ? <FaPlane size={18} /> : <FaTruck size={18} />}
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#273044' }}>
                              {formatWeightKg(courier.chargeable_weight)}
                            </Typography>
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
                        borderRadius: '9px',
                        border: '1px dashed rgba(126, 87, 194, 0.22)',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        color: '#777083',
                        px: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 700 }}>
                        Enter shipment details and calculate to see courier rates.
                      </Typography>
                    </Box>
                  )}
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

  const shell = (
    <Stack spacing={3.2}>
      <PageHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        subtitle={heading.subtitle}
        icon={heading.icon}
      />

      {isPublic ? (
        <BrandSurface
          variant="hero"
          sx={{
            p: { xs: 2.4, md: 3 },
            background: `
              radial-gradient(circle at 100% 0%, rgba(255, 156, 75, 0.18), transparent 24%),
              ${brandGradients.analytics}
            `,
          }}
        >
          <Grid container spacing={1.6}>
            {[
              {
                label: publicView === 'weight' ? 'Chargeable focus' : 'Rate intelligence',
                value: publicView === 'weight' ? '500g minimum' : 'Live courier matrix',
              },
              {
                label: 'Logic preserved',
                value: 'Same hooks and payloads',
              },
              {
                label: 'Seller ready',
                value: 'B2C and B2B supported',
              },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, md: 4 }}>
                <BrandSurface variant="glass" sx={{ p: 1.8, borderRadius: '24px' }}>
                  <Typography sx={{ color: brand.inkSoft, fontSize: '0.8rem', fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ mt: 0.7, color: brand.ink, fontWeight: 800, fontSize: '1.05rem' }}>
                    {item.value}
                  </Typography>
                </BrandSurface>
              </Grid>
            ))}
          </Grid>
        </BrandSurface>
      ) : null}

      <FormProvider {...methods}>
        <BrandSurface variant="card" sx={{ p: { xs: 2.2, md: 2.8 }, ...cardStyles }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.9}>
              <Typography sx={{ color: brand.ink, fontSize: '1.35rem', fontWeight: 800 }}>
                Shipment Details
              </Typography>
              <Typography sx={{ color: brand.inkSoft, lineHeight: 1.72 }}>
                Enter origin, destination, shipment measurements, and payment mode to fetch available couriers.
              </Typography>
            </Stack>

            <SmartTabs
              value={shipmentType}
              onChange={(value) => setShipmentType(value)}
              tabs={[
                { label: 'B2C', value: 'b2c' },
                { label: 'B2B', value: 'b2b' },
              ]}
            />

            <Divider sx={{ borderColor: alpha(brand.ink, 0.08) }} />

            <Grid container spacing={1.6}>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Pickup Pincode"
                  {...register('pickupPincode', {
                    required: 'Pickup pincode is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Enter a valid 6-digit pincode',
                    },
                  })}
                  error={!!errors.pickupPincode}
                  helperText={errors.pickupPincode?.message as string}
                  fullWidth
                  topMargin={false}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Pickup City"
                  {...register('pickupCity')}
                  fullWidth
                  disabled
                  topMargin={false}
                  postfix={loadingPickup ? <CircularProgress size={16} /> : null}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Pickup State"
                  {...register('pickupState')}
                  fullWidth
                  disabled
                  topMargin={false}
                  postfix={loadingPickup ? <CircularProgress size={16} /> : null}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Delivery Pincode"
                  {...register('deliveryPincode', {
                    required: 'Delivery pincode is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Enter a valid 6-digit pincode',
                    },
                  })}
                  error={!!errors.deliveryPincode}
                  helperText={errors.deliveryPincode?.message as string}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Delivery City"
                  {...register('deliveryCity')}
                  fullWidth
                  disabled
                  postfix={loadingDelivery ? <CircularProgress size={16} /> : null}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Delivery State"
                  {...register('deliveryState')}
                  fullWidth
                  disabled
                  postfix={loadingDelivery ? <CircularProgress size={16} /> : null}
                />
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: alpha(brand.ink, 0.08) }} />

            {shipmentType === 'b2c' ? <B2CRateCalculator /> : <B2BRateCalculator />}

            <Divider sx={{ borderColor: alpha(brand.ink, 0.08) }} />

            <Controller
              name="paymentType"
              control={methods.control}
              rules={{ required: 'Please select a payment type' }}
              render={({ field, fieldState }) => (
                <Stack spacing={1.2}>
                  <Typography sx={{ color: brand.ink, fontWeight: 700 }}>Payment Type</Typography>
                  <ToggleButtonGroup
                    value={field.value}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) field.onChange(newValue)
                    }}
                  >
                    {(!paymentOptions || paymentOptions.prepaidEnabled) && (
                      <ToggleButton
                        value="prepaid"
                        sx={{
                          px: 3,
                          py: 1,
                          borderRadius: '999px !important',
                          border: `1px solid ${alpha(brand.ink, 0.12)}`,
                          textTransform: 'none',
                          fontWeight: 700,
                          color: brand.inkSoft,
                          '&.Mui-selected': {
                            background: brandGradients.button,
                            color: '#FFFFFF',
                          },
                        }}
                      >
                        Prepaid
                      </ToggleButton>
                    )}
                    {(!paymentOptions || paymentOptions.codEnabled) && (
                      <ToggleButton
                        value="cod"
                        sx={{
                          px: 3,
                          py: 1,
                          borderRadius: '999px !important',
                          border: `1px solid ${alpha(brand.ink, 0.12)}`,
                          textTransform: 'none',
                          fontWeight: 700,
                          color: brand.inkSoft,
                          '&.Mui-selected': {
                            background: brandGradients.button,
                            color: '#FFFFFF',
                          },
                        }}
                      >
                        COD
                      </ToggleButton>
                    )}
                  </ToggleButtonGroup>
                  {fieldState?.error ? (
                    <Typography sx={{ color: brand.danger, fontSize: '0.82rem' }}>
                      {fieldState.error.message}
                    </Typography>
                  ) : null}
                </Stack>
              )}
            />

            <Grid container spacing={1.6}>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomInput
                  label="Order Amount"
                  type="number"
                  placeholder="Enter shipment value"
                  {...register('orderAmount', {
                    required: 'Order amount is required',
                    min: { value: 1, message: 'Order amount must be at least 1' },
                  })}
                  error={!!errors.orderAmount}
                  helperText={errors.orderAmount?.message as string}
                  fullWidth
                  prefix={<BiRupee />}
                />
              </Grid>
            </Grid>

            <CustomIconLoadingButton
              onClick={handleSubmit(onSubmit)}
              text={publicView === 'weight' ? 'Calculate Weight And Rates' : 'Calculate Shipping Rate'}
              loading={isPending}
              loadingText="Calculating..."
              styles={{
                width: '100%',
                py: 1.5,
                borderRadius: 999,
                background: brandGradients.button,
                color: '#FFFFFF',
                fontWeight: 800,
                boxShadow: '0 18px 36px rgba(255, 122, 21, 0.28)',
              }}
            />
          </Stack>
        </BrandSurface>
      </FormProvider>

      <Box ref={couriersRef}>
        {isPending ? (
          <Typography sx={{ color: brand.inkSoft, textAlign: 'center', py: 1 }}>
            Loading available couriers...
          </Typography>
        ) : null}

        {isError ? (
          <Typography sx={{ color: brand.danger, textAlign: 'center', py: 1 }}>
            Failed to fetch couriers: {error?.message ?? 'Unknown error'}
          </Typography>
        ) : (
          <CourierRateCards
            shipmentType={watch('paymentType')}
            availableCouriers={availableCouriers}
            defaultLogo={defaultLogo}
          />
        )}
      </Box>

      <BrandSurface variant="soft" sx={{ p: { xs: 2.2, md: 2.6 }, borderRadius: '32px' }}>
        <Typography sx={{ color: brand.ink, fontWeight: 800, fontSize: '1.15rem' }}>
          Terms & Conditions ({shipmentType.toUpperCase()})
        </Typography>
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {termsAndConditions[shipmentType].map((term) => (
            <Typography key={term} sx={{ color: brand.inkSoft, lineHeight: 1.72 }}>
              • {term}
            </Typography>
          ))}
        </Stack>
      </BrandSurface>
    </Stack>
  )

  if (!isPublic) return clientShell

  return (
    <Box>
      <PublicNavbar />
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, pb: 8 }}>
        <Box sx={{ pt: { xs: 1.5, md: 3 } }}>{shell}</Box>
      </Container>
      <PublicFooter />
    </Box>
  )
}

export default RateCalculator
