export const DELHIVERY_COURIER_IDS = {
  EXPRESS: 100,
  SURFACE: 99,
} as const

export const DELHIVERY_ALLOWED_COURIER_IDS: number[] = [
  DELHIVERY_COURIER_IDS.EXPRESS,
  DELHIVERY_COURIER_IDS.SURFACE,
]

export const DELIVERY_ONE_ALLOWED_COURIER_IDS: number[] = [
  DELHIVERY_COURIER_IDS.SURFACE,
  DELHIVERY_COURIER_IDS.EXPRESS,
]

export const normalizeCourierId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return Number(value)
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export const isSupportedDelhiveryCourierId = (value: unknown): boolean => {
  const id = normalizeCourierId(value)
  if (id === null) return false
  return DELHIVERY_ALLOWED_COURIER_IDS.includes(id)
}

export const isSupportedDeliveryOneCourierId = (value: unknown): boolean => {
  const id = normalizeCourierId(value)
  if (id === null) return false
  return DELIVERY_ONE_ALLOWED_COURIER_IDS.includes(id)
}

export const getDelhiveryShippingModeByCourierId = (
  value: unknown,
): 'Express' | 'Surface' | null => {
  const id = normalizeCourierId(value)
  if (id === DELHIVERY_COURIER_IDS.EXPRESS) return 'Express'
  if (id === DELHIVERY_COURIER_IDS.SURFACE) return 'Surface'
  return null
}

export const getDelhiveryCourierDisplayName = (value: unknown): string => {
  const mode = getDelhiveryShippingModeByCourierId(value)
  if (mode === 'Express') return 'Delhivery Express'

  const normalized = String(value ?? '').trim().toLowerCase()
  if (['e', 'express', 'air', '100'].includes(normalized) || normalized.includes('express')) {
    return 'Delhivery Express'
  }

  return 'Delhivery Surface'
}

export const normalizeDelhiveryShippingMode = (
  value: unknown,
): 'Express' | 'Surface' | null => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return null
  if (['e', 'express', 'air'].includes(normalized)) return 'Express'
  if (['s', 'surface'].includes(normalized)) return 'Surface'
  return null
}

export const getDelhiveryModeCodeByShippingMode = (
  value: unknown,
): 'E' | 'S' | null => {
  const mode = normalizeDelhiveryShippingMode(value)
  if (mode === 'Express') return 'E'
  if (mode === 'Surface') return 'S'
  return null
}

export const getDelhiveryShippingModeByModeCode = (
  value: unknown,
): 'Express' | 'Surface' | null => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['e', 'express', 'air'].includes(normalized)) return 'Express'
  if (['s', 'surface'].includes(normalized)) return 'Surface'
  return null
}
