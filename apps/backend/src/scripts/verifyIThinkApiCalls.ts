import axios from 'axios'

process.env.DATABASE_URL ||= 'postgresql://verify:verify@127.0.0.1:5432/verify'

const originalPost = axios.post
const calls: Array<{ url: string; body: any; config: any }> = []
let simulateInsufficientBalance = false

;(axios as any).post = async (url: string, body: any, config: any) => {
  calls.push({ url, body, config })
  if (simulateInsufficientBalance && url.endsWith('/order/add.json')) {
    return { data: { status: 'error', data: 'Insufficient wallet balance' } }
  }
  return { data: { ok: true, url } }
}

const fail = (message: string): never => {
  throw new Error(message)
}

const run = async () => {
  const { ITHINK_OPERATIONS, IThinkService } = await import(
    '../models/services/couriers/ithink.service'
  )
  const service = new IThinkService({
    apiBase: 'https://ithink.verify.local/api_v3/',
    accessToken: 'test-access-token',
    secretKey: 'test-secret-key',
  })

  for (const operation of Object.keys(ITHINK_OPERATIONS) as Array<keyof typeof ITHINK_OPERATIONS>) {
    const result = await service.call(operation, { marker: operation })
    if (!result?.ok) fail(`${operation} did not return the mocked response`)
  }

  if (calls.length !== Object.keys(ITHINK_OPERATIONS).length) {
    fail(`Expected ${Object.keys(ITHINK_OPERATIONS).length} calls, received ${calls.length}`)
  }

  calls.forEach((call, index) => {
    const operation = Object.keys(ITHINK_OPERATIONS)[index] as keyof typeof ITHINK_OPERATIONS
    const expectedUrl = `https://ithink.verify.local/api_v3${ITHINK_OPERATIONS[operation]}`
    if (call.url !== expectedUrl) fail(`${operation} URL mismatch: ${call.url}`)
    if (call.body?.data?.access_token !== 'test-access-token') {
      fail(`${operation} did not include access_token in the data envelope`)
    }
    if (call.body?.data?.secret_key !== 'test-secret-key') {
      fail(`${operation} did not include secret_key in the data envelope`)
    }
    if (call.body?.data?.marker !== operation) fail(`${operation} payload was not preserved`)
    if (call.config?.headers?.['Content-Type'] !== 'application/json') {
      fail(`${operation} content type mismatch`)
    }
  })

  let limitRejected = false
  try {
    await service.syncOrder({ shipments: Array.from({ length: 26 }, () => ({})) })
  } catch (error: any) {
    limitRejected = error?.statusCode === 400
  }
  if (!limitRejected) fail('Sync Order limit validation did not reject 26 shipments')

  simulateInsufficientBalance = true
  const bookingCouriers = ['Xpressbees', 'Delhivery', 'BlueDart', 'Shadowfax', 'DTDC']
  for (const courierName of bookingCouriers) {
    const callCountBeforeBooking = calls.length
    let bookingError = ''
    try {
      await new IThinkService({
        apiBase: 'https://ithink.verify.local/api_v3/',
        accessToken: 'test-access-token',
        secretKey: 'test-secret-key',
        pickupAddressId: 'test-pickup',
      }).createShipment({
        order_number: `VERIFY-${courierName.toUpperCase()}`,
        order_amount: 100,
        payment_type: 'prepaid',
        selected_courier_name: courierName,
        shipping_mode: 'Surface',
        package_weight: 500,
        package_length: 10,
        package_breadth: 10,
        package_height: 10,
        pickup: { name: 'Test Pickup', pincode: '500032' },
        consignee: {
          name: 'Test Customer',
          address: 'Test Address',
          pincode: '110001',
          city: 'New Delhi',
          state: 'Delhi',
          phone: '9999999999',
        },
        order_items: [{ name: 'Test Product', sku: 'TEST-1', qty: 1, price: 100 }],
      })
    } catch (error: any) {
      bookingError = String(error?.message || '')
    }

    const bookingCall = calls[callCountBeforeBooking]
    if (!bookingCall?.url.endsWith('/order/add.json')) {
      fail(`${courierName} booking did not reach the iThink Add Order API`)
    }
    if (bookingCall.body?.data?.logistics !== courierName) {
      fail(`${courierName} booking sent logistics=${bookingCall.body?.data?.logistics}`)
    }
    if (!/insufficient wallet balance/i.test(bookingError)) {
      fail(`${courierName} did not preserve the provider balance failure: ${bookingError}`)
    }
  }

  console.log(
    `iThink API contract verification passed for every operation and ${bookingCouriers.length} courier booking paths.`,
  )
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => {
    ;(axios as any).post = originalPost
  })
