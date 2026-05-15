const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const isDelhiveryValue = (value) => {
  const normalized = normalizeToken(value)
  return ['delhivery', 'deliveryone', 'delivery1', 'delhiveryone'].includes(normalized)
}

export const getCourierDisplayName = (courierOrName, fallback = 'N/A') => {
  if (typeof courierOrName === 'string') {
    return isDelhiveryValue(courierOrName) ? 'Delhivery' : courierOrName || fallback
  }

  const values = [
    courierOrName?.displayName,
    courierOrName?.courier_name,
    courierOrName?.name,
    courierOrName?.service_provider,
    courierOrName?.serviceProvider,
  ].filter(Boolean)

  if (values.some(isDelhiveryValue)) return 'Delhivery'
  return courierOrName?.displayName || courierOrName?.courier_name || courierOrName?.name || fallback
}

export const getProviderDisplayName = (provider, fallback = 'Not selected') =>
  isDelhiveryValue(provider) ? 'Delhivery' : provider || fallback
