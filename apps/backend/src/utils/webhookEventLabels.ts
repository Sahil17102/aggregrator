const SPECIAL_WORDS = new Set(['rto', 'ndr', 'cod', 'awb', 'id'])

export const toWebhookLabel = (value: unknown) => {
  const text = String(value || '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''

  return text
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase()
      if (SPECIAL_WORDS.has(lower)) return lower.toUpperCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export const statusLabelFromState = (state: unknown) => {
  const label = toWebhookLabel(state)
  return label || 'Unknown'
}
