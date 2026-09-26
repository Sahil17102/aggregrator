const message = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const succeeded = (value: unknown) => value === true || value === 1 || value === 'true' || value === '1'

// Saving an order and assigning its AWB are separate outcomes in Shipway.
export const parseShipwayShipmentResponse = (data: any, carrierId: number) => {
  const assignment = data?.awb_response
  const awb = message(assignment?.AWB)
  if (!succeeded(data?.success)) {
    throw new Error(message(data?.message) || 'Shipway order creation failed')
  }
  if (!succeeded(assignment?.success) || !awb) {
    const reason = message(assignment?.message) || message(assignment?.error)
    const balanceHint = /insufficient.*balance/i.test(reason)
      ? ' Recharge the Shipway wallet; your TrueTransit wallet balance is separate.'
      : ''
    throw new Error(
      `Shipway saved the order, but shipment booking failed: ${reason || 'No confirmed AWB was returned.'}${balanceHint}`,
    )
  }
  return {
    raw: data,
    shipment_id: awb,
    awb_number: awb,
    courier_id: Number(assignment.carrier_id ?? carrierId),
    courier_name: '',
    label: message(assignment.shipping_url),
  }
}
