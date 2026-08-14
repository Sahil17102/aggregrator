import axios from 'axios'
import { DelhiveryB2BService } from '../models/services/couriers/delhiveryB2B.service'

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
}

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
const fakeJwt = `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`

process.env.DELIVERY_ONE_USERNAME = 'verify-user'
process.env.DELIVERY_ONE_PASSWORD = 'verify-password'
process.env.DELIVERY_ONE_B2B_API_BASE = 'https://delhivery-b2b.verify.local'
process.env.DELIVERY_ONE_B2B_FORCE_ENV_CONFIG = 'true'
process.env.DELIVERY_ONE_B2B_MANIFEST_POLL_ATTEMPTS = '1'

const axiosMock = axios as any
const originalPost = axiosMock.post
const originalGet = axiosMock.get
const calls: Array<{ method: string; url: string }> = []

axiosMock.post = async (url: string, body: any) => {
  calls.push({ method: 'POST', url })
  if (url.endsWith('/ums/login')) {
    assert(body?.username === 'verify-user', 'B2B login username was not forwarded')
    assert(body?.password === 'verify-password', 'B2B login password was not forwarded')
    return { data: { success: true, data: { jwt: fakeJwt } } }
  }

  assert(url.endsWith('/manifest'), 'Unexpected manifestation URL')
  assert(body instanceof FormData, 'Manifest request must use multipart FormData')
  assert(body.get('pickup_location_name') === 'Main Warehouse', 'Pickup name is missing')
  assert(body.get('payment_mode') === 'prepaid', 'Payment mode is missing')
  assert(body.get('weight') === '2500', 'Weight must be sent in grams')
  assert(String(body.get('shipment_details')).includes('ORDER-B2B-1'), 'Order ID is missing')
  assert(String(body.get('invoices')).includes('INV-1'), 'Invoice data is missing')
  return { data: { success: true, job_id: 'job-123' } }
}

axiosMock.get = async (url: string, config: any) => {
  calls.push({ method: 'GET', url })
  assert(url.endsWith('/manifest'), 'Unexpected manifestation status URL')
  assert(config?.params?.job_id === 'job-123', 'Manifest job ID was not polled')
  return {
    data: {
      status: {
        type: 'Complete',
        success: true,
        value: { lrnum: 'LRN123', waybills: ['AWB123', 'AWB124'] },
      },
    },
  }
}

const run = async () => {
  try {
    DelhiveryB2BService.clearCachedToken()
    const result = await new DelhiveryB2BService().createManifest({
      pickup_location_name: 'Main Warehouse',
      payment_mode: 'prepaid',
      weight: 2500,
      dropoff_location: {
        consignee_name: 'Test Buyer',
        address: 'Test Address',
        city: 'Delhi',
        state: 'Delhi',
        zip: '110001',
        phone: '9999999999',
      },
      shipment_details: [
        {
          order_id: 'ORDER-B2B-1',
          box_count: 2,
          description: 'Verification order',
          weight: 2500,
          waybills: [],
          master: false,
        },
      ],
      dimensions: [
        { box_count: 1, length: 10, width: 10, height: 10 },
        { box_count: 1, length: 20, width: 20, height: 20 },
      ],
      rov_insurance: false,
      enable_paperless_movement: false,
      invoices: [{ ewaybill: '', inv_num: 'INV-1', inv_amt: 1000, inv_qr_code: '' }],
    })

    assert(result.jobId === 'job-123', 'Manifest job ID was not returned')
    assert(result.lrn === 'LRN123', 'LRN was not extracted')
    assert(result.waybills.length === 2, 'Waybills were not extracted')
    assert(result.processing === false, 'Completed manifest was marked processing')
    assert(calls.filter((call) => call.url.endsWith('/ums/login')).length === 1, 'Unexpected login count')
    console.log('Delhivery B2B API call verification passed.')
  } finally {
    axiosMock.post = originalPost
    axiosMock.get = originalGet
    DelhiveryB2BService.clearCachedToken()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
