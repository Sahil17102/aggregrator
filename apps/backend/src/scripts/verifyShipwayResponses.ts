import assert from 'node:assert/strict'
import { parseShipwayShipmentResponse } from '../models/services/couriers/shipwayResponse'

const saved = { success: true, message: 'Order has been added successfully.' }
assert.throws(
  () => parseShipwayShipmentResponse({ ...saved, awb_response: {
    success: false, message: 'Insufficient Shipping Balance. Please add balance to your wallet',
  } }, 81737),
  (error: any) => /Insufficient Shipping Balance/.test(error.message)
    && /TrueTransit wallet balance is separate/.test(error.message)
    && !/added successfully/.test(error.message),
)
assert.throws(() => parseShipwayShipmentResponse(saved, 81737), /No confirmed AWB/)
assert.throws(() => parseShipwayShipmentResponse({ ...saved, awb_response: {
  success: true, AWB: '   ',
} }, 81737), /No confirmed AWB/)
assert.throws(() => parseShipwayShipmentResponse({ ...saved, awb_response: {
  success: 'false', AWB: '123', message: 'Carrier unavailable',
} }, 81737), /Carrier unavailable/)
assert.throws(() => parseShipwayShipmentResponse({ success: false, message: 'Invalid warehouse' }, 81737), /Invalid warehouse/)
assert.throws(() => parseShipwayShipmentResponse(null, 81737), /order creation failed/)
const shipment = parseShipwayShipmentResponse({ ...saved, awb_response: {
  success: true, AWB: ' 1333110020164 ', carrier_id: '3411', shipping_url: 'https://example.test/label.pdf',
} }, 81737)
assert.equal(shipment.awb_number, '1333110020164')
assert.equal(shipment.courier_id, 3411)
assert.equal(shipment.label, 'https://example.test/label.pdf')
console.log('Shipway response checks passed: booking success, insufficient balance, missing AWB and provider failures.')
