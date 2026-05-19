import { courierLogos, defaultLogo } from './constants'

type CourierLike =
  | string
  | null
  | undefined
  | {
      name?: string | null
      courier_name?: string | null
      id?: string | number | null
      courier_id?: string | number | null
      courierId?: string | number | null
      displayName?: string | null
      serviceProvider?: string | null
      service_provider?: string | null
      integration_type?: string | null
      provider?: string | null
      mode?: string | null
      shipping_mode?: string | null
      service_type?: string | null
    }

const DELIVERY_ONE_DISPLAY_NAME = 'Delivery One'
const DELIVERY_ONE_SURFACE_DISPLAY_NAME = 'Delivery One Surface'
const DELIVERY_ONE_EXPRESS_DISPLAY_NAME = 'Delivery One Express'
const DELIVERY_ONE_LOGO = '/logo/integrations/delhivery-one.webp'
const DELIVERY_ONE_SURFACE_ID = 99
const DELIVERY_ONE_EXPRESS_ID = 100

const normalizeToken = (value?: string | null) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const getCourierValues = (courier: CourierLike) => {
  if (typeof courier === 'string') return [courier]
  if (!courier) return []

  return [
    courier.displayName,
    courier.courier_name,
    courier.name,
    courier.serviceProvider,
    courier.service_provider,
    courier.integration_type,
    courier.provider,
    courier.mode,
    courier.shipping_mode,
    courier.service_type,
  ].filter(Boolean) as string[]
}

const isDeliveryOneValue = (value?: string | null) => {
  const normalized = normalizeToken(value)
  return (
    normalized === 'deliveryone' ||
    normalized === 'delivery1' ||
    normalized === 'delhiveryone' ||
    normalized === 'delhivery' ||
    normalized.startsWith('deliveryone') ||
    normalized.startsWith('delhiveryone')
  )
}

export const isDelhiveryCourier = (courier: CourierLike) =>
  getCourierValues(courier).some((value) => isDeliveryOneValue(value))

const getDeliveryOneVariant = (courier: CourierLike) => {
  const values = getCourierValues(courier)
  const normalizedValues = values.map(normalizeToken)

  if (normalizedValues.some((value) => value.includes('surface') || value.includes('ground'))) {
    return 'surface'
  }

  if (normalizedValues.some((value) => value.includes('express') || value.includes('air'))) {
    return 'express'
  }

  if (typeof courier !== 'string' && courier) {
    const courierId = Number(courier.id ?? courier.courier_id ?? courier.courierId)
    if (courierId === DELIVERY_ONE_SURFACE_ID) return 'surface'
    if (courierId === DELIVERY_ONE_EXPRESS_ID) return 'express'
  }

  return ''
}

const getDeliveryOneDisplayName = (courier: CourierLike) => {
  const variant = getDeliveryOneVariant(courier)
  if (variant === 'surface') return DELIVERY_ONE_SURFACE_DISPLAY_NAME
  if (variant === 'express') return DELIVERY_ONE_EXPRESS_DISPLAY_NAME
  return DELIVERY_ONE_DISPLAY_NAME
}

export const getCourierDisplayName = (courier: CourierLike, fallback = 'Unknown Courier') => {
  const values = getCourierValues(courier)
  if (values.some(isDeliveryOneValue)) return getDeliveryOneDisplayName(courier)
  if (typeof courier === 'string') return courier || fallback
  return courier?.displayName || courier?.courier_name || courier?.name || fallback
}

export const getCourierLogo = (courier: CourierLike, fallback = defaultLogo) => {
  const values = getCourierValues(courier)
  if (values.some(isDeliveryOneValue)) {
    return courierLogos['Delivery One'] || courierLogos.deliveryone || DELIVERY_ONE_LOGO
  }

  const normalizedValues = values.map((value) => value.toLowerCase())
  const logo = Object.entries(courierLogos || {}).find(([key]) =>
    normalizedValues.some((value) => value.includes(key.toLowerCase())),
  )?.[1]

  return logo || fallback
}
