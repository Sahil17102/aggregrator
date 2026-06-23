import { pool } from '../client'

const FAILED_RETRY_DELAY_MINUTES = 1
const STALE_SENDING_MINUTES = 15

const trimText = (value?: string | null) => String(value || '').trim()

export type ShipmentEmailDeliveryStatus = 'sending' | 'sent' | 'failed'

export type ShipmentEmailDeliveryInput = {
  sellerId: string
  shipmentKey: string
  orderNumber?: string | null
  awbNumber: string
  stage: string
  recipientEmail: string
  subject: string
  messageId: string
}

export type ShipmentEmailDeliveryRow = Omit<ShipmentEmailDeliveryInput, 'messageId'> & {
  id: string
  messageId: string | null
  status: ShipmentEmailDeliveryStatus
  attempts: number
  error: string | null
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type ClaimOptions = {
  existingOnly?: boolean
}

type ClaimResult =
  | { claimed: true; delivery: ShipmentEmailDeliveryRow }
  | {
      claimed: false
      reason: 'already_sent' | 'in_progress' | 'not_due' | 'not_found'
      delivery: ShipmentEmailDeliveryRow | null
    }

const mapRow = (row: Record<string, any>): ShipmentEmailDeliveryRow => ({
  id: row.id,
  sellerId: row.seller_id,
  shipmentKey: row.shipment_key,
  orderNumber: row.order_number,
  awbNumber: row.awb_number,
  stage: row.stage,
  recipientEmail: row.recipient_email,
  subject: row.subject,
  messageId: row.message_id,
  status: row.status,
  attempts: Number(row.attempts || 0),
  error: row.error,
  sentAt: row.sent_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const normalizeInput = (input: ShipmentEmailDeliveryInput): ShipmentEmailDeliveryInput => {
  const normalized = {
    sellerId: trimText(input.sellerId),
    shipmentKey: trimText(input.shipmentKey),
    orderNumber: trimText(input.orderNumber) || null,
    awbNumber: trimText(input.awbNumber),
    stage: trimText(input.stage),
    recipientEmail: trimText(input.recipientEmail).toLowerCase(),
    subject: trimText(input.subject),
    messageId: trimText(input.messageId),
  }

  if (
    !normalized.sellerId ||
    !normalized.shipmentKey ||
    !normalized.awbNumber ||
    !normalized.stage ||
    !normalized.recipientEmail ||
    !normalized.subject ||
    !normalized.messageId
  ) {
    throw new Error('Shipment email delivery claim is missing required data')
  }

  return normalized
}

export const normalizeShipmentEmailKey = (
  orderNumber?: string | null,
  awbNumber?: string | null,
) => trimText(orderNumber) || trimText(awbNumber)

export async function claimShipmentEmailDelivery(
  rawInput: ShipmentEmailDeliveryInput,
  options: ClaimOptions = {},
): Promise<ClaimResult> {
  const input = normalizeInput(rawInput)
  const params = [
    input.sellerId,
    input.shipmentKey,
    input.orderNumber,
    input.awbNumber,
    input.stage,
    input.recipientEmail,
    input.subject,
    input.messageId,
  ]

  const retryPredicate = `
    (
      shipment_email_deliveries.status = 'failed'
      and shipment_email_deliveries.updated_at <= now() - interval '${FAILED_RETRY_DELAY_MINUTES} minutes'
    )
    or (
      shipment_email_deliveries.status = 'sending'
      and shipment_email_deliveries.updated_at <= now() - interval '${STALE_SENDING_MINUTES} minutes'
    )
  `

  const claimQuery = options.existingOnly
    ? `
        update shipment_email_deliveries
        set status = 'sending',
            attempts = attempts + 1,
            order_number = $3,
            awb_number = $4,
            subject = $7,
            message_id = $8,
            error = null,
            updated_at = now()
        where seller_id = $1
          and shipment_key = $2
          and stage = $5
          and recipient_email = $6
          and (${retryPredicate})
        returning *
      `
    : `
        insert into shipment_email_deliveries (
          seller_id,
          shipment_key,
          order_number,
          awb_number,
          stage,
          recipient_email,
          status,
          attempts,
          subject,
          message_id,
          error,
          sent_at,
          created_at,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, 'sending', 1, $7, $8, null, null, now(), now())
        on conflict (seller_id, shipment_key, stage, recipient_email)
        do update set
          status = 'sending',
          attempts = shipment_email_deliveries.attempts + 1,
          order_number = excluded.order_number,
          awb_number = excluded.awb_number,
          subject = excluded.subject,
          message_id = excluded.message_id,
          error = null,
          updated_at = now()
        where ${retryPredicate}
        returning *
      `

  const claimed = await pool.query(claimQuery, params)
  if (claimed.rows[0]) {
    return { claimed: true, delivery: mapRow(claimed.rows[0]) }
  }

  const existing = await pool.query(
    `
      select *
      from shipment_email_deliveries
      where seller_id = $1
        and shipment_key = $2
        and stage = $3
        and recipient_email = $4
      limit 1
    `,
    [input.sellerId, input.shipmentKey, input.stage, input.recipientEmail],
  )
  const delivery = existing.rows[0] ? mapRow(existing.rows[0]) : null

  if (!delivery) return { claimed: false, reason: 'not_found', delivery: null }
  if (delivery.status === 'sent') return { claimed: false, reason: 'already_sent', delivery }

  const ageMs = Date.now() - new Date(delivery.updatedAt).getTime()
  if (delivery.status === 'sending' && ageMs < STALE_SENDING_MINUTES * 60_000) {
    return { claimed: false, reason: 'in_progress', delivery }
  }

  return { claimed: false, reason: 'not_due', delivery }
}

export async function markShipmentEmailDeliverySent(id: string) {
  const result = await pool.query(
    `
      update shipment_email_deliveries
      set status = 'sent', error = null, sent_at = now(), updated_at = now()
      where id = $1 and status = 'sending'
      returning *
    `,
    [id],
  )

  return result.rows[0] ? mapRow(result.rows[0]) : null
}

export async function markShipmentEmailDeliveryFailed(id: string, error: unknown) {
  const errorMessage = trimText(error instanceof Error ? error.message : String(error)).slice(0, 4000)
  const result = await pool.query(
    `
      update shipment_email_deliveries
      set status = 'failed', error = $2, updated_at = now()
      where id = $1 and status = 'sending'
      returning *
    `,
    [id, errorMessage || 'Unknown email delivery failure'],
  )

  return result.rows[0] ? mapRow(result.rows[0]) : null
}

export async function listRetryableShipmentEmailDeliveries(limit = 25) {
  const result = await pool.query(
    `
      select *
      from shipment_email_deliveries
      where (
          status = 'failed'
          and updated_at <= now() - interval '${FAILED_RETRY_DELAY_MINUTES} minutes'
        )
        or (
          status = 'sending'
          and updated_at <= now() - interval '${STALE_SENDING_MINUTES} minutes'
        )
      order by updated_at asc
      limit $1
    `,
    [Math.max(1, Math.min(100, Math.trunc(limit)))],
  )

  return result.rows.map(mapRow)
}
