import axios from 'axios'
import { eq } from 'drizzle-orm'
import { db } from '../../client'
import { courier_credentials } from '../../schema/courierCredentials'
import { couriers } from '../../schema/couriers'

const SHIPWAY_PROVIDER = 'shipway'
export const DEFAULT_SHIPWAY_API_BASE = 'https://app.shipway.com/api'

export type ShipwayCredentialInput = {
  apiBase?: string
  api_base?: string
  baseUrl?: string
  email?: string
  username?: string
  shipwayEmail?: string
  licenseKey?: string
  license_key?: string
  apiKey?: string
  api_key?: string
  apiToken?: string
  api_token?: string
  token?: string
  password?: string
  warehouseId?: string | number
  warehouse_id?: string | number
  clientId?: string | number
}

type ShipwayConfig = {
  apiBase: string
  username: string
  password: string
  warehouseId: string
}

type ShipwayCarrier = {
  id: number
  name: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const readSavedCredentials = async () => {
  const [saved] = await db
    .select({
      apiBase: courier_credentials.apiBase,
      username: courier_credentials.username,
      password: courier_credentials.password,
      warehouseId: courier_credentials.clientId,
    })
    .from(courier_credentials)
    .where(eq(courier_credentials.provider, SHIPWAY_PROVIDER))
    .limit(1)

  return saved
}

const resolveConfig = async (input: ShipwayCredentialInput = {}): Promise<ShipwayConfig> => {
  const saved = await readSavedCredentials()
  const apiBase = clean(input.apiBase || input.api_base || input.baseUrl || saved?.apiBase)
    .replace(/\/+$/, '')
  const username = clean(input.email || input.username || input.shipwayEmail || saved?.username)
  const password = clean(
    input.licenseKey ||
      input.license_key ||
      input.apiKey ||
      input.api_key ||
      input.apiToken ||
      input.api_token ||
      input.token ||
      input.password ||
      saved?.password,
  )
  const warehouseId = clean(
    input.warehouseId || input.warehouse_id || input.clientId || saved?.warehouseId,
  )

  if (!username || !password) {
    throw new Error('Shipway email and license key are required')
  }

  return {
    apiBase: apiBase || DEFAULT_SHIPWAY_API_BASE,
    username,
    password,
    warehouseId,
  }
}

export type ShipwayRate = {
  carrier_id: number
  courier_name: string
  delivery_charge: number
  rto_charge: number
  charged_weight: number
  zone: number | string | null
}

export const fetchShipwayRates = async ({
  originPincode,
  destinationPincode,
  paymentType,
}: {
  originPincode: string
  destinationPincode: string
  paymentType: string
}): Promise<ShipwayRate[]> => {
  const config = await resolveConfig()
  const response = await axios.get(`${config.apiBase}/getshipwaycarrierrates`, {
    auth: { username: config.username, password: config.password },
    headers: { Accept: 'application/json' },
    params: {
      fromPincode: originPincode,
      toPincode: destinationPincode,
      paymentType: paymentType.toLowerCase() === 'cod' ? 'cod' : 'prepaid',
    },
    timeout: 60000,
  })

  const rows = Array.isArray(response.data?.rate_card) ? response.data.rate_card : []
  return rows
    .map((row: any) => ({
      carrier_id: Number(row?.carrier_id),
      courier_name: clean(row?.courier_name),
      delivery_charge: Number(row?.delivery_charge ?? 0),
      rto_charge: Number(row?.rto_charge ?? 0),
      charged_weight: Number(row?.charged_weight ?? 0),
      zone: row?.zone ?? null,
    }))
    .filter(
      (row: ShipwayRate) =>
        Number.isInteger(row.carrier_id) && row.courier_name && row.delivery_charge > 0,
    )
}

export const createShipwayShipment = async (params: any) => {
  const config = await resolveConfig({
    warehouseId: params.shipway_warehouse_id ?? params.shipwayWarehouseId,
  })
  if (!config.warehouseId) {
    throw new Error('Shipway warehouse ID is required before booking a shipment')
  }

  const carrierId = Number(params.courier_id)
  if (!Number.isInteger(carrierId) || carrierId <= 0) {
    throw new Error('A valid Shipway carrier ID is required')
  }

  const consignee = params.consignee || {}
  const nameParts = clean(consignee.name).split(/\s+/).filter(Boolean)
  const firstName = nameParts.shift() || 'Customer'
  const lastName = nameParts.join(' ')
  const products = (Array.isArray(params.order_items) ? params.order_items : []).map(
    (item: any) => ({
      product: clean(item?.name) || 'Product',
      price: String(Number(item?.price ?? 0)),
      product_code: clean(item?.sku) || 'SKU',
      hsn_code: clean(item?.hsn || item?.hsnCode),
      product_quantity: String(Number(item?.qty ?? item?.quantity ?? 1)),
      discount: String(Number(item?.discount ?? 0)),
      tax_rate: String(Number(item?.tax_rate ?? 0)),
      tax_title: 'IGST',
    }),
  )

  const payload = {
    order_id: clean(params.order_number),
    carrier_id: carrierId,
    warehouse_id: config.warehouseId,
    return_warehouse_id: config.warehouseId,
    products,
    discount: String(Number(params.discount ?? 0)),
    shipping: String(Number(params.shipping_charges ?? 0)),
    order_total: String(Number(params.order_amount ?? 0)),
    gift_card_amt: '0',
    taxes: '0',
    payment_type: String(params.payment_type).toLowerCase() === 'cod' ? 'C' : 'P',
    email: clean(consignee.email),
    billing_address: clean(consignee.address),
    billing_address2: clean(consignee.address_2),
    billing_city: clean(consignee.city),
    billing_state: clean(consignee.state),
    billing_country: clean(consignee.country) || 'India',
    billing_firstname: firstName,
    billing_lastname: lastName,
    billing_phone: clean(consignee.phone),
    billing_zipcode: clean(consignee.pincode),
    shipping_address: clean(consignee.address),
    shipping_address2: clean(consignee.address_2),
    shipping_city: clean(consignee.city),
    shipping_state: clean(consignee.state),
    shipping_country: clean(consignee.country) || 'India',
    shipping_firstname: firstName,
    shipping_lastname: lastName,
    shipping_phone: clean(consignee.phone),
    shipping_zipcode: clean(consignee.pincode),
    order_weight: String(Number(params.package_weight ?? params.weight ?? 0)),
    box_length: String(Number(params.package_length ?? params.length ?? 0)),
    box_breadth: String(Number(params.package_breadth ?? params.breadth ?? 0)),
    box_height: String(Number(params.package_height ?? params.height ?? 0)),
    order_date: clean(params.order_date) || new Date().toISOString().slice(0, 19).replace('T', ' '),
  }

  const response = await axios.post(`${config.apiBase}/v2orders`, payload, {
    auth: { username: config.username, password: config.password },
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    timeout: 60000,
  })
  const data = response.data || {}
  if (!data.success || !data.awb_response?.success || !data.awb_response?.AWB) {
    throw new Error(clean(data.message || data.awb_response?.message) || 'Shipway shipment failed')
  }

  return {
    raw: data,
    shipment_id: clean(data.awb_response.AWB),
    awb_number: clean(data.awb_response.AWB),
    courier_id: Number(data.awb_response.carrier_id ?? carrierId),
    courier_name: '',
    label: clean(data.awb_response.shipping_url),
  }
}

export const cancelShipwayOrder = async (orderId: string) => {
  const normalizedOrderId = clean(orderId)
  if (!normalizedOrderId) {
    throw new Error('Shipway order ID is required for cancellation')
  }

  const config = await resolveConfig()
  const response = await axios.post(
    `${config.apiBase}/Cancelorders/`,
    { order_ids: [normalizedOrderId] },
    {
      auth: { username: config.username, password: config.password },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      timeout: 60000,
    },
  )
  return response.data
}

const fetchCarriers = async (config: ShipwayConfig): Promise<ShipwayCarrier[]> => {
  const response = await axios.get(`${config.apiBase}/getcarrier`, {
    auth: { username: config.username, password: config.password },
    headers: { Accept: 'application/json' },
    // Shipway's carrier catalog can take more than 20 seconds on a cold request.
    timeout: 60000,
  })
  const payload = response.data
  const rawCarriers = Array.isArray(payload?.message)
    ? payload.message
    : Array.isArray(payload?.data)
      ? payload.data
      : []
  const carriers = rawCarriers
    .map((carrier: any) => ({
      id: Number(carrier?.id ?? carrier?.carrier_id),
      name: clean(carrier?.carrier_title || carrier?.name || carrier?.carrier_name),
    }))
    .filter((carrier: ShipwayCarrier) => Number.isInteger(carrier.id) && carrier.name)

  if (!carriers.length) {
    const message = clean(payload?.error || payload?.message) || 'Shipway returned no active carriers'
    throw new Error(message)
  }

  return carriers
}

const syncCarriers = async (carriers: ShipwayCarrier[]) => {
  for (const carrier of carriers) {
    await db
      .insert(couriers)
      .values({
        id: carrier.id,
        name: carrier.name,
        serviceProvider: SHIPWAY_PROVIDER,
        isEnabled: true,
        businessType: ['b2c'],
      })
      .onConflictDoUpdate({
        target: [couriers.id, couriers.serviceProvider],
        set: {
          name: carrier.name,
          businessType: ['b2c'],
          updatedAt: new Date(),
        },
      })
  }
}

export const saveShipwayCredentials = async (input: ShipwayCredentialInput) => {
  const config = await resolveConfig(input)
  const carriers = await fetchCarriers(config)

  await db
    .insert(courier_credentials)
    .values({
      provider: SHIPWAY_PROVIDER,
      apiBase: config.apiBase,
      username: config.username,
      password: config.password,
      ...(config.warehouseId ? { clientId: config.warehouseId } : {}),
    })
    .onConflictDoUpdate({
      target: courier_credentials.provider,
      set: {
        apiBase: config.apiBase,
        username: config.username,
        password: config.password,
        ...(config.warehouseId ? { clientId: config.warehouseId } : {}),
        updatedAt: new Date(),
      },
    })

  await syncCarriers(carriers)
  return { config, carriers }
}

export const verifyAndSyncShipwayCredentials = async (input: ShipwayCredentialInput = {}) => {
  const config = await resolveConfig(input)
  const carriers = await fetchCarriers(config)
  await syncCarriers(carriers)
  return { config, carriers }
}
