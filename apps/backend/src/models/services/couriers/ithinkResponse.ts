import { createHash } from 'node:crypto'

export const iThinkRows = (data: unknown): any[] => {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  return Object.entries(data).filter(([key]) => /^\d+$/.test(key)).map(([, row]) => row)
}

export const iThinkServiceType = (row: any) =>
  String(row?.logistic_service_type || row?.service_type || '').trim().toLowerCase()

export const iThinkCourierId = (row: any) => {
  const explicit = Number(row?.logistic_id)
  if (Number.isInteger(explicit) && explicit > 0) return explicit
  const name = String(row?.logistic_name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!name) return NaN
  // Local catalog identity only. iThink booking uses logistics NAME, not this ID.
  return 1000000000 + (createHash('sha256').update(name).digest().readUInt32BE(0) % 1000000000)
}

export const iThinkOptionKey = (id: number, service: string) =>
  `${id}__ithink__${service.trim().toLowerCase() || 'default'}__base`
