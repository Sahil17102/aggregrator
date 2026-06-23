import fs from 'node:fs'
import path from 'node:path'
import {
  buildShipmentStatusEmailContent,
  type ShipmentOrderLike,
} from '../apps/backend/src/utils/emailSender'

process.env.FRONTEND_URL = 'file:///C:/Users/Dell/Desktop/ChoiceMe-main/apps/client/public'

const orderDetails: ShipmentOrderLike = {
  orderNumber: 'ORD-1782102098032',
  orderDate: '2026-06-22T00:00:00.000Z',
  created_at: '2026-06-22T00:00:00.000Z',
  orderName: 'jeans',
  buyer_name: 'jeans',
  courier_partner: 'Courier',
  order_status: 'manifested',
  order_amount: 10,
  prepaid_amount: 10,
  products: [{ productName: 'jeans', quantity: 1, price: 10 }],
}

const content = buildShipmentStatusEmailContent({
  to: 'preview@example.com',
  awbNumber: '48010910028195',
  orderNumber: 'ORD-1782102098032',
  orderLabel: 'jeans',
  stage: 'manifested',
  sellerName: 'Google',
  orderDetails,
})

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Shipment Mobile Proof</title>
    <style>
      body { margin: 0; background: #eaf1f8; font-family: Arial, Helvetica, sans-serif; }
      .phone-top { height: 142px; background: #e7eff8; }
      .gmail-card { margin: 0 9px 28px; background: #fff; border-radius: 16px; overflow: hidden; }
      .gmail-head { height: 116px; border-bottom: 1px solid #edf1f4; }
    </style>
  </head>
  <body>
    <div class="phone-top"></div>
    <div class="gmail-card">
      <div class="gmail-head"></div>
      ${content.html}
    </div>
  </body>
</html>`

const out = path.resolve(__dirname, 'shipment-mobile-proof.html')
fs.writeFileSync(out, html, 'utf8')
console.log(out)
