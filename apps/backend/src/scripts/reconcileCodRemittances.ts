import { reconcileMissingCodRemittances } from '../models/services/codRemittanceReconciliation.service'

const parseLimit = () => {
  const raw = Number(process.env.COD_RECONCILIATION_LIMIT || 250)
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 250
}

async function main() {
  const limit = parseLimit()
  console.log('[COD Reconciliation] Starting', { limit })

  const result = await reconcileMissingCodRemittances(limit)

  console.log('[COD Reconciliation] Finished', {
    scanned: result.scanned,
    created: result.created,
    skipped: result.skipped,
    failed: result.failed,
  })

  if (result.orders.length > 0) {
    console.log(
      '[COD Reconciliation] Orders',
      result.orders.map((order) => ({
        orderNumber: order.orderNumber,
        userEmail: order.userEmail,
        buyerName: order.buyerName,
        awbNumber: order.awbNumber,
        remittanceId: order.remittanceId,
        remittableAmount: order.remittableAmount,
        error: order.error || null,
      })),
    )
  }
}

main().catch((error) => {
  console.error('[COD Reconciliation] Failed', error)
  process.exit(1)
})
