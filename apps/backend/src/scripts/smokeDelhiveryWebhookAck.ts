import assert from 'node:assert/strict'
import {
  normalizeWebhookSecretCandidate,
  resolveDelhiveryScanPushAck,
} from '../controllers/webhooks/delhivery.webhook'

const cases = [
  {
    input: 'DELHIVERY_WEBHOOK_SECRET=raw-secret',
    expected: 'raw-secret',
    label: 'prefixed env-style secret',
  },
  {
    input: 'Bearer raw-secret',
    expected: 'raw-secret',
    label: 'bearer secret',
  },
  {
    input: 'sha256=abc123',
    expected: 'sha256=abc123',
    label: 'sha256 signature',
  },
]

for (const testCase of cases) {
  assert.equal(
    normalizeWebhookSecretCandidate(testCase.input),
    testCase.expected,
    `Unexpected normalization for ${testCase.label}`,
  )
}

const accepted = resolveDelhiveryScanPushAck({ success: true })
assert.equal(accepted.status, 200)
assert.deepEqual(accepted.body, { success: true })

const queued = resolveDelhiveryScanPushAck({ success: false, reason: 'order_not_found' })
assert.equal(queued.status, 200)
assert.deepEqual(queued.body, { success: true, queued: true })

const partial = resolveDelhiveryScanPushAck({ success: false, reason: 'invalid_status' })
assert.equal(partial.status, 200)
assert.deepEqual(partial.body, { success: true, partial: true })

console.log('Delhivery webhook ack smoke test passed.')
