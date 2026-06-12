import axios from 'axios'
import bwipjs from 'bwip-js'
import { and, eq } from 'drizzle-orm'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import PdfPrinter from 'pdfmake'
import { db } from '../client'
import { b2b_orders } from '../schema/b2bOrders'
import { b2c_orders } from '../schema/b2cOrders'
import { userProfiles } from '../schema/userProfile'
import { users } from '../schema/users'
import { presignUpload } from './upload.service'

type FontFiles = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type FontPreset = {
  family: string
  files: FontFiles
  probeFiles: string[]
}

type LabelSnapshot = {
  order: any
  sourceTable: 'b2c' | 'b2b' | 'memory'
}

const compactStorageToken = (...values: Array<string | number | null | undefined>) => {
  const raw = values.find((value) => value !== null && value !== undefined && String(value).trim())
  const cleaned = String(raw ?? Date.now())
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(-12)

  return cleaned || Date.now().toString(36)
}

const normalizeText = (value: unknown, fallback = '-') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const normalizeNumber = (value: unknown) => {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

const formatMoney = (value: number | string | null | undefined, short = false) => {
  const symbol = selectedFont.family === 'Helvetica' ? 'Rs.' : '\u20B9'
  const amount = normalizeNumber(value)
  const formatted = `${symbol} ${amount.toFixed(2)}`
  return short ? formatted.replace(/\.00$/, '.0') : formatted
}

const splitTextLines = (value: unknown) =>
  String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const compactPlaceLine = (city?: unknown, state?: unknown, pincode?: unknown) => {
  const place = [city, state]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
  const pin = String(pincode ?? '').trim()

  if (place && pin) return `${place} ${pin}`
  return place || pin
}

const buildAddressLines = (...parts: Array<unknown>) =>
  parts
    .flatMap((part) => splitTextLines(part))
    .map((line) => line.trim())
    .filter(Boolean)

const parseMaybeJson = <T>(value: unknown): T | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return value as T
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed) as T
  } catch {
    return null
  }
}

const formatDisplayDate = (value: unknown, includeSeconds = false) => {
  if (value === null || value === undefined || String(value).trim() === '') return '-'

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }

  if (includeSeconds) formatOptions.second = '2-digit'

  const parts = new Intl.DateTimeFormat('en-GB', formatOptions)
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})

  const hour = (parts.hour || '').replace(/^0/, '') || '12'
  const minute = parts.minute || '00'
  const second = includeSeconds ? `:${parts.second || '00'}` : ''
  const dayPeriod = parts.dayPeriod ? ` ${parts.dayPeriod.toUpperCase()}` : ''

  return `${parts.day || '01'} ${parts.month || 'Jan'} ${parts.year || '1970'}, ${hour}:${minute}${second}${dayPeriod}`
}

const isValidDataUrl = (str: string | null | undefined): str is string =>
  typeof str === 'string' && str.startsWith('data:image/')

const bufferToDataUrl = async (buffer: Buffer): Promise<string | null> => {
  if (!buffer || buffer.length === 0) return null

  try {
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

async function generateQrBase64(text: string): Promise<string | null> {
  if (!text) return null

  try {
    const png = await bwipjs.toBuffer({
      bcid: 'qrcode',
      text,
      scale: 4,
      includetext: false,
      padding: 4,
    } as any)

    return `data:image/png;base64,${png.toString('base64')}`
  } catch (err) {
    console.warn('ChoiceMee label QR generation failed:', err)
    return null
  }
}

const loadChoiceMeeLogoDataUrl = () => {
  const candidates = [
    path.resolve(process.cwd(), 'apps/client/public/brand/choiceme-logo.png'),
    path.resolve(process.cwd(), '../client/public/brand/choiceme-logo.png'),
    path.resolve(__dirname, '../../../../client/public/brand/choiceme-logo.png'),
  ]

  for (const candidate of candidates) {
    try {
      if (!existsSync(candidate)) continue
      const file = readFileSync(candidate)
      const dataUrl = file.length > 0 ? `data:image/png;base64,${file.toString('base64')}` : null
      if (isValidDataUrl(dataUrl)) return dataUrl
    } catch {
      // Try next candidate.
    }
  }

  return null
}

const FONT_PRESETS: FontPreset[] = [
  {
    family: 'Arial',
    files: {
      normal: 'C:/Windows/Fonts/arial.ttf',
      bold: 'C:/Windows/Fonts/arialbd.ttf',
      italics: 'C:/Windows/Fonts/ariali.ttf',
      bolditalics: 'C:/Windows/Fonts/arialbi.ttf',
    },
    probeFiles: [
      'C:/Windows/Fonts/arial.ttf',
      'C:/Windows/Fonts/arialbd.ttf',
      'C:/Windows/Fonts/ariali.ttf',
      'C:/Windows/Fonts/arialbi.ttf',
    ],
  },
  {
    family: 'DejaVuSans',
    files: {
      normal: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      italics: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf',
      bolditalics: '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf',
    },
    probeFiles: [
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf',
    ],
  },
  {
    family: 'LiberationSans',
    files: {
      normal: '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
      bold: '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
      italics: '/usr/share/fonts/truetype/liberation2/LiberationSans-Italic.ttf',
      bolditalics: '/usr/share/fonts/truetype/liberation2/LiberationSans-BoldItalic.ttf',
    },
    probeFiles: [
      '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
      '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
      '/usr/share/fonts/truetype/liberation2/LiberationSans-Italic.ttf',
      '/usr/share/fonts/truetype/liberation2/LiberationSans-BoldItalic.ttf',
    ],
  },
  {
    family: 'Helvetica',
    files: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
    probeFiles: [],
  },
]

const selectedFont =
  FONT_PRESETS.find((preset) =>
    preset.probeFiles.length === 0 ? true : preset.probeFiles.every((file) => existsSync(file)),
  ) ?? FONT_PRESETS[FONT_PRESETS.length - 1]

const fonts = {
  [selectedFont.family]: selectedFont.files,
} as Record<string, FontFiles>

const printer = new PdfPrinter(fonts as any)
const pageWidth = 612
const pageHeight = 792
const innerWidth = 564

const divider = {
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: innerWidth,
      y2: 0,
      lineWidth: 0.5,
      lineColor: '#e5e7eb',
    },
  ],
  margin: [0, 10, 0, 10],
}

const pickRuntimeLabelFields = (order: any) => {
  const extras: Record<string, any> = {}
  for (const key of [
    'barcode_img',
    'barcode_url',
    'barcode_image',
    'barcode',
    'oid_barcode',
    'sort_code',
    'delhivery_label_meta',
    'deliveryone_label_meta',
    'label_generated_at',
  ]) {
    if (order?.[key] !== undefined && order?.[key] !== null && order?.[key] !== '') {
      extras[key] = order[key]
    }
  }

  return extras
}

const selectOrderFromTable = async (tx: any, table: any, where: any) => {
  const [row] = await tx.select().from(table).where(where).limit(1)
  return row ?? null
}

const resolveOrderCandidate = async (tx: any, order: any): Promise<LabelSnapshot | null> => {
  const orderId = normalizeText(order?.id, '')
  const userId = normalizeText(order?.user_id, '')
  const orderNumber = normalizeText(order?.order_number, '')
  const orderRef = normalizeText(order?.order_id, '')
  const awbNumber = normalizeText(order?.awb_number, '')

  const candidates: Array<() => Promise<LabelSnapshot | null>> = []

  if (orderId) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.id, orderId))
      if (b2cRow) {
        return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' as const }
      }

      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.id, orderId))
      if (b2bRow) {
        return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' as const }
      }
      return null
    })
  }

  if (userId && orderNumber) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(
        tx,
        b2c_orders,
        and(eq(b2c_orders.user_id, userId), eq(b2c_orders.order_number, orderNumber)),
      )
      if (b2cRow) {
        return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' as const }
      }

      const b2bRow = await selectOrderFromTable(
        tx,
        b2b_orders,
        and(eq(b2b_orders.user_id, userId), eq(b2b_orders.order_number, orderNumber)),
      )
      if (b2bRow) {
        return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' as const }
      }
      return null
    })
  }

  if (orderRef) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.order_id, orderRef))
      if (b2cRow) {
        return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' as const }
      }

      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.order_id, orderRef))
      if (b2bRow) {
        return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' as const }
      }
      return null
    })
  }

  if (awbNumber) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.awb_number, awbNumber))
      if (b2cRow) {
        return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' as const }
      }

      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.awb_number, awbNumber))
      if (b2bRow) {
        return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' as const }
      }
      return null
    })
  }

  if (orderNumber) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.order_number, orderNumber))
      if (b2cRow) {
        return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' as const }
      }

      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.order_number, orderNumber))
      if (b2bRow) {
        return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' as const }
      }
      return null
    })
  }

  for (const candidate of candidates) {
    try {
      const result = await candidate()
      if (result) return result
    } catch (err) {
      console.warn('ChoiceMee label snapshot lookup failed:', err)
    }
  }

  return null
}

export async function resolveLabelOrderSnapshot(order: any, tx: any = db): Promise<LabelSnapshot> {
  const resolved = await resolveOrderCandidate(tx, order)
  if (resolved) return resolved

  return {
    order: { ...order, ...pickRuntimeLabelFields(order) },
    sourceTable: 'memory',
  }
}

const extractLineItems = (order: any) => {
  const directProducts = parseMaybeJson<any[]>(order?.products)
  if (Array.isArray(directProducts) && directProducts.length > 0) return directProducts

  const packageRows = parseMaybeJson<any[]>(order?.packages)
  if (!Array.isArray(packageRows) || packageRows.length === 0) return []

  const flattened = packageRows.flatMap((pkg) => {
    if (Array.isArray(pkg?.products) && pkg.products.length > 0) {
      return pkg.products.map((product: any) => ({
        ...product,
        boxId: product?.boxId ?? pkg?.boxId ?? pkg?.box_id ?? null,
        boxName: product?.boxName ?? pkg?.boxName ?? pkg?.box_name ?? null,
      }))
    }

    return [
      {
        ...pkg,
        productName: pkg?.productName ?? pkg?.boxName ?? pkg?.box_name ?? pkg?.name ?? 'Item',
        name: pkg?.name ?? pkg?.boxName ?? pkg?.box_name ?? 'Item',
        qty: pkg?.qty ?? pkg?.quantity ?? 1,
      },
    ]
  })

  return flattened
}

const normalizeLineItem = (item: any) => {
  const quantity = Math.max(1, normalizeNumber(item?.qty ?? item?.quantity ?? 1))
  const unitPrice = normalizeNumber(item?.price ?? item?.rate ?? item?.amount ?? item?.unitPrice)
  const explicitTotal = item?.total ?? item?.lineTotal ?? item?.amount_total ?? null
  const lineTotal =
    explicitTotal !== null && explicitTotal !== undefined && explicitTotal !== ''
      ? normalizeNumber(explicitTotal)
      : Math.max(0, unitPrice * quantity - normalizeNumber(item?.discount))

  const productId = normalizeText(
    item?.productId ?? item?.product_id ?? item?.sku ?? item?.skuCode ?? item?.boxId ?? item?.id,
  )
  const productName = normalizeText(
    item?.productName ?? item?.name ?? item?.title ?? item?.boxName ?? item?.box_name,
  )

  return {
    productId,
    productName,
    unitPrice,
    quantity,
    lineTotal,
  }
}

const getPartyName = (order: any, companyInfo: Record<string, any>, userRow: any, pickupDetails: Record<string, any>) =>
  normalizeText(
    pickupDetails?.warehouse_name ||
      companyInfo?.brandName ||
      companyInfo?.businessName ||
      companyInfo?.companyName ||
      userRow?.email?.split('@')?.[0] ||
      order?.merchant_name ||
      'ChoiceMee',
  )

const getSellerId = (order: any, userId: string, pickupDetails: Record<string, any>) =>
  normalizeText(
    pickupDetails?.pickup_location_id ||
      order?.pickup_location_id ||
      order?.pickupLocationId ||
      order?.warehouse_id ||
      `CM-${userId.slice(0, 8).toUpperCase()}`,
  )

const getFooterUrl = (order: any) => {
  const reference = normalizeText(order?.order_number ?? order?.invoice_number ?? order?.order_id ?? order?.id, '')
  return `https://choicemee.in/tax-invoice/${encodeURIComponent(reference || String(order?.id ?? 'label'))}`
}

export async function generateLabelForOrder(order: any, userId: string, tx: any = db) {
  const snapshot = await resolveLabelOrderSnapshot(order, tx)
  const resolvedOrder = snapshot.order ?? order
  const resolvedUserId = normalizeText(resolvedOrder?.user_id ?? userId, '')

  if (!resolvedUserId || resolvedUserId === '-') {
    throw new Error('Label generation requires a valid user id')
  }

  if (userId && resolvedOrder?.user_id && userId !== resolvedOrder.user_id) {
    console.warn('ChoiceMee label generator received a mismatched user id; using the order owner.')
  }

  const [profileRow, userRow] = await Promise.all([
    tx.select().from(userProfiles).where(eq(userProfiles.userId, resolvedUserId)).limit(1).then((rows: any[]) => rows[0] ?? null),
    tx.select().from(users).where(eq(users.id, resolvedUserId)).limit(1).then((rows: any[]) => rows[0] ?? null),
  ])

  const companyInfo = (profileRow?.companyInfo || {}) as Record<string, any>
  const gstDetails = (profileRow?.gstDetails || {}) as Record<string, any>
  const pickupDetails = (parseMaybeJson<Record<string, any>>(resolvedOrder?.pickup_details) || {}) as Record<string, any>
  const lineItems = extractLineItems(resolvedOrder)
  const normalizedItems = lineItems.map(normalizeLineItem)

  const logoDataUrl = loadChoiceMeeLogoDataUrl()
  const footerUrl = getFooterUrl(resolvedOrder)
  const qrDataUrl = await generateQrBase64(footerUrl)

  const sellerName = getPartyName(resolvedOrder, companyInfo, userRow, pickupDetails)
  const sellerAddress = pickupDetails?.address || companyInfo?.companyAddress || companyInfo?.address || ''
  const sellerPlace = compactPlaceLine(
    pickupDetails?.city || companyInfo?.city,
    pickupDetails?.state || companyInfo?.state,
    pickupDetails?.pincode || companyInfo?.pincode,
  )
  const sellerCountry = normalizeText(
    pickupDetails?.country || companyInfo?.country || resolvedOrder?.country || 'India',
  )
  const sellerAddressLines = buildAddressLines(sellerAddress, sellerPlace, sellerCountry).slice(0, 3)
  const sellerGst = normalizeText(
    companyInfo?.companyGst ||
      companyInfo?.companyGST ||
      gstDetails?.gstNumber ||
      pickupDetails?.gst_number ||
      pickupDetails?.gstNumber,
  )
  const sellerEmail = normalizeText(
    companyInfo?.companyEmail || companyInfo?.contactEmail || userRow?.email || '-',
  )
  const sellerContact = normalizeText(
    companyInfo?.companyContactNumber || companyInfo?.contactNumber || userRow?.phone || pickupDetails?.phone || '-',
  )
  const sellerIdentifier = getSellerId(resolvedOrder, resolvedUserId, pickupDetails)

  const customerName = normalizeText(
    resolvedOrder?.buyer_name || resolvedOrder?.company_name || resolvedOrder?.consignee_name || resolvedOrder?.name || 'Customer',
  )
  const customerPhone = normalizeText(resolvedOrder?.buyer_phone || resolvedOrder?.phone || resolvedOrder?.customer_phone || '-')
  const customerAddressLines = buildAddressLines(
    resolvedOrder?.address,
    compactPlaceLine(resolvedOrder?.city, resolvedOrder?.state, resolvedOrder?.pincode),
    normalizeText(resolvedOrder?.country || 'India'),
  ).slice(0, 3)

  const billingAddressLines = customerAddressLines
  const shippingAddressLines = customerAddressLines
  const billingPhone = customerPhone
  const shippingPhone = customerPhone

  const invoiceNo = normalizeText(
    resolvedOrder?.invoice_number || resolvedOrder?.order_number || resolvedOrder?.order_id || resolvedOrder?.id,
  )
  const orderId = normalizeText(
    resolvedOrder?.order_id || resolvedOrder?.order_number || resolvedOrder?.id,
  )
  const orderDate = formatDisplayDate(
    resolvedOrder?.order_date || resolvedOrder?.created_at || resolvedOrder?.updated_at,
    true,
  )
  const generatedAt = formatDisplayDate(
    resolvedOrder?.label_generated_at || resolvedOrder?.updated_at || resolvedOrder?.created_at || new Date(),
  )
  const paymentRaw = String(
    resolvedOrder?.payment_type || resolvedOrder?.order_type || resolvedOrder?.type || '',
  )
    .trim()
    .toLowerCase()
  const paymentMethod =
    paymentRaw === 'cod'
      ? 'COD'
      : paymentRaw === 'prepaid'
        ? 'PREPAID'
        : paymentRaw
          ? paymentRaw.toUpperCase()
          : 'PREPAID'
  const paymentColor = paymentMethod === 'COD' ? '#d97706' : '#00c7a8'
  const subtotal = normalizedItems.reduce((sum, item) => sum + Math.max(0, item.lineTotal), 0)
  const estimatedTax = normalizeNumber(
    resolvedOrder?.tax_amount ??
      resolvedOrder?.gst_amount ??
      resolvedOrder?.total_tax ??
      resolvedOrder?.tax ??
      0,
  )
  const shippingCharge = normalizeNumber(
    resolvedOrder?.shipping_charges ?? resolvedOrder?.freight_charges ?? 0,
  )
  const totalAmount = normalizeNumber(
    resolvedOrder?.invoice_amount ?? resolvedOrder?.order_amount ?? subtotal + estimatedTax + shippingCharge,
  )

  const productRows: any[] =
    normalizedItems.length > 0
      ? normalizedItems.slice(0, 8).map((item) => [
          {
            text: item.productId || '-',
            fontSize: 7.7,
            color: '#374151',
            border: [false, false, false, true],
            margin: [0, 10, 0, 10],
          },
          {
            text: item.productName || '-',
            fontSize: 7.7,
            color: '#111111',
            border: [false, false, false, true],
            margin: [0, 10, 0, 10],
          },
          {
            text: formatMoney(item.unitPrice),
            fontSize: 7.7,
            color: '#111111',
            border: [false, false, false, true],
            margin: [0, 10, 0, 10],
          },
          {
            text: String(item.quantity),
            fontSize: 7.7,
            color: '#111111',
            border: [false, false, false, true],
            margin: [0, 10, 0, 10],
          },
          {
            text: formatMoney(item.lineTotal, true),
            fontSize: 7.7,
            color: '#111111',
            border: [false, false, false, true],
            margin: [0, 10, 0, 10],
          },
        ] as any)
      : [
          [
            {
              text: '-',
              fontSize: 7.7,
              color: '#374151',
              border: [false, false, false, true],
              margin: [0, 10, 0, 10],
              colSpan: 5,
            },
            {} as any,
            {} as any,
            {} as any,
            {} as any,
          ] as any,
        ]

  if (normalizedItems.length > 8) {
    productRows.push([
      {
        text: `+ ${normalizedItems.length - 8} more item(s)`,
        fontSize: 7.2,
        italics: true,
        color: '#6b7280',
        border: [false, false, false, true],
        margin: [0, 8, 0, 8],
        colSpan: 5,
      },
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    ] as any)
  }

  const productTable = {
    table: {
      headerRows: 1,
      widths: [72, 220, 88, 84, '*'],
      body: [
        [
          {
            text: 'Product ID',
            fontSize: 6.6,
            bold: true,
            color: '#4b5563',
            border: [false, false, false, true],
            margin: [0, 0, 0, 8],
          },
          {
            text: 'Product Name',
            fontSize: 6.6,
            bold: true,
            color: '#4b5563',
            border: [false, false, false, true],
            margin: [0, 0, 0, 8],
          },
          {
            text: 'Amount',
            fontSize: 6.6,
            bold: true,
            color: '#4b5563',
            border: [false, false, false, true],
            margin: [0, 0, 0, 8],
          },
          {
            text: 'Quantity',
            fontSize: 6.6,
            bold: true,
            color: '#4b5563',
            border: [false, false, false, true],
            margin: [0, 0, 0, 8],
          },
          {
            text: 'Total',
            fontSize: 6.6,
            bold: true,
            color: '#4b5563',
            border: [false, false, false, true],
            margin: [0, 0, 0, 8],
          },
        ],
        ...productRows,
      ],
    },
    layout: {
      hLineColor: () => '#e5e7eb',
      vLineColor: () => '#ffffff',
      hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 12],
  }

  const summaryTable = {
    table: {
      widths: ['*', 92],
      body: [
        [
          { text: 'Sub Total:', fontSize: 7.7, color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
          { text: formatMoney(subtotal), fontSize: 7.7, alignment: 'right', color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
        ],
        [
          { text: 'Estimated Tax:', fontSize: 7.7, color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
          { text: formatMoney(estimatedTax), fontSize: 7.7, alignment: 'right', color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
        ],
        [
          { text: 'Shipping Charge:', fontSize: 7.7, color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
          { text: formatMoney(shippingCharge), fontSize: 7.7, alignment: 'right', color: '#111111', border: [false, false, false, false], margin: [0, 6, 0, 6] },
        ],
        [
          {
            text: 'Total (\u20B9):',
            fontSize: 8.2,
            bold: true,
            color: '#111111',
            border: [false, true, false, false],
            margin: [0, 8, 0, 6],
          },
          {
            text: formatMoney(totalAmount),
            fontSize: 8.2,
            bold: true,
            alignment: 'right',
            color: '#111111',
            border: [false, true, false, false],
            margin: [0, 8, 0, 6],
          },
        ],
      ],
    },
    layout: 'noBorders',
  }

  const content: any[] = [
    {
      columns: [
        {
          width: 130,
          text: generatedAt,
          fontSize: 8,
          color: '#111111',
        },
        {
          width: '*',
          text: 'ChoiceMee',
          fontSize: 8,
          color: '#111111',
          alignment: 'center',
        },
      ],
      margin: [0, 0, 0, 64],
    },
    {
      columns: [
        {
          width: '*',
          stack: [
            logoDataUrl
              ? {
                  image: 'logo',
                  fit: [104, 52],
                  margin: [0, 0, 0, 6],
                }
              : {
                  text: 'ChoiceMee',
                  fontSize: 18,
                  bold: true,
                  color: '#111111',
                  margin: [0, 0, 0, 6],
                },
            { text: sellerName, fontSize: 12, color: '#111111', margin: [0, 2, 0, 10] },
            { text: 'ADDRESS', fontSize: 7.7, bold: true, color: '#374151', margin: [0, 0, 0, 8] },
            ...sellerAddressLines.map((line) => ({
              text: line,
              fontSize: 7.7,
              color: '#374151',
              margin: [0, 0, 0, 2],
            })),
          ],
        },
        {
          width: 180,
          stack: [
            {
              text: `GST Number: ${sellerGst || '-'}`,
              fontSize: 7.7,
              color: '#2b2b2b',
              margin: [0, 0, 0, 6],
            },
            {
              text: [
                { text: 'Email: ', fontSize: 7.7, color: '#2b2b2b' },
                { text: sellerEmail || '-', bold: true, fontSize: 7.7, color: '#111111' },
              ],
              margin: [0, 0, 0, 6],
            },
            {
              text: [
                { text: 'Contact No: ', fontSize: 7.7, color: '#2b2b2b' },
                { text: sellerContact || '-', bold: true, fontSize: 7.7, color: '#111111' },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              text: `Seller Id: ${sellerIdentifier}`,
              fontSize: 4.9,
              color: '#444444',
              margin: [0, 0, 0, 6],
            },
            qrDataUrl
              ? {
                  image: 'qrCode',
                  width: 74,
                  alignment: 'right',
                  margin: [0, 2, 0, 0],
                }
              : { text: '' },
          ],
          alignment: 'right',
        },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 10],
    },
    divider,
    {
      table: {
        widths: [88, 88, 132, 108, 148],
        body: [
          [
            {
              stack: [
                { text: 'INVOICE NO', fontSize: 6.6, bold: true, color: '#4b5563', margin: [0, 0, 0, 4] },
                { text: `# ${invoiceNo}`, fontSize: 6.6, bold: true, color: '#111111' },
              ],
              border: [false, false, false, false],
            },
            {
              stack: [
                { text: 'ORDER ID', fontSize: 6.6, bold: true, color: '#4b5563', margin: [0, 0, 0, 4] },
                { text: `# ${orderId}`, fontSize: 6.6, bold: true, color: '#111111' },
              ],
              border: [false, false, false, false],
            },
            {
              stack: [
                { text: 'DATE', fontSize: 6.6, bold: true, color: '#4b5563', margin: [0, 0, 0, 4] },
                { text: orderDate, fontSize: 6.6, bold: true, color: '#111111' },
              ],
              border: [false, false, false, false],
            },
            {
              stack: [
                { text: 'PAYMENT METHOD', fontSize: 6.6, bold: true, color: '#4b5563', margin: [0, 0, 0, 4] },
                { text: paymentMethod, fontSize: 5.5, bold: true, color: paymentColor },
              ],
              border: [false, false, false, false],
            },
            {
              stack: [
                { text: 'TOTAL AMOUNT', fontSize: 6.6, bold: true, color: '#4b5563', margin: [0, 0, 0, 4] },
                { text: formatMoney(totalAmount), fontSize: 6.6, bold: true, color: '#111111' },
              ],
              border: [false, false, false, false],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },
    divider,
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'BILLING ADDRESS', fontSize: 8.8, bold: true, color: '#4b5563', margin: [0, 0, 0, 8] },
            { text: customerName, fontSize: 8.8, bold: true, color: '#111111', margin: [0, 0, 0, 6] },
            ...billingAddressLines.map((line) => ({
              text: line,
              fontSize: 7.7,
              color: '#374151',
              margin: [0, 0, 0, 2],
            })),
            { text: `Phone: ${billingPhone || '-'}`, fontSize: 7.7, color: '#374151', margin: [0, 0, 0, 0] },
          ].filter(Boolean),
        },
        {
          width: '*',
          stack: [
            { text: 'SHIPPING ADDRESS', fontSize: 8.8, bold: true, color: '#4b5563', margin: [0, 0, 0, 8] },
            { text: customerName, fontSize: 8.8, bold: true, color: '#111111', margin: [0, 0, 0, 6] },
            ...shippingAddressLines.map((line) => ({
              text: line,
              fontSize: 7.7,
              color: '#374151',
              margin: [0, 0, 0, 2],
            })),
            { text: `Phone: ${shippingPhone || '-'}`, fontSize: 7.7, color: '#374151', margin: [0, 0, 0, 0] },
          ].filter(Boolean),
        },
      ],
      columnGap: 24,
      margin: [0, 0, 0, 34],
    },
    productTable,
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 270,
          stack: [summaryTable],
        },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 54],
    },
    {
      columns: [
        {
          width: 340,
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: `Authorized Signature for ${sellerName}`,
                  fontSize: 7.7,
                  color: '#0f5f8d',
                  fillColor: '#ffffff',
                  margin: [14, 12, 14, 12],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.75,
            vLineWidth: () => 0.75,
            hLineColor: () => '#8fd0f5',
            vLineColor: () => '#8fd0f5',
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
        { width: '*', text: '' },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 0],
    },
  ]

  const docDefinition: any = {
    info: {
      title: 'ChoiceMee Shipment Label',
      author: 'ChoiceMee',
      subject: 'ChoiceMee invoice-style shipment label',
      creator: 'ChoiceMee Label Generator',
    },
    pageSize: { width: pageWidth, height: pageHeight },
    pageMargins: [24, 24, 24, 24],
    defaultStyle: {
      font: selectedFont.family,
      fontSize: 8,
      color: '#2b2b2b',
    },
    footer: (currentPage: number, pageCount: number) => ({
      margin: [24, 0, 24, 18],
      columns: [
        { text: footerUrl, fontSize: 8, color: '#111111', alignment: 'left' },
        { text: `${currentPage}/${pageCount}`, fontSize: 8, color: '#111111', alignment: 'right' },
      ],
    }),
    content,
    ...(logoDataUrl || qrDataUrl ? { images: { ...(logoDataUrl ? { logo: logoDataUrl } : {}), ...(qrDataUrl ? { qrCode: qrDataUrl } : {}) } } : {}),
  }

  try {
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Buffer[] = []

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk))
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
      pdfDoc.on('error', (err) => reject(err))
      pdfDoc.end()
    })

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF buffer is empty or invalid')
    }

    const { uploadUrl, key } = await presignUpload({
      filename: `l-${compactStorageToken(resolvedOrder?.order_number, resolvedOrder?.id, resolvedOrder?.order_id)}.pdf`,
      contentType: 'application/pdf',
      userId: resolvedUserId,
      folderKey: 'labels',
    })

    const finalUploadUrl = Array.isArray(uploadUrl) ? uploadUrl[0] : uploadUrl
    const labelKey = Array.isArray(key) ? key[0] : key

    if (!finalUploadUrl || !labelKey) {
      throw new Error('Failed to get presigned URL for label upload')
    }

    const uploadResponse = await axios.put(finalUploadUrl, pdfBuffer, {
      headers: { 'Content-Type': 'application/pdf' },
      timeout: 60000,
      validateStatus: (status) => status >= 200 && status < 300,
    })

    if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
      throw new Error(`Label upload failed with status ${uploadResponse.status}`)
    }

    const finalKey = typeof labelKey === 'string' ? labelKey.trim() : ''
    if (!finalKey) {
      throw new Error('Label key is invalid or empty after upload')
    }

    console.log(`ChoiceMee label generated for ${resolvedOrder?.order_number || resolvedOrder?.id}: ${finalKey}`)
    return finalKey
  } catch (err: any) {
    console.error(
      `Failed to generate/upload label for order ${resolvedOrder?.order_number || resolvedOrder?.id}:`,
      err?.message || err,
      err?.stack,
    )
    throw new Error(`Label generation/upload failed: ${err?.message || err}`)
  }
}
