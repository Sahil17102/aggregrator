import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { buildShipmentLabelPdfBuffer } from '../models/services/shipaggregatorLabel.service'

const makeLogoDataUrl = async (label: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="120" viewBox="0 0 360 120">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#dbeafe" />
          <stop offset="100%" stop-color="#f5d0fe" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="360" height="120" rx="18" fill="url(#g)" />
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#7c2d12">${label}</text>
    </svg>
  `

  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

async function main() {
  const outputDir = path.resolve(process.cwd(), '..', '..', 'tmp', 'pdfs')
  await fs.mkdir(outputDir, { recursive: true })

  const samplePdf = await buildShipmentLabelPdfBuffer({
    order: {
      order_number: '275596',
      awb_number: '25338212001554',
      payment_type: 'prepaid',
      shipping_mode: 'surface',
    },
    sellerName: 'Khoobsurat textile',
    sellerLogoDataUrl: await makeLogoDataUrl('Khoobsurat'),
    sellerAddressLines: ['Near JK BANK chadoora', 'Nagam, JAMMU AND KASHMIR - 191113'],
    sellerContact: '9906445657',
    customerName: 'Shana Nanda',
    customerPhone: '9999999999',
    customerAddressLines: ['Bisati Bagh lane 1', 'Bulbull bagh barzulla', 'Srinagar, JAMMU AND KASHMIR - 190005'],
    orderDate: 'Thu, 04 Dec 2025 11:33:30 IST',
    invoiceNo: '275596',
    paymentMethod: 'PREPAID',
    paymentColor: '#059669',
    normalizedItems: [
      { productId: '45264', productName: 'Garments', unitPrice: 6000, quantity: 1, lineTotal: 6000 },
    ],
    footerUrl: 'https://shipaggregator.in/tax-invoice/275596',
  })

  const pdfPath = path.join(outputDir, 'shipping-label-smoke.pdf')
  await fs.writeFile(pdfPath, samplePdf)
  console.log(pdfPath)
  console.log(`PDF bytes: ${samplePdf.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
