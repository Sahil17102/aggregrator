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
const DELHIVERY_LOGO = '/logo/integrations/delhivery-one.webp'

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

export const isDelhiveryCourier = (courier: CourierLike) =>
  getCourierValues(courier).some((value) => {
    const normalized = normalizeToken(value)
    return (
      normalized === 'delhivery' ||
      normalized === 'deliveryone' ||
      normalized === 'delivery1' ||
      normalized === 'delhiveryone'
    )
  })

export const getCourierDisplayName = (courier: CourierLike, fallback = 'Unknown Courier') => {
  if (isDelhiveryCourier(courier)) return DELHIVERY_DISPLAY_NAME
  if (typeof courier === 'string') return courier || fallback
  return courier?.displayName || courier?.name || fallback
}

export const getCourierLogo = (courier: CourierLike, fallback = defaultLogo) => {
  if (isDelhiveryCourier(courier)) {
    return courierLogos.Delhivery || DELHIVERY_LOGO
  }

  const values = getCourierValues(courier).map((value) => value.toLowerCase())
  const logo = Object.entries(courierLogos || {}).find(([key]) =>
    values.some((value) => value.includes(key.toLowerCase())),
  )?.[1]

  return logo || fallback
}
