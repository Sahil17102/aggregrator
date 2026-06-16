import axios from 'axios'
import { and, eq } from 'drizzle-orm'
import PdfPrinter from 'pdfmake'
import { db } from '../client'
import { b2b_orders } from '../schema/b2bOrders'
import { b2c_orders } from '../schema/b2cOrders'
import { userProfiles } from '../schema/userProfile'
import { users } from '../schema/users'
import { getDelhiveryCredentials } from './delhiveryCredentials.service'
import { getEffectiveCourierConfig, type DeliveryOneConfig } from './courierCredentials.service'
import { presignUpload } from './upload.service'

type LabelSnapshot = {
  order: any
  sourceTable: 'b2c' | 'b2b' | 'memory'
}

type FontFiles = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

const normalizeText = (value: unknown, fallback = '-') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const normalizeNumber = (value: unknown) => {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

const formatMoney = (value: number | string | null | undefined) => {
  const amount = normalizeNumber(value)
  return `Rs. ${amount.toFixed(2)}`
}

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

const splitTextLines = (value: unknown) =>
  String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const buildAddressLines = (...parts: Array<unknown>) =>
  parts.flatMap((part) => splitTextLines(part)).filter(Boolean)

const compactPlaceLine = (city?: unknown, state?: unknown, pincode?: unknown) => {
  const place = [city, state]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
  const pin = String(pincode ?? '').trim()
  if (place && pin) return `${place} ${pin}`
  return place || pin
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
      if (b2cRow) return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' }
      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.id, orderId))
      if (b2bRow) return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' }
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
      if (b2cRow) return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' }
      const b2bRow = await selectOrderFromTable(
        tx,
        b2b_orders,
        and(eq(b2b_orders.user_id, userId), eq(b2b_orders.order_number, orderNumber)),
      )
      if (b2bRow) return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' }
      return null
    })
  }

  if (orderRef) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.order_id, orderRef))
      if (b2cRow) return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' }
      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.order_id, orderRef))
      if (b2bRow) return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' }
      return null
    })
  }

  if (awbNumber) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.awb_number, awbNumber))
      if (b2cRow) return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' }
      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.awb_number, awbNumber))
      if (b2bRow) return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' }
      return null
    })
  }

  if (orderNumber) {
    candidates.push(async () => {
      const b2cRow = await selectOrderFromTable(tx, b2c_orders, eq(b2c_orders.order_number, orderNumber))
      if (b2cRow) return { order: { ...b2cRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2c' }
      const b2bRow = await selectOrderFromTable(tx, b2b_orders, eq(b2b_orders.order_number, orderNumber))
      if (b2bRow) return { order: { ...b2bRow, ...pickRuntimeLabelFields(order) }, sourceTable: 'b2b' }
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
  return { order: { ...order, ...pickRuntimeLabelFields(order) }, sourceTable: 'memory' }
}

const extractLineItems = (order: any) => {
  const directProducts = parseMaybeJson<any[]>(order?.products)
  if (Array.isArray(directProducts) && directProducts.length > 0) return directProducts

  const packageRows = parseMaybeJson<any[]>(order?.packages)
  if (!Array.isArray(packageRows) || packageRows.length === 0) return []

  return packageRows.flatMap((pkg) => {
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

  return { productId, productName, unitPrice, quantity, lineTotal }
}

const resolveProviderKey = (order: any) => {
  const integration = String(order?.integration_type ?? '').trim().toLowerCase()
  const courierPartner = String(order?.courier_partner ?? '').trim().toLowerCase()

  if (order?.delhivery_label_meta) return 'delhivery'
  if (order?.deliveryone_label_meta) return 'deliveryone'
  if (integration === 'delhivery' || courierPartner.includes('delhivery')) return 'delhivery'
  if (integration === 'deliveryone' || courierPartner.includes('deliveryone')) return 'deliveryone'
  if (String(order?.shipment_id ?? '').trim()) return 'deliveryone'
  return 'delhivery'
}

const extractFirstUrl = (value: any): string | null => {
  if (!value) return null
  if (typeof value === 'string') {
    const match = value.match(/https?:\/\/[^\s"'<>]+/i)
    return match?.[0] ?? null
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = extractFirstUrl(entry)
      if (url) return url
    }
    return null
  }
  if (typeof value === 'object') {
    for (const key of ['label', 'label_url', 'labelUrl', 'pdf_url', 'pdfUrl', 'download_url', 'url']) {
      const url = extractFirstUrl((value as Record<string, any>)[key])
      if (url) return url
    }
    for (const nested of Object.values(value)) {
      const url = extractFirstUrl(nested)
      if (url) return url
    }
  }
  return null
}

const fetchProviderLabelPdf = async (order: any): Promise<Buffer | null> => {
  const awb = normalizeText(order?.awb_number ?? order?.awbNumber, '')
  if (!awb) return null

  try {
    const providerKey = resolveProviderKey(order)
    if (providerKey === 'delhivery') {
      const credentials = await getDelhiveryCredentials()
      const apiKey = normalizeText(credentials.apiKey, '')
      if (!apiKey) return null

      const response = await axios.get(`${credentials.apiBase}/api/p/packing_slip`, {
        headers: {
          Authorization: `Token ${apiKey}`,
          Accept: 'application/json',
        },
        params: { wbns: awb, pdf: true },
        responseType: 'arraybuffer',
        timeout: 30000,
      })

      return Buffer.from(response.data)
    }

    const config = (await getEffectiveCourierConfig<DeliveryOneConfig>('deliveryone', 'b2c')) || null
    const apiBase = normalizeText(
      config?.apiBase || process.env.DELIVERY_ONE_API_BASE || process.env.DELIVERYONE_API_BASE,
      'https://track.delhivery.com',
    ).replace(/\/+$/, '')
    const apiKey = normalizeText(
      config?.apiKey || process.env.DELIVERY_ONE_API_KEY || process.env.DELIVERYONE_API_KEY,
      '',
    )
    if (!apiKey) return null

    const response = await axios.get(`${apiBase}/api/p/packing_slip`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: 'application/json',
      },
      params: { wbns: awb, pdf: true, pdf_size: '4R' },
      timeout: 30000,
    })

    const labelUrl = extractFirstUrl(response.data)
    if (!labelUrl) return null
    const pdfResp = await axios.get(labelUrl, { responseType: 'arraybuffer', timeout: 30000 })
    return Buffer.from(pdfResp.data)
  } catch (err) {
    console.warn('ChoiceMee provider label fetch failed, using local label template:', err)
    return null
  }
}

const isPdfBuffer = (buffer: Buffer | null | undefined) =>
  !!buffer && buffer.length >= 4 && buffer.slice(0, 4).toString('utf8') === '%PDF'

const loadFonts = () => ({
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
})

const printer = new PdfPrinter(loadFonts() as any)

const buildFallbackLabelPdf = async (params: {
  order: any
  sellerName: string
  sellerAddressLines: string[]
  sellerContact: string
  customerName: string
  customerPhone: string
  customerAddressLines: string[]
  orderDate: string
  invoiceNo: string
  paymentMethod: string
  paymentColor: string
  normalizedItems: Array<ReturnType<typeof normalizeLineItem>>
  footerUrl: string
}) => {
  const { order, sellerName, sellerAddressLines, sellerContact, customerName, customerPhone, customerAddressLines, orderDate, invoiceNo, paymentMethod, paymentColor, normalizedItems, footerUrl } = params
  const awb = normalizeText(order?.awb_number ?? order?.awbNumber, '-')
  const providerLabel = resolveProviderKey(order) === 'delhivery' ? 'DELHIVERY' : 'DELIVERYONE'
  const totalAmount = normalizedItems.reduce((sum, item) => sum + Math.max(0, item.lineTotal), 0)
  const rows: any[] = normalizedItems.slice(0, 4).map((item) => [
    { text: item.productId || '-', fontSize: 6.8, color: '#374151' },
    { text: item.productName || '-', fontSize: 6.8, color: '#111111' },
    { text: formatMoney(item.unitPrice), fontSize: 6.8, alignment: 'right', color: '#111111' },
    { text: String(item.quantity), fontSize: 6.8, alignment: 'right', color: '#111111' },
    { text: formatMoney(item.lineTotal), fontSize: 6.8, alignment: 'right', color: '#111111' },
  ])

  if (!rows.length) {
    rows.push([{ text: '-', colSpan: 5, fontSize: 6.8, color: '#374151' }, {}, {}, {}, {}])
  }

  const docDefinition: any = {
    info: {
      title: 'ChoiceMee Shipment Label',
      author: 'ChoiceMee',
      subject: 'ChoiceMee shipment label',
      creator: 'ChoiceMee Label Generator',
    },
    pageSize: { width: 288, height: 432 },
    pageMargins: [14, 14, 14, 14],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 6.6,
      lineHeight: 1.08,
      color: '#111111',
    },
    footer: () => ({
      margin: [14, 0, 14, 6],
      columns: [
        { text: footerUrl, fontSize: 5.8, color: '#4b5563' },
        { text: 'ChoiceMee', fontSize: 5.8, color: '#4b5563', alignment: 'right' },
      ],
    }),
    content: [
      {
        columns: [
          {
            stack: [
              { text: 'ChoiceMee', fontSize: 13.2, bold: true, color: '#111111' },
              { text: providerLabel, fontSize: 6.1, color: '#4b5563', margin: [0, 1, 0, 0] },
            ],
          },
          {
            stack: [
              { text: 'SHIPMENT LABEL', fontSize: 7.2, bold: true, alignment: 'right', letterSpacing: 0.3 },
              { text: `Order: ${invoiceNo}`, fontSize: 6.2, alignment: 'right', color: '#4b5563' },
              { text: `AWB: ${awb}`, fontSize: 6.2, alignment: 'right', color: '#4b5563' },
              { text: `Date: ${orderDate || '-'}`, fontSize: 6.2, alignment: 'right', color: '#4b5563' },
            ],
          },
        ],
        columnGap: 8,
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                stack: [
                  { text: 'FROM', fontSize: 6.6, bold: true, color: '#111111', margin: [0, 0, 0, 3] },
                  { text: sellerName, fontSize: 7.4, bold: true, color: '#111111' },
                  ...sellerAddressLines.map((line) => ({ text: line, fontSize: 6.1, color: '#4b5563' })),
                  { text: `Phone: ${sellerContact || '-'}`, fontSize: 6.1, color: '#4b5563' },
                ],
                margin: [5, 5, 5, 5],
              },
              {
                stack: [
                  { text: 'TO', fontSize: 6.6, bold: true, color: '#111111', margin: [0, 0, 0, 3] },
                  { text: customerName, fontSize: 7.4, bold: true, color: '#111111' },
                  ...customerAddressLines.map((line) => ({ text: line, fontSize: 6.1, color: '#4b5563' })),
                  { text: `Phone: ${customerPhone || '-'}`, fontSize: 6.1, color: '#4b5563' },
                ],
                margin: [5, 5, 5, 5],
              },
            ],
          ],
        },
        layout: {
          hLineColor: () => '#d1d5db',
          vLineColor: () => '#d1d5db',
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Payment', fontSize: 6.4, bold: true, color: '#374151' },
              { text: paymentMethod, fontSize: 6.4, bold: true, alignment: 'right', color: paymentColor },
            ],
            [
              { text: 'Order Date', fontSize: 6.4, bold: true, color: '#374151' },
              { text: orderDate || '-', fontSize: 6.4, alignment: 'right', color: '#111111' },
            ],
          ],
        },
        layout: {
          hLineColor: () => '#e5e7eb',
          vLineColor: () => '#ffffff',
          hLineWidth: () => 0.4,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          headerRows: 1,
          widths: [48, '*', 34, 24, 34],
          body: [
            [
              { text: 'SKU', bold: true, fontSize: 6.1, color: '#374151' },
              { text: 'Item', bold: true, fontSize: 6.1, color: '#374151' },
              { text: 'Rate', bold: true, fontSize: 6.1, color: '#374151', alignment: 'right' },
              { text: 'Qty', bold: true, fontSize: 6.1, color: '#374151', alignment: 'right' },
              { text: 'Total', bold: true, fontSize: 6.1, color: '#374151', alignment: 'right' },
            ],
            ...rows,
          ],
        },
        layout: {
          hLineColor: () => '#e5e7eb',
          vLineColor: () => '#ffffff',
          hLineWidth: (i: number) => (i === 0 ? 0.75 : 0.4),
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'NOTES', fontSize: 6.6, bold: true, color: '#111111', margin: [0, 0, 0, 3] },
              { text: 'Courier label template restored from the order snapshot.', fontSize: 6.1, color: '#4b5563' },
            ],
          },
          {
            width: 84,
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Total', fontSize: 6.6, bold: true, color: '#111111' },
                  { text: formatMoney(totalAmount), fontSize: 6.6, bold: true, alignment: 'right', color: '#111111' },
                ],
              ],
            },
            layout: {
              hLineColor: () => '#d1d5db',
              vLineColor: () => '#d1d5db',
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              paddingLeft: () => 4,
              paddingRight: () => 4,
              paddingTop: () => 4,
              paddingBottom: () => 4,
            },
          },
        ],
        columnGap: 8,
      },
    ],
  }

  const pdfDoc = printer.createPdfKitDocument(docDefinition)
  const chunks: Buffer[] = []
  return await new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk) => chunks.push(chunk))
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
    pdfDoc.on('error', (err) => reject(err))
    pdfDoc.end()
  })
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
    tx
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, resolvedUserId))
      .limit(1)
      .then((rows: any[]) => rows[0] ?? null),
    tx
      .select()
      .from(users)
      .where(eq(users.id, resolvedUserId))
      .limit(1)
      .then((rows: any[]) => rows[0] ?? null),
  ])

  const companyInfo = (profileRow?.companyInfo || {}) as Record<string, any>
  const pickupDetails = (parseMaybeJson<Record<string, any>>(resolvedOrder?.pickup_details) || {}) as Record<string, any>
  const lineItems = extractLineItems(resolvedOrder)
  const normalizedItems = lineItems.map(normalizeLineItem)

  const sellerName = normalizeText(
    pickupDetails?.warehouse_name ||
      companyInfo?.brandName ||
      companyInfo?.businessName ||
      companyInfo?.companyName ||
      userRow?.email?.split('@')?.[0] ||
      resolvedOrder?.merchant_name ||
      'ChoiceMee',
  )
  const sellerAddressLines = buildAddressLines(
    pickupDetails?.address || companyInfo?.companyAddress || companyInfo?.address || '',
    compactPlaceLine(pickupDetails?.city || companyInfo?.city, pickupDetails?.state || companyInfo?.state, pickupDetails?.pincode || companyInfo?.pincode),
    pickupDetails?.country || companyInfo?.country || resolvedOrder?.country || 'India',
  ).slice(0, 3)
  const sellerContact = normalizeText(
    companyInfo?.companyContactNumber || companyInfo?.contactNumber || userRow?.phone || pickupDetails?.phone || '-',
  )

  const customerName = normalizeText(
    resolvedOrder?.buyer_name ||
      resolvedOrder?.company_name ||
      resolvedOrder?.consignee_name ||
      resolvedOrder?.name ||
      'Customer',
  )
  const customerPhone = normalizeText(
    resolvedOrder?.buyer_phone || resolvedOrder?.phone || resolvedOrder?.customer_phone || '-',
  )
  const customerAddressLines = buildAddressLines(
    resolvedOrder?.address,
    compactPlaceLine(resolvedOrder?.city, resolvedOrder?.state, resolvedOrder?.pincode),
    normalizeText(resolvedOrder?.country || 'India'),
  ).slice(0, 3)

  const invoiceNo = normalizeText(
    resolvedOrder?.invoice_number || resolvedOrder?.order_number || resolvedOrder?.order_id || resolvedOrder?.id,
  )
  const orderDate = normalizeText(
    resolvedOrder?.order_date || resolvedOrder?.created_at || resolvedOrder?.updated_at,
    '',
  )
  const paymentRaw = String(resolvedOrder?.payment_type || resolvedOrder?.order_type || '').trim().toLowerCase()
  const paymentMethod =
    paymentRaw === 'cod' ? 'COD' : paymentRaw === 'prepaid' ? 'PREPAID' : paymentRaw ? paymentRaw.toUpperCase() : 'PREPAID'
  const paymentColor = paymentMethod === 'COD' ? '#d97706' : '#059669'
  const footerUrl = `https://choicemee.in/tax-invoice/${encodeURIComponent(invoiceNo || String(resolvedOrder?.id ?? 'label'))}`

  const providerPdf = await fetchProviderLabelPdf(resolvedOrder)
  const pdfBuffer = isPdfBuffer(providerPdf)
    ? providerPdf
    : await buildFallbackLabelPdf({
    order: resolvedOrder,
    sellerName,
    sellerAddressLines,
    sellerContact,
    customerName,
    customerPhone,
    customerAddressLines,
    orderDate,
    invoiceNo,
    paymentMethod,
    paymentColor,
    normalizedItems,
    footerUrl,
  })

  if (providerPdf && !isPdfBuffer(providerPdf)) {
    console.warn(
      `ChoiceMee provider label response was not a PDF for ${resolvedOrder?.order_number || resolvedOrder?.id}; using fallback template.`,
    )
  }

  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('PDF buffer is empty or invalid')
  }

  const { uploadUrl, key } = await presignUpload({
    filename: `l-${String(resolvedOrder?.order_number || resolvedOrder?.id || resolvedOrder?.order_id || Date.now())
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(-12)}.pdf`,
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
}
