import axios, { AxiosError } from 'axios'
import { eq } from 'drizzle-orm'
import { db } from '../../client'
import { courier_credentials } from '../../schema/courierCredentials'
import { HttpError } from '../../../utils/classes'

export const ITHINK_PROVIDER = 'ithink'
export const DEFAULT_ITHINK_API_BASE = 'https://my.ithinklogistics.com/api_v3'
export const STAGING_ITHINK_API_BASE = 'https://pre-alpha.ithinklogistics.com/api_v3'

export const ITHINK_OPERATIONS = {
  syncOrder: '/order/sync.json',
  trackOrder: '/order/track.json',
  addOrder: '/order/add.json',
  orderDetails: '/order/get_details.json',
  printLabel: '/shipping/label.json',
  printManifest: '/shipping/manifest.json',
  printInvoice: '/shipping/invoice.json',
  cancelOrder: '/order/cancel.json',
  updatePayment: '/order/update-payment.json',
  getAirwaybill: '/order/get_awb.json',
  checkPincode: '/pincode/check.json',
  getState: '/state/get.json',
  getCity: '/city/get.json',
  addWarehouse: '/warehouse/add.json',
  getWarehouse: '/warehouse/get.json',
  getRate: '/rate/check.json',
  getZoneRate: '/rate/zone_rate.json',
  getRemittance: '/remittance/get.json',
  getRemittanceDetails: '/remittance/get_details.json',
  getStore: '/store/get.json',
  getStoreOrderDetails: '/store/get-order-details.json',
  getStoreOrderList: '/store/get-order-list.json',
  reattemptOrRto: '/ndr/add-reattempt-rto.json',
} as const

export type IThinkOperation = keyof typeof ITHINK_OPERATIONS
export type IThinkCredentialInput = {
  apiBase?: string
  accessToken?: string
  access_token?: string
  secretKey?: string
  secret_key?: string
  pickupAddressId?: string | number
  pickup_address_id?: string | number
}

type IThinkConfig = {
  apiBase: string
  accessToken: string
  secretKey: string
  pickupAddressId: string
}

export type IThinkRate = {
  courierId: number
  courierName: string
  serviceType: string
  prepaid: boolean
  cod: boolean
  pickup: boolean
  reversePickup: boolean
  weightSlabKg: number
  freightCharges: number
  codCharges: number
  gstCharges: number
  totalRate: number
  zone: string
  deliveryTatDays: number | null
  raw: any
}

const clean = (value: unknown) => String(value ?? '').trim()
const normalizeBase = (value: unknown) =>
  (clean(value) || DEFAULT_ITHINK_API_BASE).replace(/\/+$/, '')

const readSavedCredentials = async () => {
  const [saved] = await db
    .select({
      apiBase: courier_credentials.apiBase,
      accessToken: courier_credentials.apiKey,
      secretKey: courier_credentials.password,
      pickupAddressId: courier_credentials.clientId,
    })
    .from(courier_credentials)
    .where(eq(courier_credentials.provider, ITHINK_PROVIDER))
    .limit(1)
  return saved
}

const validatePayloadLimits = (operation: IThinkOperation, payload: Record<string, any>) => {
  const shipments = Array.isArray(payload.shipments) ? payload.shipments : []
  if (operation === 'syncOrder' && shipments.length > 25) {
    throw new HttpError(400, 'iThink Sync Order accepts at most 25 shipments per request')
  }
  if (operation === 'addOrder' && shipments.length > 10) {
    throw new HttpError(400, 'iThink Add Order accepts at most 10 shipments per request')
  }
  if (operation === 'trackOrder') {
    const awbs = Array.isArray(payload.awb_number_list)
      ? payload.awb_number_list
      : clean(payload.awb_number_list).split(',').filter(Boolean)
    if (awbs.length > 10) {
      throw new HttpError(400, 'iThink Track Order accepts at most 10 AWB numbers per request')
    }
  }
}

export class IThinkService {
  constructor(private readonly overrides: IThinkCredentialInput = {}) {}

  private async getConfig(): Promise<IThinkConfig> {
    let saved: Awaited<ReturnType<typeof readSavedCredentials>> | undefined
    const hasCompleteOverrides = Boolean(
      clean(
        this.overrides.accessToken ||
          this.overrides.access_token ||
          process.env.ITHINK_ACCESS_TOKEN,
      ) &&
        clean(
          this.overrides.secretKey ||
            this.overrides.secret_key ||
            process.env.ITHINK_SECRET_KEY,
        ),
    )
    if (!hasCompleteOverrides) {
      try {
        saved = await readSavedCredentials()
      } catch (error: any) {
        if (!(error?.code === '42P01' || error?.message?.includes('does not exist'))) throw error
      }
    }

    const config = {
      apiBase: normalizeBase(
        this.overrides.apiBase || saved?.apiBase || process.env.ITHINK_API_BASE,
      ),
      accessToken: clean(
        this.overrides.accessToken ||
          this.overrides.access_token ||
          saved?.accessToken ||
          process.env.ITHINK_ACCESS_TOKEN,
      ),
      secretKey: clean(
        this.overrides.secretKey ||
          this.overrides.secret_key ||
          saved?.secretKey ||
          process.env.ITHINK_SECRET_KEY,
      ),
      pickupAddressId: clean(
        this.overrides.pickupAddressId ||
          this.overrides.pickup_address_id ||
          saved?.pickupAddressId ||
          process.env.ITHINK_PICKUP_ADDRESS_ID,
      ),
    }
    if (!config.accessToken || !config.secretKey) {
      throw new HttpError(
        400,
        'iThink Logistics access token and secret key are not configured',
      )
    }
    return config
  }

  async call(operation: IThinkOperation, payload: Record<string, any> = {}) {
    const path = ITHINK_OPERATIONS[operation]
    if (!path) throw new HttpError(400, `Unsupported iThink operation: ${operation}`)
    validatePayloadLimits(operation, payload)
    const config = await this.getConfig()

    try {
      const response = await axios.post(
        `${config.apiBase}${path}`,
        {
          data: {
            ...payload,
            access_token: config.accessToken,
            secret_key: config.secretKey,
          },
        },
        {
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          timeout: 60000,
        },
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<any>
      const status = axiosError.response?.status || 502
      const upstream = axiosError.response?.data
      const message =
        clean(upstream?.message || upstream?.error || axiosError.message) ||
        `iThink ${operation} request failed`
      const wrapped = new HttpError(status, message)
      ;(wrapped as any).upstream = upstream
      throw wrapped
    }
  }

  syncOrder = (payload: Record<string, any>) => this.call('syncOrder', payload)
  trackOrder = (payload: Record<string, any>) => this.call('trackOrder', payload)
  addOrder = (payload: Record<string, any>) => this.call('addOrder', payload)
  orderDetails = (payload: Record<string, any>) => this.call('orderDetails', payload)
  printLabel = (payload: Record<string, any>) => this.call('printLabel', payload)
  printManifest = (payload: Record<string, any>) => this.call('printManifest', payload)
  printInvoice = (payload: Record<string, any>) => this.call('printInvoice', payload)
  cancelOrder = (payload: Record<string, any>) => this.call('cancelOrder', payload)
  updatePayment = (payload: Record<string, any>) => this.call('updatePayment', payload)
  getAirwaybill = (payload: Record<string, any>) => this.call('getAirwaybill', payload)
  checkPincode = (payload: Record<string, any>) => this.call('checkPincode', payload)
  getState = (payload: Record<string, any>) => this.call('getState', payload)
  getCity = (payload: Record<string, any>) => this.call('getCity', payload)
  addWarehouse = (payload: Record<string, any>) => this.call('addWarehouse', payload)
  getWarehouse = (payload: Record<string, any>) => this.call('getWarehouse', payload)
  getRate = (payload: Record<string, any>) => this.call('getRate', payload)
  getZoneRate = (payload: Record<string, any>) => this.call('getZoneRate', payload)
  getRemittance = (payload: Record<string, any>) => this.call('getRemittance', payload)
  getRemittanceDetails = (payload: Record<string, any>) =>
    this.call('getRemittanceDetails', payload)
  getStore = (payload: Record<string, any>) => this.call('getStore', payload)
  getStoreOrderDetails = (payload: Record<string, any>) =>
    this.call('getStoreOrderDetails', payload)
  getStoreOrderList = (payload: Record<string, any>) => this.call('getStoreOrderList', payload)
  reattemptOrRto = (payload: Record<string, any>) => this.call('reattemptOrRto', payload)

  async fetchRates(payload: Record<string, any>): Promise<IThinkRate[]> {
    const response = await this.getRate(payload)
    if (String(response?.status || '').toLowerCase() !== 'success') {
      throw new HttpError(502, clean(response?.html_message || response?.data) || 'iThink rate lookup failed')
    }
    const rows = Array.isArray(response?.data) ? response.data : []
    return rows
      .map((row: any): IThinkRate => ({
        courierId: Number(row?.logistic_id),
        courierName: clean(row?.logistic_name) || 'iThink Logistics',
        serviceType: clean(row?.service_type),
        prepaid: clean(row?.prepaid).toUpperCase() === 'Y',
        cod: clean(row?.cod).toUpperCase() === 'Y',
        pickup: clean(row?.pickup).toUpperCase() === 'Y',
        reversePickup: clean(row?.rev_pickup).toUpperCase() === 'Y',
        weightSlabKg: Number(row?.weight_slab || 0),
        freightCharges: Number(row?.freight_charges || 0),
        codCharges: Number(row?.cod_charges || 0),
        gstCharges: Number(row?.gst_charges || 0),
        totalRate: Number(row?.rate || 0),
        zone: clean(row?.logistics_zone),
        deliveryTatDays: Number.isFinite(Number(row?.delivery_tat))
          ? Number(row.delivery_tat)
          : null,
        raw: row,
      }))
      .filter((row: IThinkRate) => Number.isInteger(row.courierId) && row.totalRate > 0)
  }

  async createShipment(params: any) {
    const config = await this.getConfig()
    const pickupAddressId = clean(
      params?.ithink_pickup_address_id ?? params?.pickup_address_id ?? config.pickupAddressId,
    )
    const configuredPickupPincode = clean(process.env.ITHINK_PICKUP_PINCODE)
    const selectedPickupPincode = clean(
      params?.pickup?.pincode ?? params?.pickup_details?.pincode ?? params?.pickup_pincode,
    )
    if (!pickupAddressId) {
      throw new HttpError(
        400,
        'iThink pickup address ID is not configured. Save it with the iThink courier credentials first.',
      )
    }
    if (
      configuredPickupPincode &&
      selectedPickupPincode &&
      configuredPickupPincode !== selectedPickupPincode
    ) {
      throw new HttpError(
        400,
        `iThink is configured for pickup pincode ${configuredPickupPincode}, not ${selectedPickupPincode}.`,
      )
    }

    const consignee = params?.consignee || {}
    const pickup = params?.pickup || params?.pickup_details || {}
    const items = Array.isArray(params?.order_items) ? params.order_items : []
    const paymentMode = String(params?.payment_type || '').toLowerCase() === 'cod' ? 'COD' : 'Prepaid'
    const codAmount = paymentMode === 'COD' ? Number(params?.order_amount || 0) : 0
    const selectedCourierName = clean(params?.courier_name || params?.selected_courier_name)
    if (!selectedCourierName) {
      throw new HttpError(400, 'Selected iThink courier name is required')
    }

    const orderDate = params?.order_date ? new Date(params.order_date) : new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    const formattedOrderDate = `${pad(orderDate.getDate())}-${pad(orderDate.getMonth() + 1)}-${orderDate.getFullYear()} ${pad(orderDate.getHours())}:${pad(orderDate.getMinutes())}:${pad(orderDate.getSeconds())}`
    const shipment = {
      waybill: clean(params?.waybill),
      order: clean(params?.order_number),
      sub_order: '',
      order_date: formattedOrderDate,
      total_amount: String(Number(params?.order_amount || 0)),
      name: clean(consignee.name),
      company_name: clean(consignee.company_name),
      add: clean(consignee.address),
      add2: clean(consignee.address_2),
      add3: '',
      pin: clean(consignee.pincode),
      city: clean(consignee.city),
      state: clean(consignee.state),
      country: clean(consignee.country) || 'India',
      phone: clean(consignee.phone),
      alt_phone: '',
      email: clean(consignee.email),
      is_billing_same_as_shipping: 'yes',
      billing_name: clean(consignee.name),
      billing_company_name: clean(consignee.company_name),
      billing_add: clean(consignee.address),
      billing_add2: clean(consignee.address_2),
      billing_add3: '',
      billing_pin: clean(consignee.pincode),
      billing_city: clean(consignee.city),
      billing_state: clean(consignee.state),
      billing_country: clean(consignee.country) || 'India',
      billing_phone: clean(consignee.phone),
      billing_alt_phone: '',
      billing_email: clean(consignee.email),
      products: items.map((item: any) => ({
        product_name: clean(item?.name) || 'Product',
        product_sku: clean(item?.sku),
        product_quantity: String(Number(item?.qty ?? item?.quantity ?? 1)),
        product_price: String(Number(item?.price ?? 0)),
        product_tax_rate: String(Number(item?.tax_rate ?? 0)),
        product_hsn_code: clean(item?.hsn ?? item?.hsnCode),
        product_discount: String(Number(item?.discount ?? 0)),
      })),
      shipment_length: String(Number(params?.package_length ?? params?.length ?? 0)),
      shipment_width: String(Number(params?.package_breadth ?? params?.breadth ?? 0)),
      shipment_height: String(Number(params?.package_height ?? params?.height ?? 0)),
      weight: String(Number(params?.package_weight ?? params?.weight ?? 0) / 1000),
      shipping_charges: String(Number(params?.shipping_charges ?? 0)),
      giftwrap_charges: '0',
      transaction_charges: String(Number(params?.transaction_fee ?? 0)),
      total_discount: String(Number(params?.discount ?? 0)),
      first_attemp_discount: '0',
      cod_charges: String(Number(params?.cod_charges ?? 0)),
      advance_amount: '0',
      cod_amount: String(codAmount),
      payment_mode: paymentMode,
      reseller_name: clean(params?.company?.name),
      eway_bill_number: clean(params?.ewaybill_number ?? params?.ewbn),
      gst_number: clean(params?.company?.gst),
      return_address_id: pickupAddressId,
      pickup_name: clean(pickup?.warehouse_name || pickup?.name),
    }

    const response = await this.addOrder({
      shipments: [shipment],
      pickup_address_id: pickupAddressId,
      logistics: selectedCourierName,
      s_type: clean(params?.shipping_mode || params?.service_type).toLowerCase(),
      order_type: '',
    })
    const result = Array.isArray(response?.data) ? response.data[0] : response?.data
    const resultShipment = Array.isArray(result?.shipments)
      ? result.shipments[0]
      : Array.isArray(response?.shipments)
        ? response.shipments[0]
        : result?.shipment || result
    const awbNumber = clean(
      resultShipment?.waybill || resultShipment?.awb_number || resultShipment?.awb || response?.awb_number,
    )
    if (!awbNumber || String(response?.status || '').toLowerCase() === 'error') {
      throw new HttpError(
        502,
        clean(response?.html_message || response?.message || resultShipment?.remark) ||
          'iThink shipment creation failed',
      )
    }
    return { raw: response, shipment_id: awbNumber, awb_number: awbNumber }
  }
}

export const saveIThinkCredentials = async (input: IThinkCredentialInput) => {
  const accessToken = clean(input.accessToken || input.access_token)
  const secretKey = clean(input.secretKey || input.secret_key)
  const pickupAddressId = clean(input.pickupAddressId || input.pickup_address_id)
  const apiBase = normalizeBase(input.apiBase)
  if (!accessToken || !secretKey) {
    throw new HttpError(400, 'iThink accessToken and secretKey are required')
  }

  await db
    .insert(courier_credentials)
    .values({ provider: ITHINK_PROVIDER, apiBase, apiKey: accessToken, password: secretKey, clientId: pickupAddressId })
    .onConflictDoUpdate({
      target: courier_credentials.provider,
      set: { apiBase, apiKey: accessToken, password: secretKey, clientId: pickupAddressId, updatedAt: new Date() },
    })
  return { apiBase, accessToken, secretKey, pickupAddressId }
}

export const maskIThinkSecret = (value: unknown) => {
  const normalized = clean(value)
  if (!normalized) return ''
  if (normalized.length <= 8) return '********'
  return `${normalized.slice(0, 4)}${'*'.repeat(normalized.length - 8)}${normalized.slice(-4)}`
}
