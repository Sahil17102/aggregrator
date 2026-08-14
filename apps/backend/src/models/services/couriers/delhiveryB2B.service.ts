import axios from 'axios'
import { HttpError } from '../../../utils/classes'

type DeliveryOneCredentialConfig = {
  username?: string
  password?: string
}

const DEFAULT_B2B_API_BASE = 'https://ltl-clients-api.delhivery.com'
const DEFAULT_MANIFEST_PATH = '/manifest'

export type DelhiveryB2BManifestPayload = {
  pickup_location_name?: string
  pickup_location_id?: string
  payment_mode: 'cod' | 'prepaid'
  cod_amount?: number
  weight: number
  dropoff_location: {
    consignee_name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email?: string
  }
  return_address?: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }
  shipment_details: Array<{
    order_id: string
    box_count: number
    description: string
    weight: number
    waybills: string[]
    master: boolean
  }>
  dimensions: Array<{
    box_count: number
    length: number
    width: number
    height: number
  }>
  rov_insurance: boolean
  enable_paperless_movement: boolean
  invoices: Array<{
    ewaybill: string
    inv_num: string
    inv_amt: number
    inv_qr_code: string
  }>
}

export type DelhiveryB2BManifestResult = {
  jobId: string
  lrn: string | null
  waybills: string[]
  processing: boolean
  raw: unknown
}

const normalize = (value?: string | null) => String(value || '').trim()

const extractMessage = (value: any, fallback: string) =>
  normalize(
    value?.message ||
      value?.error ||
      value?.reason ||
      value?.detail ||
      value?.status?.reason ||
      value?.data?.message,
  ) || fallback

const uniqueStrings = (values: unknown[]): string[] =>
  Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => normalize(value == null ? '' : String(value)))
        .filter(Boolean),
    ),
  )

const extractManifestStatus = (raw: any) => {
  const root = raw?.data ?? raw ?? {}
  const status = root?.status ?? root
  const value = status?.value ?? root?.value ?? root?.data ?? {}
  const type = normalize(status?.type || root?.type || root?.status_type).toLowerCase()
  const success = status?.success ?? root?.success
  const lrn = normalize(
    value?.lrnum ||
      value?.lrn ||
      value?.lr_number ||
      root?.lrnum ||
      root?.lrn ||
      root?.lr_number,
  )
  const waybills = uniqueStrings([
    value?.waybills,
    value?.awb_numbers,
    value?.awbs,
    value?.awb,
    root?.waybills,
    root?.awb_numbers,
    root?.awbs,
    root?.awb,
  ])

  return {
    complete: type === 'complete' || success === true || Boolean(lrn),
    failed: (type === 'complete' && success === false) || success === false,
    reason: extractMessage(status, extractMessage(root, 'Delhivery B2B manifestation failed')),
    lrn: lrn || null,
    waybills,
  }
}

export class DelhiveryB2BService {
  private static cachedToken: { value: string; expiresAt: number } | null = null
  private apiBase = normalize(
    process.env.DELIVERY_ONE_B2B_API_BASE || process.env.DELHIVERY_B2B_API_BASE,
  ) || DEFAULT_B2B_API_BASE
  private username = normalize(
    process.env.DELIVERY_ONE_USERNAME || process.env.DELIVERYONE_USERNAME,
  )
  private password = normalize(
    process.env.DELIVERY_ONE_PASSWORD || process.env.DELIVERYONE_PASSWORD,
  )
  private configLoaded = false

  static clearCachedToken() {
    DelhiveryB2BService.cachedToken = null
  }

  private async ensureConfigLoaded() {
    if (this.configLoaded) return
    this.configLoaded = true

    const forceEnvironment = ['1', 'true', 'yes'].includes(
      normalize(process.env.DELIVERY_ONE_B2B_FORCE_ENV_CONFIG).toLowerCase(),
    )
    if (forceEnvironment) {
      this.apiBase = this.apiBase.replace(/\/+$/, '')
      return
    }

    let config: DeliveryOneCredentialConfig | null = null
    try {
      const { getEffectiveCourierConfig } = await import('../courierCredentials.service')
      config = await getEffectiveCourierConfig<DeliveryOneCredentialConfig>('deliveryone', 'b2b')
    } catch (error: any) {
      if (!this.username || !this.password) throw error
      console.warn('[DelhiveryB2B] Credential database unavailable; using environment configuration.')
    }
    this.username = this.username || normalize(config?.username)
    this.password = this.password || normalize(config?.password)
    this.apiBase = this.apiBase.replace(/\/+$/, '')
  }

  private decodeTokenExpiry(token: string) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
      const expiry = Number(payload?.exp || 0) * 1000
      return Number.isFinite(expiry) && expiry > Date.now()
        ? expiry
        : Date.now() + 23 * 60 * 60 * 1000
    } catch {
      return Date.now() + 23 * 60 * 60 * 1000
    }
  }

  async getToken() {
    await this.ensureConfigLoaded()
    const cached = DelhiveryB2BService.cachedToken
    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
      return cached.value
    }

    if (!this.username || !this.password) {
      throw new HttpError(
        400,
        'Delhivery B2B username/password are not configured. Set DELIVERY_ONE_USERNAME and DELIVERY_ONE_PASSWORD.',
      )
    }

    try {
      const response = await axios.post(
        `${this.apiBase}/ums/login`,
        { username: this.username, password: this.password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 20000 },
      )
      const token = normalize(response.data?.data?.jwt || response.data?.jwt)
      if (!token) {
        throw new HttpError(502, 'Delhivery B2B login succeeded without returning a token.')
      }

      DelhiveryB2BService.cachedToken = {
        value: token,
        expiresAt: this.decodeTokenExpiry(token),
      }
      return token
    } catch (error: any) {
      if (error instanceof HttpError) throw error
      const status = Number(error?.response?.status || 502)
      throw new HttpError(
        status === 401 || status === 403 ? 401 : 502,
        extractMessage(error?.response?.data, 'Unable to authenticate with Delhivery B2B.'),
      )
    }
  }

  private async authorizationHeaders() {
    const token = await this.getToken()
    return { Authorization: `Bearer ${token}` }
  }

  private get manifestPath() {
    const configured = normalize(process.env.DELIVERY_ONE_B2B_MANIFEST_PATH)
    return (configured || DEFAULT_MANIFEST_PATH).startsWith('/')
      ? configured || DEFAULT_MANIFEST_PATH
      : `/${configured}`
  }

  private buildManifestForm(payload: DelhiveryB2BManifestPayload) {
    const form = new FormData()
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return
      form.append(key, typeof value === 'string' ? value : JSON.stringify(value))
    }

    append('pickup_location_name', payload.pickup_location_name)
    append('pickup_location_id', payload.pickup_location_id)
    append('payment_mode', payload.payment_mode)
    append('cod_amount', payload.cod_amount)
    append('weight', payload.weight)
    append('dropoff_location', payload.dropoff_location)
    append('return_address', payload.return_address)
    append('shipment_details', payload.shipment_details)
    append('dimensions', payload.dimensions)
    append('rov_insurance', payload.rov_insurance)
    append('enable_paperless_movement', payload.enable_paperless_movement)
    append('invoices', payload.invoices)
    return form
  }

  async createManifest(
    payload: DelhiveryB2BManifestPayload,
  ): Promise<DelhiveryB2BManifestResult> {
    await this.ensureConfigLoaded()
    const headers = await this.authorizationHeaders()

    try {
      const response = await axios.post(
        `${this.apiBase}${this.manifestPath}`,
        this.buildManifestForm(payload),
        { headers, timeout: 30000 },
      )
      const jobId = normalize(
        response.data?.job_id || response.data?.jobId || response.data?.data?.job_id,
      )
      if (!jobId) {
        throw new HttpError(
          502,
          extractMessage(response.data, 'Delhivery B2B did not return a manifestation job ID.'),
        )
      }

      const pollAttempts = Math.max(
        1,
        Math.min(20, Number(process.env.DELIVERY_ONE_B2B_MANIFEST_POLL_ATTEMPTS || 10)),
      )
      let latest: unknown = response.data

      for (let attempt = 0; attempt < pollAttempts; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        const statusResponse = await axios.get(`${this.apiBase}${this.manifestPath}`, {
          headers,
          params: { job_id: jobId },
          timeout: 20000,
        })
        latest = statusResponse.data
        const status = extractManifestStatus(latest)
        if (status.failed) {
          throw new HttpError(502, status.reason)
        }
        if (status.complete) {
          return {
            jobId,
            lrn: status.lrn,
            waybills: status.waybills,
            processing: false,
            raw: latest,
          }
        }
      }

      return { jobId, lrn: null, waybills: [], processing: true, raw: latest }
    } catch (error: any) {
      if (error instanceof HttpError) throw error
      const status = Number(error?.response?.status || 502)
      if (status === 401 || status === 403) {
        DelhiveryB2BService.clearCachedToken()
      }
      throw new HttpError(
        status >= 400 && status < 500 ? status : 502,
        extractMessage(error?.response?.data, 'Delhivery B2B shipment booking failed.'),
      )
    }
  }
}
