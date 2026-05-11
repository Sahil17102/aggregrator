import axios from 'axios'
import { HttpError } from '../../../utils/classes'
import { DeliveryOneConfig, getEffectiveCourierConfig } from '../courierCredentials.service'

type DeliveryOnePincodeRecord = {
  postal_code?: {
    pickup?: string
    cod?: string
    pre_paid?: string
    remark?: string
    pin?: number | string
    city?: string
    state_code?: string
    [key: string]: any
  }
  [key: string]: any
}

export type DeliveryOnePincodeServiceabilityResponse = {
  serviceable: boolean
  pickupAvailable: boolean
  codAvailable: boolean
  prepaidAvailable: boolean
  embargoed: boolean
  record: DeliveryOnePincodeRecord | null
  raw: any
}

export type DeliveryOnePairServiceabilityResponse = {
  serviceable: boolean
  origin: DeliveryOnePincodeServiceabilityResponse
  destination: DeliveryOnePincodeServiceabilityResponse
  codAvailable: boolean
  prepaidAvailable: boolean
  raw: {
    origin: any
    destination: any
  }
}

export type DeliveryOneHeavyPincodeServiceabilityResponse = {
  serviceable: boolean
  codAvailable: boolean
  prepaidAvailable: boolean
  records: any[]
  raw: any
}

export type DeliveryOneWaybillFetchResponse = {
  mode: 'single' | 'bulk'
  requestedCount: number
  waybills: string[]
  raw: any
}

export class DeliveryOneService {
  private apiBase =
    process.env.DELIVERY_ONE_API_BASE ||
    process.env.DELIVERYONE_API_BASE ||
    'https://track.delhivery.com'
  private apiKey = process.env.DELIVERY_ONE_API_KEY || process.env.DELIVERYONE_API_KEY || ''
  private static cachedConfig: DeliveryOneConfig | null | undefined

  static clearCachedConfig() {
    DeliveryOneService.cachedConfig = undefined
  }

  private normalizeBaseApi(value: string) {
    return (String(value || '').trim() || 'https://track.delhivery.com').replace(/\/+$/, '')
  }

  private maskToken(value: string) {
    const normalized = String(value || '').trim()
    if (!normalized) return ''
    if (normalized.length <= 8) return '********'
    return `${normalized.slice(0, 4)}${'*'.repeat(Math.max(normalized.length - 8, 0))}${normalized.slice(-4)}`
  }

  private log(prefix: string, details: Record<string, any>) {
    console.log(`[DeliveryOne] ${prefix}`, details)
  }

  private async ensureConfigLoaded() {
    if (DeliveryOneService.cachedConfig === undefined) {
      DeliveryOneService.cachedConfig = await getEffectiveCourierConfig<DeliveryOneConfig>(
        'deliveryone',
        'b2c',
      )
    }

    const cfg = DeliveryOneService.cachedConfig
    if (cfg) {
      this.apiBase = cfg.apiBase || this.apiBase
      this.apiKey = cfg.apiKey || this.apiKey
    }

    this.apiBase = this.normalizeBaseApi(this.apiBase)
    this.log('Config loaded', {
      apiBase: this.apiBase,
      hasApiKey: Boolean(this.apiKey),
      apiKey: this.maskToken(this.apiKey),
      source: cfg ? 'courier_credentials_or_env_fallback' : 'env_only',
    })
  }

  private async getHeaders() {
    await this.ensureConfigLoaded()

    if (!this.apiKey) {
      throw new HttpError(
        400,
        'Delivery One API key is not configured. Save the token in Courier Credentials first.',
      )
    }

    return {
      Authorization: `Token ${this.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }

  private async getToken() {
    await this.ensureConfigLoaded()

    if (!this.apiKey) {
      throw new HttpError(
        400,
        'Delivery One API key is not configured. Save the token in Courier Credentials first.',
      )
    }

    return this.apiKey
  }

  private isYes(value: unknown) {
    const normalized = String(value ?? '').trim().toLowerCase()
    return ['y', 'yes', 'true', '1', 'available', 'serviceable'].includes(normalized)
  }

  private getRecords(raw: any): DeliveryOnePincodeRecord[] {
    if (Array.isArray(raw?.delivery_codes)) return raw.delivery_codes
    if (Array.isArray(raw?.data?.delivery_codes)) return raw.data.delivery_codes
    if (Array.isArray(raw)) return raw
    return []
  }

  private extractWaybills(raw: any): string[] {
    const candidates = [
      raw?.waybill,
      raw?.waybills,
      raw?.data?.waybill,
      raw?.data?.waybills,
      raw?.data,
      raw,
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        const normalized = candidate.trim()
        if (!normalized) continue

        return normalized
          .split(/[,\s]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      }

      if (Array.isArray(candidate)) {
        const waybills = candidate
          .flatMap((item) => {
            if (typeof item === 'string' || typeof item === 'number') return [String(item)]
            if (item && typeof item === 'object') {
              return [
                item.waybill,
                item.wbn,
                item.awb,
                item.awb_number,
                item.waybill_number,
              ].filter(Boolean)
            }
            return []
          })
          .map((item) => String(item).trim())
          .filter(Boolean)

        if (waybills.length) return waybills
      }
    }

    return []
  }

  async fetchWaybills(count = 1): Promise<DeliveryOneWaybillFetchResponse> {
    const normalizedCount = Math.floor(Number(count || 1))
    if (!Number.isFinite(normalizedCount) || normalizedCount < 1) {
      throw new HttpError(400, 'Delivery One waybill count must be at least 1.')
    }
    if (normalizedCount > 10000) {
      throw new HttpError(400, 'Delivery One bulk waybill count cannot be more than 10,000.')
    }

    const token = await this.getToken()
    const mode = normalizedCount === 1 ? 'single' : 'bulk'
    const path =
      mode === 'single' ? '/waybill/api/fetch/json/' : '/waybill/api/bulk/json/'
    const url = `${this.apiBase}${path}`

    try {
      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
        params: {
          token,
          ...(mode === 'bulk' ? { count: normalizedCount } : {}),
        },
        timeout: 20000,
      })

      const waybills = this.extractWaybills(response.data)
      this.log('Fetch waybills', {
        mode,
        requestedCount: normalizedCount,
        status: response.status,
        receivedCount: waybills.length,
      })

      return {
        mode,
        requestedCount: normalizedCount,
        waybills,
        raw: response.data,
      }
    } catch (error: any) {
      const status = Number(error?.response?.status || 502)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        error?.message ||
        'Delivery One waybill fetch failed'

      this.log('Fetch waybills failed', {
        mode,
        requestedCount: normalizedCount,
        status,
        response: error?.response?.data || null,
        message,
      })

      throw new HttpError(status, message)
    }
  }

  async fetchSingleWaybill(): Promise<DeliveryOneWaybillFetchResponse> {
    return this.fetchWaybills(1)
  }

  async checkPincodeServiceability(
    pincode: string | number,
  ): Promise<DeliveryOnePincodeServiceabilityResponse> {
    const normalizedPincode = String(pincode ?? '').replace(/\D/g, '').slice(0, 6)
    if (!/^\d{6}$/.test(normalizedPincode)) {
      throw new HttpError(400, 'A valid 6-digit pincode is required for Delivery One serviceability.')
    }

    const headers = await this.getHeaders()
    const url = `${this.apiBase}/c/api/pin-codes/json/`

    try {
      const response = await axios.get(url, {
        headers,
        params: { filter_codes: normalizedPincode },
        timeout: 20000,
      })

      const records = this.getRecords(response.data)
      const record = records[0] ?? null
      const postalCode = record?.postal_code ?? {}
      const remark = String(postalCode?.remark ?? '').trim()
      const embargoed = remark.toLowerCase() === 'embargo'
      const hasRecord = records.length > 0
      const pickupAvailable = hasRecord && this.isYes(postalCode?.pickup)
      const codAvailable = hasRecord && this.isYes(postalCode?.cod)
      const prepaidAvailable = hasRecord && this.isYes(postalCode?.pre_paid)
      const serviceable = hasRecord && !embargoed

      this.log('B2C pincode serviceability', {
        pincode: normalizedPincode,
        status: response.status,
        records: records.length,
        pickupAvailable,
        codAvailable,
        prepaidAvailable,
        embargoed,
      })

      return {
        serviceable,
        pickupAvailable,
        codAvailable,
        prepaidAvailable,
        embargoed,
        record,
        raw: response.data,
      }
    } catch (error: any) {
      const status = Number(error?.response?.status || 502)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Delivery One pincode serviceability failed'

      this.log('B2C pincode serviceability failed', {
        pincode: normalizedPincode,
        status,
        response: error?.response?.data || null,
        message,
      })

      throw new HttpError(status, message)
    }
  }

  async checkPairServiceability(params: {
    originPincode: string | number
    destinationPincode: string | number
    paymentType?: 'cod' | 'prepaid' | string
  }): Promise<DeliveryOnePairServiceabilityResponse> {
    const [origin, destination] = await Promise.all([
      this.checkPincodeServiceability(params.originPincode),
      this.checkPincodeServiceability(params.destinationPincode),
    ])

    const requiresCod = String(params.paymentType || 'prepaid').toLowerCase() === 'cod'
    const destinationPaymentServiceable = requiresCod
      ? destination.codAvailable
      : destination.prepaidAvailable
    const serviceable =
      origin.serviceable &&
      origin.pickupAvailable &&
      destination.serviceable &&
      destinationPaymentServiceable

    return {
      serviceable,
      origin,
      destination,
      codAvailable: destination.codAvailable,
      prepaidAvailable: destination.prepaidAvailable,
      raw: {
        origin: origin.raw,
        destination: destination.raw,
      },
    }
  }

  async checkHeavyPincodeServiceability(
    pincode: string | number,
    productType = 'Heavy',
  ): Promise<DeliveryOneHeavyPincodeServiceabilityResponse> {
    const normalizedPincode = String(pincode ?? '').replace(/\D/g, '').slice(0, 6)
    if (!/^\d{6}$/.test(normalizedPincode)) {
      throw new HttpError(
        400,
        'A valid 6-digit pincode is required for Delivery One heavy serviceability.',
      )
    }

    const headers = await this.getHeaders()
    const url = `${this.apiBase}/api/dc/fetch/serviceability/pincode`

    try {
      const response = await axios.get(url, {
        headers,
        params: {
          product_type: productType,
          pincode: normalizedPincode,
        },
        timeout: 20000,
      })

      const raw = response.data
      const records = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : raw && typeof raw === 'object'
            ? [raw]
            : []

      const normalizedText = JSON.stringify(raw || {}).toLowerCase()
      const serviceable =
        records.length > 0 &&
        !records.some(
          (record: any) => String(record?.status || record?.remark || '').toUpperCase() === 'NSZ',
        ) &&
        !normalizedText.includes('"nsz"')

      const paymentTypes = records
        .map((record: any) =>
          String(record?.payment_type || record?.paymentType || '').toLowerCase(),
        )
        .filter(Boolean)
      const codAvailable =
        serviceable &&
        (paymentTypes.length === 0 || paymentTypes.some((type: string) => type.includes('cod')))
      const prepaidAvailable =
        serviceable &&
        (paymentTypes.length === 0 ||
          paymentTypes.some(
            (type: string) => type.includes('prepaid') || type.includes('pre-paid'),
          ))

      this.log('Heavy pincode serviceability', {
        pincode: normalizedPincode,
        productType,
        status: response.status,
        records: records.length,
        serviceable,
        codAvailable,
        prepaidAvailable,
      })

      return {
        serviceable,
        codAvailable,
        prepaidAvailable,
        records,
        raw,
      }
    } catch (error: any) {
      const status = Number(error?.response?.status || 502)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Delivery One heavy pincode serviceability failed'

      this.log('Heavy pincode serviceability failed', {
        pincode: normalizedPincode,
        productType,
        status,
        response: error?.response?.data || null,
        message,
      })

      throw new HttpError(status, message)
    }
  }
}
