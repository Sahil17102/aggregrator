const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const isDeliveryOneValue = (value) => {
  const normalized = normalizeToken(value)
  return ['deliveryone', 'delivery1', 'delhiveryone'].includes(normalized)
}

const isDelhiveryValue = (value) => normalizeToken(value) === 'delhivery'

export const getCourierDisplayName = (courierOrName, fallback = 'N/A') => {
  if (typeof courierOrName === 'string') {
    if (isDeliveryOneValue(courierOrName)) return 'Delivery One'
    return isDelhiveryValue(courierOrName) ? 'Delhivery' : courierOrName || fallback
  }

  const values = [
    courierOrName?.displayName,
    courierOrName?.courier_name,
    courierOrName?.name,
    courierOrName?.service_provider,
    courierOrName?.serviceProvider,
  ].filter(Boolean)

  if (values.some(isDeliveryOneValue)) return 'Delivery One'
  if (values.some(isDelhiveryValue)) return 'Delhivery'
  return courierOrName?.displayName || courierOrName?.courier_name || courierOrName?.name || fallback
}

export const getProviderDisplayName = (provider, fallback = 'Not selected') =>
  isDeliveryOneValue(provider)
    ? 'Delivery One'
    : isDelhiveryValue(provider)
      ? 'Delhivery'
      : provider || fallback
