import axios from 'axios'
import { DeliveryOneService } from '../models/services/couriers/deliveryone.service'

type HttpMethod = 'GET' | 'POST' | 'PUT'

type RecordedCall = {
  name: string
  method: HttpMethod
  path: string
  params?: any
  body?: any
}

type Verification = {
  name: string
  method: HttpMethod
  path: string
  run: () => Promise<unknown>
}

process.env.DELIVERY_ONE_API_BASE = 'https://delivery-one.verify.local'
process.env.DELIVERY_ONE_API_KEY = 'verify-token'
process.env.DELIVERY_ONE_FORCE_ENV_CONFIG = 'true'
DeliveryOneService.clearCachedConfig()

const service = new DeliveryOneService()
const calls: RecordedCall[] = []
let activeName = ''

const getPath = (url: string) => {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

const responseFor = (method: HttpMethod, path: string) => {
  if (method === 'GET' && path === '/c/api/pin-codes/json/') {
    return {
      delivery_codes: [
        {
          postal_code: {
            pickup: 'Y',
            cod: 'Y',
            pre_paid: 'Y',
            remark: '',
          },
        },
      ],
    }
  }

  if (method === 'GET' && path === '/waybill/api/fetch/json/') {
    return { waybill: '700000000001' }
  }

  if (method === 'GET' && path === '/waybill/api/bulk/json/') {
    return { waybills: ['700000000002', '700000000003'] }
  }

  if (method === 'GET' && path === '/api/v1/packages/json/') {
    return { ShipmentData: [{ Shipment: { AWB: '700000000001', Status: 'Manifested' } }] }
  }

  if (method === 'GET' && path === '/api/kinko/v1/invoice/charges/.json') {
    return {
      total_amount: 123.45,
      freight_charge: 100,
      cod_charge: 23.45,
      chargeable_weight: 500,
    }
  }

  if (method === 'GET' && path === '/api/p/packing_slip') {
    return {
      packages: [{ waybill: '700000000001' }],
      label_url: 'https://delivery-one.verify.local/label.pdf',
    }
  }

  if (method === 'POST' && path === '/api/cmu/create.json') {
    return {
      success: true,
      packages: [{ waybill: '700000000001', status: 'success', serviceable: true }],
    }
  }

  if (method === 'POST' && path === '/api/p/edit') {
    return { success: true }
  }

  if (method === 'PUT' && path === '/api/rest/ewaybill/700000000001/') {
    return { success: true }
  }

  if (method === 'POST' && path === '/fm/request/new/') {
    return { success: true, pickup_id: 'PICKUP-VERIFY' }
  }

  if (method === 'POST' && path === '/api/backend/clientwarehouse/create/') {
    return { success: true, name: 'Verify Warehouse' }
  }

  if (method === 'POST' && path === '/api/backend/clientwarehouse/edit/') {
    return { success: true, name: 'Verify Warehouse' }
  }

  throw new Error(`No mocked response for ${method} ${path}`)
}

const record = (method: HttpMethod, url: string, body?: any, config?: any) => {
  const path = getPath(url)
  calls.push({
    name: activeName,
    method,
    path,
    params: config?.params,
    body,
  })

  return {
    status: 200,
    data: responseFor(method, path),
  }
}

;(axios as any).get = async (url: string, config?: any) => record('GET', url, undefined, config)
;(axios as any).post = async (url: string, body?: any, config?: any) =>
  record('POST', url, body, config)
;(axios as any).put = async (url: string, body?: any, config?: any) =>
  record('PUT', url, body, config)

const baseShipment = {
  order_number: 'DO-VERIFY-001',
  order_amount: 499,
  payment_type: 'prepaid',
  courier_id: 99,
  pickup: {
    warehouse_name: 'Verify Warehouse',
    name: 'ShipAggregator',
    phone: '9999999999',
    address: 'Warehouse address',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    country: 'India',
  },
  consignee: {
    name: 'Verify Buyer',
    phone: '9999999999',
    address: 'Buyer address',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110042',
    country: 'India',
  },
  order_items: [{ name: 'T-shirt', qty: 1, hsn: '6109' }],
  package_weight: 500,
  package_length: 10,
  package_breadth: 10,
  package_height: 10,
  shipping_mode: 'Surface',
}

const verifications: Verification[] = [
  {
    name: 'Pincode Serviceability',
    method: 'GET',
    path: '/c/api/pin-codes/json/',
    run: () => service.checkPincodeServiceability('110042'),
  },
  {
    name: 'Fetch Waybill',
    method: 'GET',
    path: '/waybill/api/bulk/json/',
    run: () => service.fetchWaybills(2),
  },
  {
    name: 'Shipment Manifestation',
    method: 'POST',
    path: '/api/cmu/create.json',
    run: () => service.createShipment(baseShipment as any),
  },
  {
    name: 'Shipment Updation',
    method: 'POST',
    path: '/api/p/edit',
    run: () =>
      service.editShipment({
        waybill: '700000000001',
        name: 'Updated Buyer',
        phone: '9999999999',
        add: 'Updated address',
        gm: 500,
      }),
  },
  {
    name: 'Shipment Cancelation',
    method: 'POST',
    path: '/api/p/edit',
    run: () => service.cancelShipment('700000000001'),
  },
  {
    name: 'Ewaybill Management',
    method: 'PUT',
    path: '/api/rest/ewaybill/700000000001/',
    run: () =>
      service.updateEWaybill({
        waybill: '700000000001',
        dcn: 'INV-001',
        ewbn: '123456789012',
      }),
  },
  {
    name: 'Shipment Tracking',
    method: 'GET',
    path: '/api/v1/packages/json/',
    run: () => service.trackShipment({ waybill: '700000000001' }),
  },
  {
    name: 'Calculate Shipping Cost',
    method: 'GET',
    path: '/api/kinko/v1/invoice/charges/.json',
    run: () =>
      service.calculateShippingCost({
        md: 'S',
        cgm: 500,
        o_pin: '122001',
        d_pin: '110042',
        ss: 'Delivered',
        pt: 'Pre-paid',
        l: 10,
        b: 10,
        h: 10,
      }),
  },
  {
    name: 'Generate Shipping Label',
    method: 'GET',
    path: '/api/p/packing_slip',
    run: () => service.generateLabel({ waybill: '700000000001', pdf: true, pdf_size: 'A4' }),
  },
  {
    name: 'Pickup Request Creation',
    method: 'POST',
    path: '/fm/request/new/',
    run: () =>
      service.createPickupRequest({
        pickup_time: '11:00:00',
        pickup_date: '2026-05-14',
        pickup_location: 'Verify Warehouse',
        expected_package_count: 1,
      }),
  },
  {
    name: 'Client Warehouse Creation',
    method: 'POST',
    path: '/api/backend/clientwarehouse/create/',
    run: () =>
      service.createWarehouse({
        name: 'Verify Warehouse',
        phone: '9999999999',
        pin: '122001',
        address: 'Warehouse address',
        city: 'Gurugram',
        country: 'India',
        registered_name: 'ShipAggregator',
        return_address: 'Return address',
        return_pin: '122001',
        return_city: 'Gurugram',
        return_state: 'Haryana',
        return_country: 'India',
      }),
  },
  {
    name: 'Client Warehouse Updation',
    method: 'POST',
    path: '/api/backend/clientwarehouse/edit/',
    run: () =>
      service.updateWarehouse({
        name: 'Verify Warehouse',
        phone: '9999999999',
        pin: '122001',
        address: 'Updated warehouse address',
      }),
  },
]

async function main() {
  const results = []

  for (const verification of verifications) {
    activeName = verification.name
    const startIndex = calls.length
    await verification.run()
    const reachedCall = calls.slice(startIndex).find(
      (call) => call.method === verification.method && call.path === verification.path,
    )

    results.push({
      name: verification.name,
      expected: `${verification.method} ${verification.path}`,
      reached: Boolean(reachedCall),
      actualCalls: calls.slice(startIndex).map((call) => `${call.method} ${call.path}`),
    })
  }

  activeName = ''
  const missing = results.filter((result) => !result.reached)
  console.log(JSON.stringify({ total: results.length, missing: missing.length, results }, null, 2))

  if (missing.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
