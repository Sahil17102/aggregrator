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
}

type IThinkConfig = { apiBase: string; accessToken: string; secretKey: string }

const clean = (value: unknown) => String(value ?? '').trim()
const normalizeBase = (value: unknown) =>
  (clean(value) || DEFAULT_ITHINK_API_BASE).replace(/\/+$/, '')

const readSavedCredentials = async () => {
  const [saved] = await db
    .select({
      apiBase: courier_credentials.apiBase,
      accessToken: courier_credentials.apiKey,
      secretKey: courier_credentials.password,
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
      clean(this.overrides.accessToken || this.overrides.access_token) &&
        clean(this.overrides.secretKey || this.overrides.secret_key),
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
}

export const saveIThinkCredentials = async (input: IThinkCredentialInput) => {
  const accessToken = clean(input.accessToken || input.access_token)
  const secretKey = clean(input.secretKey || input.secret_key)
  const apiBase = normalizeBase(input.apiBase)
  if (!accessToken || !secretKey) {
    throw new HttpError(400, 'iThink accessToken and secretKey are required')
  }

  await db
    .insert(courier_credentials)
    .values({ provider: ITHINK_PROVIDER, apiBase, apiKey: accessToken, password: secretKey })
    .onConflictDoUpdate({
      target: courier_credentials.provider,
      set: { apiBase, apiKey: accessToken, password: secretKey, updatedAt: new Date() },
    })
  return { apiBase, accessToken, secretKey }
}

export const maskIThinkSecret = (value: unknown) => {
  const normalized = clean(value)
  if (!normalized) return ''
  if (normalized.length <= 8) return '********'
  return `${normalized.slice(0, 4)}${'*'.repeat(normalized.length - 8)}${normalized.slice(-4)}`
}
