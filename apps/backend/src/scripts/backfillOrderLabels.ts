import { and, asc, eq, ilike, isNotNull } from 'drizzle-orm'
import { db } from '../models/client'
import { b2c_orders } from '../models/schema/b2cOrders'
import { generateLabelForOrder } from '../models/services/generateCustomLabelService'
import { downloadAndUploadToR2 } from '../models/services/upload.service'

const BATCH_SIZE = 50

const buildLabelFilename = (orderNumber: string | null | undefined, orderId: string) =>
  `l-${
    String(orderNumber || orderId)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(-12) || orderId
  }.pdf`

export async function backfillOrderLabels() {
  console.log('Starting label backfill for B2C orders...')

  let updated = 0
  let generated = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const rows = await db
      .select()
      .from(b2c_orders)
      .where(and(isNotNull(b2c_orders.label), ilike(b2c_orders.label, 'http%')))
      .orderBy(asc(b2c_orders.created_at), asc(b2c_orders.id))
      .limit(BATCH_SIZE)

    if (rows.length === 0) break

    for (const order of rows) {
      const rawLabel = typeof order.label === 'string' ? order.label.trim() : ''
      if (!rawLabel) {
        skipped++
        continue
      }

      try {
        let nextLabel = await downloadAndUploadToR2({
          url: rawLabel,
          userId: order.user_id,
          filename: buildLabelFilename(order.order_number, order.id),
          folderKey: 'labels',
          contentType: 'application/pdf',
        })

        if (!nextLabel && order.awb_number) {
          nextLabel = await generateLabelForOrder(order, order.user_id, db)
          if (nextLabel) {
            generated++
          }
        }

        if (nextLabel && nextLabel !== rawLabel) {
          await db
            .update(b2c_orders)
            .set({
              label: nextLabel,
              updated_at: new Date(),
            })
            .where(eq(b2c_orders.id, order.id))

          updated++
          console.log(`Updated label for order ${order.order_number} -> ${nextLabel}`)
        } else if (!nextLabel) {
          skipped++
          console.warn(`Skipped order ${order.order_number}: label could not be recovered`)
        }
      } catch (error: any) {
        failed++
        console.error(`Failed to backfill label for order ${order.order_number}:`, error?.message || error)
      }
    }
  }

  console.log('Label backfill complete.')
  console.log({
    updated,
    generated,
    skipped,
    failed,
  })
}

if (require.main === module) {
  backfillOrderLabels()
    .then(() => {
      console.log('Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}
