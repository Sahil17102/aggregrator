import { courierLogos, defaultLogo } from './constants'

type CourierLike =
  | string
  | null
  | undefined
  | {
      name?: string | null
      displayName?: string | null
      serviceProvider?: string | null
      service_provider?: string | null
      integration_type?: string | null
      provider?: string | null
    }

const DELHIVERY_DISPLAY_NAME = 'Delhivery'
const DELIVERY_ONE_DISPLAY_NAME = 'Delivery One'
const DELIVERY_ONE_LOGO = '/logo/integrations/delhivery-one.webp'

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
    courier.name,
    courier.serviceProvider,
    courier.service_provider,
    courier.integration_type,
    courier.provider,
  ].filter(Boolean) as string[]
}

const isDeliveryOneValue = (value?: string | null) => {
  const normalized = normalizeToken(value)
  return normalized === 'deliveryone' || normalized === 'delivery1' || normalized === 'delhiveryone'
}

const isDelhiveryValue = (value?: string | null) => normalizeToken(value) === 'delhivery'

export const isDelhiveryCourier = (courier: CourierLike) =>
  getCourierValues(courier).some((value) => isDelhiveryValue(value) || isDeliveryOneValue(value))

export const getCourierDisplayName = (courier: CourierLike, fallback = 'Unknown Courier') => {
  const values = getCourierValues(courier)
  if (values.some(isDeliveryOneValue)) return DELIVERY_ONE_DISPLAY_NAME
  if (values.some(isDelhiveryValue)) return DELHIVERY_DISPLAY_NAME
  if (typeof courier === 'string') return courier || fallback
  return courier?.displayName || courier?.name || fallback
}

export const getCourierLogo = (courier: CourierLike, fallback = defaultLogo) => {
  const values = getCourierValues(courier)
  if (values.some(isDeliveryOneValue)) {
    return courierLogos['Delivery One'] || courierLogos.deliveryone || DELIVERY_ONE_LOGO
  }
  if (values.some(isDelhiveryValue)) {
    return courierLogos.Delhivery || DELIVERY_ONE_LOGO
  }

  const normalizedValues = values.map((value) => value.toLowerCase())
  const logo = Object.entries(courierLogos || {}).find(([key]) =>
    normalizedValues.some((value) => value.includes(key.toLowerCase())),
  )?.[1]

  return logo || fallback
}
