import { buildShipmentStatusEmailContent, type ShipmentOrderLike } from '../utils/emailSender'

const sampleOrder: ShipmentOrderLike = {
  orderNumber: '48010910028534',
  orderDate: '2026-06-22T00:00:00.000Z',
  created_at: '2026-06-22T00:00:00.000Z',
  orderName: 'Sample Product',
  buyer_name: 'Sample Consignee',
  addressLine1: '123 Sample Street',
  city: 'Sample City',
  state: 'Sample State',
  pincode: '123456',
  buyer_phone: '9999999999',
  courier_partner: 'Courier',
  order_status: 'manifested',
  order_amount: 10,
  prepaid_amount: 10,
  products: [{ productName: 'Sample Product', quantity: 1, price: 10 }],
}

const blockedTokens = ['Manage Your Order', 'cm-manage-btn', 'cm-timeline']

const content = buildShipmentStatusEmailContent({
  to: 'preview@example.com',
  awbNumber: '48010910028534',
  orderNumber: '48010910028534',
  orderLabel: 'Sample Product',
  stage: 'manifested',
  sellerName: 'Ship Aggregator',
  orderDetails: sampleOrder,
})

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const foundBlockedTokens = blockedTokens.filter((token) => content.html.includes(token) || content.text.includes(token))

assert(foundBlockedTokens.length === 0, `Shipment email template still contains blocked CTA markup: ${foundBlockedTokens.join(', ')}`)
assert(content.html.includes('Delivery Address'), 'Shipment email template is missing the delivery block')
assert(content.html.includes('Shipping Details'), 'Shipment email template is missing the shipping block')
assert(content.html.includes('cm-mobile-card'), 'Shipment email template is missing the mobile card wrapper')
assert(content.html.includes('background:transparent'), 'Shipment email logo is not transparent')
assert(!content.html.includes('margin:-22px 0 0 -40px'), 'Shipment email logo still uses the fragile negative-margin crop')
assert(!content.html.includes('overflow:hidden;line-height:0'), 'Shipment email logo still uses a clipping wrapper')

console.log('[ShipmentEmailTemplate] Verification passed')
