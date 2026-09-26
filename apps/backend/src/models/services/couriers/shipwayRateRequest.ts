export type ShipwayRateRequest = {
  originPincode: string
  destinationPincode: string
  paymentType: string
  weightG: number
  lengthCm?: number
  breadthCm?: number
  heightCm?: number
  codAmount?: number
}

// Shipway rates accept kilograms, while our booking/serviceability inputs use grams.
export const buildShipwayRateParams = (input: ShipwayRateRequest) => {
  if (!Number.isFinite(input.weightG) || input.weightG <= 0) {
    throw new Error('A positive package weight is required for Shipway rates')
  }
  const cod = input.paymentType.toLowerCase() === 'cod'
  if (cod && (!Number.isFinite(input.codAmount) || Number(input.codAmount) < 0)) {
    throw new Error('A valid collectable amount is required for Shipway COD rates')
  }
  return {
    fromPincode: input.originPincode,
    toPincode: input.destinationPincode,
    paymentType: cod ? 'cod' : 'prepaid',
    weight: input.weightG / 1000,
    ...(Number(input.lengthCm) > 0 ? { length: input.lengthCm } : {}),
    ...(Number(input.breadthCm) > 0 ? { breadth: input.breadthCm } : {}),
    ...(Number(input.heightCm) > 0 ? { height: input.heightCm } : {}),
    ...(cod ? { cummulativePrice: input.codAmount } : {}),
  }
}
