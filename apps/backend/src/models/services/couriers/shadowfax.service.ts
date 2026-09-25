import axios from 'axios'
import { HttpError } from '../../../utils/classes'

const clean = (value: unknown) => String(value ?? '').trim()
const DEFAULT_SHADOWFAX_API_BASE = 'https://dale.shadowfax.in/api'

const config = () => {
  const apiBase = clean(process.env.SHADOWFAX_API_BASE || DEFAULT_SHADOWFAX_API_BASE).replace(/\/+$/, '')
  const token = clean(process.env.SHADOWFAX_API_TOKEN)
  if (!token) throw new HttpError(500, 'Shadowfax API token is not configured')
  return { apiBase, token }
}

const headers = (token: string) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Token ${token}`,
})

const address = (source: any, fallbackName = '') => ({
  name: clean(source?.name || source?.warehouse_name || fallbackName),
  contact: clean(source?.phone || source?.contact),
  address_line_1: clean(source?.address || source?.address_line_1),
  address_line_2: clean(source?.address_2 || source?.address_line_2),
  city: clean(source?.city),
  state: clean(source?.state),
  pincode: Number(source?.pincode),
  ...(clean(source?.addressNickname || source?.unique_code)
    ? { unique_code: clean(source?.addressNickname || source?.unique_code) }
    : {}),
})

const errorMessage = (data: any, fallback: string) =>
  clean(data?.message || data?.detail || data?.responseMsg || data?.errors?.[0]?.message) || fallback

export const checkShadowfaxServiceability = async (pincodes: Array<string | number>) => {
  const { apiBase, token } = config()
  const normalized = pincodes.map(clean).filter(Boolean)
  const response = await axios.get(`${apiBase}/v1/clients/serviceability/`, {
    headers: headers(token),
    params: { service: 'customer_delivery', page: 1, count: normalized.length || 1, pincodes: normalized.join(',') },
    timeout: 60000,
  })
  return response.data
}

export const createShadowfaxShipment = async (params: any) => {
  const { apiBase, token } = config()
  const pickup = address(params.pickup, params.company?.name)
  const rto = address(params.rto || params.pickup, params.company?.name)
  const consignee = address(params.consignee)
  const items = Array.isArray(params.order_items) ? params.order_items : []
  const orderAmount = Number(params.order_amount ?? 0)
  const isCod = String(params.payment_type || '').toLowerCase() === 'cod'
  const actualWeightGrams = Math.max(0, Math.round(Number(params.package_weight ?? params.weight ?? 0) * 1000))
  const volumetricWeightGrams = Math.max(
    0,
    Math.round(
      (Number(params.package_length ?? params.length ?? 0) *
        Number(params.package_breadth ?? params.breadth ?? 0) *
        Number(params.package_height ?? params.height ?? 0)) /
        5,
    ),
  )

  const payload = {
    order_type: 'warehouse',
    order_details: {
      client_order_id: clean(params.order_number),
      actual_weight: actualWeightGrams,
      volumetric_weight: volumetricWeightGrams,
      product_value: orderAmount,
      payment_mode: isCod ? 'COD' : 'Prepaid',
      cod_amount: isCod ? orderAmount : 0,
      total_amount: orderAmount,
      order_service: 'regular',
      ...(clean(params.ewbn || params.ewb || params.ewbn_number || params.ewaybill_number)
        ? { eway_bill: clean(params.ewbn || params.ewb || params.ewbn_number || params.ewaybill_number) }
        : {}),
      ...(clean(params.company?.gst) ? { gstin_number: clean(params.company.gst) } : {}),
    },
    customer_details: {
      ...consignee,
      ...(clean(params.consignee?.alternate_phone) ? { alternate_contact: clean(params.consignee.alternate_phone) } : {}),
      location_type: clean(params.address_type) || 'residential',
    },
    pickup_details: pickup,
    rto_details: rto,
    product_details: (items.length ? items : [{ name: 'Product', sku: 'SKU', qty: 1, price: orderAmount }]).map(
      (item: any) => ({
        sku_name: clean(item?.name) || 'Product',
        sku_id: clean(item?.sku),
        hsn_code: clean(item?.hsn || item?.hsnCode),
        invoice_no: clean(params.invoice_number || params.invoices?.[0]?.invoiceNumber),
        category: clean(params.category_of_goods) || 'General',
        price: Number(item?.price ?? 0),
        additional_details: { quantity: Number(item?.qty ?? item?.quantity ?? 1) },
      }),
    ),
  }

  try {
    const response = await axios.post(`${apiBase}/v3/clients/orders/`, payload, {
      headers: headers(token),
      timeout: 60000,
    })
    const data = response.data?.data || response.data
    const awb = clean(data?.awb_number)
    if (!awb) throw new HttpError(502, errorMessage(response.data, 'Shadowfax shipment creation failed'))
    return { raw: response.data, shipment_id: clean(data?.id) || awb, awb_number: awb }
  } catch (error: any) {
    if (error instanceof HttpError) throw error
    throw new HttpError(error?.response?.status || 502, errorMessage(error?.response?.data, 'Shadowfax shipment creation failed'))
  }
}

export const cancelShadowfaxShipment = async (awbNumber: string, clientOrderId?: string) => {
  const { apiBase, token } = config()
  const response = await axios.post(
    `${apiBase}/v3/clients/orders/cancel/`,
    {
      ...(clean(awbNumber) ? { awb_number: clean(awbNumber) } : {}),
      ...(clean(clientOrderId) ? { client_order_id: clean(clientOrderId) } : {}),
      cancel_remarks: 'Cancelled as per client request',
    },
    { headers: headers(token), timeout: 60000 },
  )
  return response.data
}

export const trackShadowfaxShipment = async (awbNumber: string) => {
  const { apiBase, token } = config()
  const response = await axios.get(
    `${apiBase}/v4/clients/orders/${encodeURIComponent(clean(awbNumber))}/track/`,
    { headers: headers(token), timeout: 60000 },
  )
  return response.data
}
