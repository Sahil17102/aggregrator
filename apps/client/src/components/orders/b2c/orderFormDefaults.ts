import type { B2COrder } from '../../../types/generic.types'
import type { B2CFormData, Product } from './B2COrderForm'

const padDatePart = (value: number) => String(value).padStart(2, '0')

const getLocalDateInputValue = () => {
  const today = new Date()
  return `${today.getFullYear()}-${padDatePart(today.getMonth() + 1)}-${padDatePart(today.getDate())}`
}

const normalizeDateInput = (value?: string | null) => {
  const normalized = String(value || '').trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : getLocalDateInputValue()
}

const normalizeKgValue = (value?: number | string | null) => {
  const numericValue = Number(value ?? 0)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0
  return numericValue > 50 ? numericValue / 1000 : numericValue
}

const getOrderProducts = (order: B2COrder | null): Product[] => {
  const rawProducts: unknown = order?.products
  const products = Array.isArray(rawProducts) ? rawProducts : []

  if (!products.length) {
    return [{ productName: '', price: 0, quantity: 1 }]
  }

  return products.map((product: any) => ({
    productName: String(product?.productName ?? product?.name ?? ''),
    price: Number(product?.price ?? 0),
    quantity: Number(product?.quantity ?? product?.qty ?? 1),
    sku: String(product?.sku ?? ''),
    hsnCode: String(product?.hsnCode ?? product?.hsn ?? ''),
    discount: Number(product?.discount ?? 0),
    taxRate: Number(product?.taxRate ?? product?.tax_rate ?? 0),
  }))
}

export const getB2COrderFormDefaults = (order: B2COrder | null): Partial<B2CFormData> => {
  const pickupDetails = (order?.pickup_details || {}) as NonNullable<B2COrder['pickup_details']> & {
    pickup_date?: string
    pickup_time?: string
  }
  const rtoDetails = (order?.rto_details || {}) as NonNullable<B2COrder['rto_details']>

  return {
    buyerName: order?.buyer_name || '',
    buyerPhone: order?.buyer_phone || '',
    buyerEmail: order?.buyer_email || '',
    address: order?.address || '',
    pincode: order?.pincode || '',
    city: order?.city || '',
    state: order?.state || '',
    country: order?.country || 'India',
    products: getOrderProducts(order),
    weight: normalizeKgValue(order?.weight),
    length: Number(order?.length ?? 0),
    breadth: Number(order?.breadth ?? 0),
    height: Number(order?.height ?? 0),
    orderId: order?.order_number || '',
    orderDate: normalizeDateInput(order?.order_date),
    orderType: order?.order_type || 'prepaid',
    courierPartner: '',
    shippingCharges: Number(order?.shipping_charges ?? 0),
    transactionFee: Number(order?.transaction_fee ?? 0),
    isRtoSame: !order?.is_rto_different,
    giftWrap: Number(order?.gift_wrap ?? 0),
    discount: Number(order?.discount ?? 0),
    prepaidAmount: Number(order?.prepaid_amount ?? 0),
    courierCod: Number(order?.cod_charges ?? 0),
    otherCharges: Number(order?.other_charges ?? 0),
    forwardCharges: Number(order?.freight_charges ?? 0),
    courierCost: (order as any)?.courier_cost ?? null,
    rtoLocationPincode: rtoDetails?.pincode || '',
    rtoLocationName: rtoDetails?.warehouse_name || rtoDetails?.name || '',
    pickupCity: pickupDetails?.city || '',
    pickupState: pickupDetails?.state || '',
    rtoCity: rtoDetails?.city || '',
    rtoState: rtoDetails?.state || '',
    rtoLocationPOCName: rtoDetails?.name || '',
    rtoLocationPOCPhone: rtoDetails?.phone || '',
    rtoAddress: rtoDetails?.address || '',
    pickupLocationPOCPhone: pickupDetails?.phone || '',
    pickupLocationId: order?.pickup_location_id || '',
    pickupLocationPincode: pickupDetails?.pincode || '',
    pickupLocationName: pickupDetails?.warehouse_name || pickupDetails?.name || '',
    pickupAddress: pickupDetails?.address || '',
    pickupLocationPOCName: pickupDetails?.name || '',
    courierPartnerId: '',
    courierOptionKey: '',
    selectedMaxSlabWeight: null,
    orderAmount: Number(order?.order_amount ?? 0),
    pickupDate: normalizeDateInput(pickupDetails?.pickup_date),
    pickupTime: pickupDetails?.pickup_time || '',
    chargeableWeight: null,
    volumetricWeight: null,
    slabs: null,
    zone: order?.delivery_location || '',
    zoneId: '',
  }
}
