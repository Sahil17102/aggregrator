import { normalizeServiceProviderKey } from './courierProviders'

// Add providers here only alongside an implemented B2B booking adapter.
export const supportsB2BBooking = (provider: unknown) =>
  ['delhivery', 'deliveryone'].includes(normalizeServiceProviderKey(provider))

export const summarizeB2BBoxes = (boxes: any[]) => {
  if (!boxes.length) throw new Error('At least one box is required for a B2B shipment.')
  const normalized = boxes.map((box) => {
    const quantity = Number(box.quantity ?? box.box_count ?? 1)
    const weightKg = Number(box.weightKg ?? box.weight)
    const length = Number(box.lengthCm ?? box.length)
    const width = Number(box.breadthCm ?? box.breadth ?? box.width)
    const height = Number(box.heightCm ?? box.height)
    if (!Number.isInteger(quantity) || quantity <= 0 ||
      ![weightKg, length, width, height].every((value) => Number.isFinite(value) && value > 0)) {
      throw new Error('Every B2B box requires a positive whole quantity, weight and dimensions.')
    }
    return { quantity, weightKg, length, width, height }
  })
  return {
    count: normalized.reduce((sum, box) => sum + box.quantity, 0),
    weightKg: normalized.reduce((sum, box) => sum + box.weightKg * box.quantity, 0),
    volumetricKg: normalized.reduce((sum, box) => sum + box.length * box.width * box.height * box.quantity / 5000, 0),
    dimensions: normalized.map((box) => ({
      box_count: box.quantity, length: box.length, width: box.width, height: box.height,
    })),
  }
}
