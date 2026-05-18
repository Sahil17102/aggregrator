const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const isDeliveryOneValue = (value) => {
  const normalized = normalizeToken(value)
  return ['deliveryone', 'delivery1', 'delhiveryone', 'delhivery'].includes(normalized)
}

export const getCourierDisplayName = (courierOrName, fallback = 'N/A') => {
  if (typeof courierOrName === 'string') {
    if (isDeliveryOneValue(courierOrName)) return 'Delivery One'
    return courierOrName || fallback
  }

  const values = [
    courierOrName?.displayName,
    courierOrName?.courier_name,
    courierOrName?.name,
    courierOrName?.service_provider,
    courierOrName?.serviceProvider,
  ].filter(Boolean)

  if (values.some(isDeliveryOneValue)) return 'Delivery One'
  return courierOrName?.displayName || courierOrName?.courier_name || courierOrName?.name || fallback
}

export const getProviderDisplayName = (provider, fallback = 'Not selected') =>
  isDeliveryOneValue(provider) ? 'Delivery One' : provider || fallback
