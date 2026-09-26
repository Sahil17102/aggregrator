import assert from 'node:assert/strict'
import { buildShipwayRateParams } from '../models/services/couriers/shipwayRateRequest'

const parcel = {
  originPincode: '500032', destinationPincode: '126116', paymentType: 'prepaid',
  weightG: 1000, lengthCm: 10, breadthCm: 10, heightCm: 10,
}
assert.deepEqual(buildShipwayRateParams(parcel), {
  fromPincode: '500032', toPincode: '126116', paymentType: 'prepaid',
  weight: 1, length: 10, breadth: 10, height: 10,
})
assert.equal(buildShipwayRateParams({ ...parcel, weightG: 500 }).weight, 0.5)
assert.equal(buildShipwayRateParams({ ...parcel, weightG: 1250 }).weight, 1.25)
assert.equal(buildShipwayRateParams({ ...parcel, paymentType: 'COD', codAmount: 250 }).cummulativePrice, 250)
assert.equal(buildShipwayRateParams({ ...parcel, codAmount: 250 }).cummulativePrice, undefined)
assert.throws(() => buildShipwayRateParams({ ...parcel, weightG: 0 }), /positive package weight/)
assert.throws(() => buildShipwayRateParams({ ...parcel, paymentType: 'cod' }), /collectable amount/)
console.log('Shipway rate request checks passed: parcel weight, dimensions, COD and input validation.')
