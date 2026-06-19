import { sendShipmentStatusEmail, type ShipmentStatusEmailStage, type ShipmentOrderLike } from '../utils/emailSender'

const DEFAULT_RECIPIENT = 'mitalilily8877@gmail.com'

const parseStages = (): ShipmentStatusEmailStage[] => {
  const raw = process.argv.slice(2)
  const stageArg = raw.find((value) => value.startsWith('--stage='))
  if (stageArg) {
    const stage = stageArg.split('=')[1]?.trim() as ShipmentStatusEmailStage | undefined
    if (stage) return [stage]
  }

  const listArgIndex = raw.indexOf('--stages')
  if (listArgIndex >= 0) {
    const value = raw[listArgIndex + 1]
    if (value) {
      return value
        .split(',')
        .map((item) => item.trim() as ShipmentStatusEmailStage)
        .filter(Boolean)
    }
  }

  return ['manifested', 'picked_up', 'out_for_delivery', 'delivered', 'ndr']
}

const buildPreviewOrder = (status: ShipmentStatusEmailStage): ShipmentOrderLike => ({
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
  order_status: status,
  order_amount: 1080,
  shipping_charges: 0,
  prepaid_amount: 1080,
  cod_charges: 0,
  products: [
    {
      productName: 'Garments',
      quantity: 1,
      price: 1080,
    },
  ],
})

async function main() {
  const recipient = process.env.SMTP_TEST_TO?.trim() || DEFAULT_RECIPIENT
  const stages = parseStages()

  console.log('[Shipment Preview] Sending test emails', { recipient, stages })

  for (const stage of stages) {
    const orderDetails = buildPreviewOrder(stage)
    await sendShipmentStatusEmail({
      to: recipient,
      awbNumber: '25338212044792',
      orderNumber: '278635',
      orderLabel: 'Garments',
      stage,
      sellerName: 'ChoiceMee',
      orderDetails,
    })

    console.log('[Shipment Preview] Sent stage email', { stage, recipient })
  }
}

main().catch((error) => {
  console.error('[Shipment Preview] Failed', error)
  process.exit(1)
})
