export const DEFAULT_BUSINESS_TIME_ZONE = 'Asia/Kolkata'

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})[T\s]/
const DMY_RE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
const DISPLAY_DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})(?:\s*\|.*)?$/

const monthLookup: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const getBusinessDateFormatter = (timeZone: string) => {
  const cached = formatterCache.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  formatterCache.set(timeZone, formatter)
  return formatter
}

const isValidDateParts = (year: number, month: number, day: number) => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const toDateKey = (year: number, month: number, day: number) => {
  if (!isValidDateParts(year, month, day)) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export const formatBusinessDateKey = (
  value: Date,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) => {
  const parts = getBusinessDateFormatter(timeZone).formatToParts(value)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return year && month && day ? `${year}-${month}-${day}` : null
}

export const getBusinessDateKey = (
  value: unknown,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
): string | null => {
  if (value === null || value === undefined) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : formatBusinessDateKey(value, timeZone)
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : formatBusinessDateKey(date, timeZone)
  }

  const raw = String(value).trim()
  if (!raw) return null

  const exactDate = raw.match(DATE_ONLY_RE)
  if (exactDate) {
    return toDateKey(Number(exactDate[1]), Number(exactDate[2]), Number(exactDate[3]))
  }

  const numericDmy = raw.match(DMY_RE)
  if (numericDmy) {
    return toDateKey(Number(numericDmy[3]), Number(numericDmy[2]), Number(numericDmy[1]))
  }

  const displayDate = raw.match(DISPLAY_DATE_RE)
  if (displayDate) {
    const month = monthLookup[displayDate[2].toLowerCase()]
    return month ? toDateKey(Number(displayDate[3]), month, Number(displayDate[1])) : null
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return formatBusinessDateKey(parsed, timeZone)
  }

  const dateTimePrefix = raw.match(DATE_TIME_PREFIX_RE)
  if (dateTimePrefix) {
    return toDateKey(Number(dateTimePrefix[1]), Number(dateTimePrefix[2]), Number(dateTimePrefix[3]))
  }

  return null
}

export const getFirstBusinessDateKey = (
  ...values: unknown[]
): string | null => {
  for (const value of values) {
    const key = getBusinessDateKey(value)
    if (key) return key
  }
  return null
}

export const addDaysToBusinessDateKey = (dateKey: string, days: number) => {
  const match = String(dateKey || '').match(DATE_ONLY_RE)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!isValidDateParts(year, month, day)) return null

  const date = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS)
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export const differenceInBusinessDateKeys = (startKey: string, endKey: string) => {
  const start = String(startKey || '').match(DATE_ONLY_RE)
  const end = String(endKey || '').match(DATE_ONLY_RE)
  if (!start || !end) return 0

  const startMs = Date.UTC(Number(start[1]), Number(start[2]) - 1, Number(start[3]))
  const endMs = Date.UTC(Number(end[1]), Number(end[2]) - 1, Number(end[3]))
  return Math.floor((endMs - startMs) / DAY_MS)
}
