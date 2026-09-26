import assert from 'node:assert/strict'
import { summarizeB2BBoxes, supportsB2BBooking } from '../utils/b2bBooking'

const summary = summarizeB2BBoxes([
  { quantity: 3, weightKg: 2, lengthCm: 10, breadthCm: 20, heightCm: 30 },
  { box_count: 2, weight: 1.5, length: 20, width: 20, height: 20 },
])
assert.equal(summary.count, 5)
assert.equal(summary.weightKg, 9)
assert.ok(Math.abs(summary.volumetricKg - 6.8) < 0.00001)
assert.deepEqual(summary.dimensions.map((box) => box.box_count), [3, 2])
for (const quantity of [0, -1, 1.5, Infinity]) {
  assert.throws(() => summarizeB2BBoxes([{ quantity, weightKg: 1, length: 10, width: 10, height: 10 }]))
}
assert.throws(() => summarizeB2BBoxes([]))
assert.throws(() => summarizeB2BBoxes([{ weightKg: NaN, length: 10, width: 10, height: 10 }]))
assert.equal(supportsB2BBooking('Delivery One'), true)
assert.equal(supportsB2BBooking('Delhivery'), true)
for (const provider of ['shipway', 'shadowfax', 'ithink', 'bigship', '']) {
  assert.equal(supportsB2BBooking(provider), false)
}
console.log('B2B booking checks passed: multi-box quantities, weights, dimensions and supported adapters.')
