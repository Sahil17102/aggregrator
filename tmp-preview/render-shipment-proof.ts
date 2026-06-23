import fs from 'node:fs'
import path from 'node:path'
import {
  buildShipmentStatusEmailContent,
  type ShipmentOrderLike,
} from '../apps/backend/src/utils/emailSender'

process.env.FRONTEND_URL = 'file:///C:/Users/Dell/Desktop/ChoiceMe-main/apps/client/public'

const logoPath = 'file:///C:/Users/Dell/Desktop/ChoiceMe-main/apps/client/public/brand/shipment-email-logo.png'

const orderDetails: ShipmentOrderLike = {
  orderNumber: '278635',
  orderDate: '2025-12-18T00:00:00.000Z',
  created_at: '2025-12-18T00:00:00.000Z',
  orderName: 'Garments',
  buyer_name: 'Bisma',
  address: 'Budgam Landmark fida diagnostic centre',
  city: 'Opp District court complex',
  state: 'Arigam',
  country: 'JAMMU AND KASHMIR',
  pincode: '191111',
  buyer_phone: '9906573655',
  courier_partner: 'Delhivery',
  service_type: 'ChoiceMee Logistics',
  order_status: 'manifested',
  order_amount: 1080,
  prepaid_amount: 1080,
  products: [{ productName: 'Garments', quantity: 1, price: 1080 }],
}

const content = buildShipmentStatusEmailContent({
  to: 'preview@example.com',
  awbNumber: '25338212044792',
  orderNumber: '278635',
  orderLabel: 'Garments',
  stage: 'manifested',
  sellerName: 'ChoiceMee Logistics',
  brandLogoSrc: logoPath,
  orderDetails,
})

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Shipment Preview Proof</title></head><body style="margin:0;background:#f5f1e7;padding:0">${content.html}</body></html>`

const out = path.resolve(__dirname, 'shipment-preview-proof.html')
fs.writeFileSync(out, html, 'utf8')
console.log(out)
