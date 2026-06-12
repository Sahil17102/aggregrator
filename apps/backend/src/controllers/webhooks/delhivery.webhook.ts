import { Request, Response } from 'express'
import crypto from 'crypto'
import { and, eq, gte, isNull } from 'drizzle-orm'
import { db } from '../../models/client'
import { getDelhiveryCredentials } from '../../models/services/delhiveryCredentials.service'
import {
  processDelhiveryDocumentWebhook,
  processDelhiveryWebhook,
} from '../../models/services/webhookProcessor'
import { pending_webhooks } from '../../schema/schema'

const DELHIVERY_WEBHOOK_SECRET_HEADERS = [
  'x-delhivery-webhook-secret',
  'x-delhivery-webhook-signature',
  'x-webhook-secret',
  'x-webhook-signature',
  'authorization',
]

const normalizeDocType = (value?: string | null) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const resolveDocumentTypeFromRequest = (req: Request, payload: any, shipment: any) => {
  const routeHint = normalizeDocType(req.originalUrl || req.path || '')
  const rawType =
    payload?.DocumentType ||
    payload?.documentType ||
    shipment?.DocumentType ||
    shipment?.documentType ||
    null

  const normalizedType = normalizeDocType(rawType)
  if (normalizedType.includes('epod')) return 'EPOD'
  if (normalizedType.includes('sorter')) return 'SorterImage'
  if (normalizedType.includes('qc')) return 'QCImage'
  if (normalizedType.includes('pod')) return 'POD'

  const hasEpodPayload =
    payload?.EPOD ||
    payload?.epod ||
    shipment?.EPOD ||
    shipment?.epod ||
    routeHint.includes('epod')
  if (hasEpodPayload) return 'EPOD'

  const hasSorterPayload =
    payload?.SorterImage ||
    payload?.sorterImage ||
    payload?.Weight_images ||
    payload?.weight_images ||
    shipment?.SorterImage ||
    shipment?.sorterImage ||
    shipment?.Weight_images ||
    shipment?.weight_images ||
    routeHint.includes('sorter')
  if (hasSorterPayload) return 'SorterImage'

  const hasQcPayload =
    payload?.QCImage ||
    payload?.qcImage ||
    payload?.Image ||
    payload?.image ||
    shipment?.QCImage ||
    shipment?.qcImage ||
    shipment?.Image ||
    shipment?.image ||
    routeHint.includes('qc')
  if (hasQcPayload) return 'QCImage'

  const hasPodPayload =
    payload?.PODDocument ||
    payload?.podDocument ||
    payload?.POD ||
    payload?.pod ||
    shipment?.PODDocument ||
    shipment?.podDocument ||
    shipment?.POD ||
    shipment?.pod ||
    routeHint.includes('pod')
  if (hasPodPayload) return 'POD'

  return null
}

const getHeaderValue = (headers: Request['headers'], names: string[]) => {
  const normalized = headers as Record<string, string | string[] | undefined>
  for (const header of names) {
    const value = normalized[header] || normalized[header.toLowerCase()]
    if (!value) continue
    if (Array.isArray(value) && value.length) return String(value[0]).trim()
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const normalizeWebhookSecretCandidate = (value: string) => {
  const trimmed = String(value || '').trim().replace(/^['"]|['"]$/g, '')
  if (!trimmed) return ''

  const envPrefixMatch = trimmed.match(/^DELHIVERY_WEBHOOK_SECRET\s*[:=]\s*(.+)$/i)
  if (envPrefixMatch?.[1]) {
    return envPrefixMatch[1].trim().replace(/^['"]|['"]$/g, '')
  }

  const bearerMatch = trimmed.match(/^Bearer\s+(.+)$/i)
  if (bearerMatch?.[1]) {
    return bearerMatch[1].trim().replace(/^['"]|['"]$/g, '')
  }

  const shaMatch = trimmed.match(/^sha256=(.+)$/i)
  if (shaMatch?.[1]) {
    return `sha256=${shaMatch[1].trim().replace(/^['"]|['"]$/g, '')}`
  }

  return trimmed
}

const verifyDelhiveryWebhookSecret = async (req: Request) => {
  const configuredSecret = (await getDelhiveryCredentials()).webhookSecret.trim()
  const receivedSecret = getHeaderValue(req.headers, DELHIVERY_WEBHOOK_SECRET_HEADERS)

  if (!configuredSecret) {
    if (receivedSecret) {
      console.info('ℹ️ Delhivery webhook secret header received but no secret is configured.')
    }
    return true
  }

  if (!receivedSecret) {
    console.warn('⚠️ Delhivery webhook missing secret header')
    return false
  }

  const rawBody = String((req as any).rawBody || (req.body ? JSON.stringify(req.body) : ''))
  const expectedHmac =
    'sha256=' + crypto.createHmac('sha256', configuredSecret).update(rawBody).digest('hex')
  const normalizedCandidates = [
    normalizeWebhookSecretCandidate(receivedSecret),
    receivedSecret,
    receivedSecret.startsWith('sha256=') ? receivedSecret : `sha256=${receivedSecret}`,
  ]

  const matches = normalizedCandidates.some((candidate) => {
    const candidateBuf = Buffer.from(candidate)
    const secretBuf = Buffer.from(configuredSecret)
    const hmacBuf = Buffer.from(expectedHmac)
    return (
      (candidateBuf.length === secretBuf.length && crypto.timingSafeEqual(candidateBuf, secretBuf)) ||
      (candidateBuf.length === hmacBuf.length && crypto.timingSafeEqual(candidateBuf, hmacBuf))
    )
  })

  if (!matches) {
    console.warn('⚠️ Delhivery webhook rejected: invalid secret/signature')
    return false
  }

  return true
}

/**
 * Delhivery Scan Push Webhook Handler
 * Handles shipment status updates (Manifested, In Transit, Delivered, RTO, etc.)
 */
export const delhiveryScanPushHandler = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString()
  const payload = req.body
  const shipment = payload?.Shipment
  const awb = shipment?.AWB || payload?.waybill || payload?.AWB || null
  const status = shipment?.Status?.Status || payload?.status || 'unknown'

  if (!(await verifyDelhiveryWebhookSecret(req))) {
    return res.status(401).json({ success: false, message: 'invalid webhook secret' })
  }

  console.log('='.repeat(80))
  console.log(`📦 [${timestamp}] Delhivery Scan Push Webhook Received`)
  console.log(`   AWB: ${awb || 'N/A'}`)
  console.log(`   Status: ${status}`)
  console.log(`   IP: ${req.ip || req.socket.remoteAddress || 'unknown'}`)
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`   Full Payload:`, JSON.stringify(payload, null, 2))
  console.log('='.repeat(80))

  try {
    if (!awb) {
      console.error(`❌ Delhivery scan push webhook rejected: Missing AWB/waybill`)
      return res.status(400).json({ message: 'Missing AWB/waybill' })
    }

    console.log(`🔄 Processing Delhivery scan push webhook for AWB: ${awb}, Status: ${status}`)
    const result = await processDelhiveryWebhook(payload)

    // If order doesn't exist yet → store webhook for retry
    if (!result.success && result.reason === 'order_not_found') {
      const dedupeWindowStart = new Date(Date.now() - 10 * 60 * 1000)
      const [existingPending] = await db
        .select({ id: pending_webhooks.id })
        .from(pending_webhooks)
        .where(
          and(
            eq(pending_webhooks.awb_number, String(awb)),
            eq(pending_webhooks.status, String(status || 'unknown')),
            isNull(pending_webhooks.processed_at),
            gte(pending_webhooks.created_at, dedupeWindowStart),
          ),
        )
        .limit(1)

      if (!existingPending) {
        await db.insert(pending_webhooks).values({
          awb_number: awb,
          status: status,
          payload,
        })
        console.warn(
          `⚠️ Stored Delhivery scan push webhook for AWB ${awb} (order not yet created).`,
        )
      } else {
        console.warn(`⚠️ Duplicate pending webhook skipped for AWB ${awb} (within dedupe window).`)
      }
      return res.status(202).json({ success: true, queued: true })
    }

    // Respond OK for successful handling
    if (result.success) {
      console.log(`✅ Delhivery scan push webhook processed successfully for AWB: ${awb}`)
      return res.status(200).json({ success: true })
    }

    // Handle known soft errors (e.g. invalid status)
    console.warn(
      `⚠️ Delhivery scan push webhook partially processed for AWB: ${awb}, reason: ${result.reason}`,
    )
    return res.status(202).json({ success: false })
  } catch (err: any) {
    console.error('='.repeat(80))
    console.error(
      `❌ [${timestamp}] Delhivery scan push webhook error for AWB: ${awb || 'unknown'}`,
    )
    console.error(`   Error Message: ${err?.message || err}`)
    console.error(`   Error Stack:`, err?.stack)
    console.error(`   Payload:`, JSON.stringify(payload, null, 2))
    console.error('='.repeat(80))
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

/**
 * Delhivery Document Push Webhook Handler
 * Handles POD, Sorter Image, and QC Image document pushes
 */
export const delhiveryDocumentPushHandler = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString()
  const payload = req.body
  const shipment = payload?.Shipment || payload
  const awb = shipment?.AWB || payload?.AWB || payload?.waybill || null

  if (!(await verifyDelhiveryWebhookSecret(req))) {
    return res.status(401).json({ success: false, message: 'invalid webhook secret' })
  }

  // Detect document type
  const documentType = resolveDocumentTypeFromRequest(req, payload, shipment)

  console.log('='.repeat(80))
  console.log(`📄 [${timestamp}] Delhivery Document Push Webhook Received`)
  console.log(`   Type: ${documentType || 'Unknown'}`)
  console.log(`   AWB: ${awb || 'N/A'}`)
  console.log(`   IP: ${req.ip || req.socket.remoteAddress || 'unknown'}`)
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`   Full Payload:`, JSON.stringify(payload, null, 2))
  console.log('='.repeat(80))

  try {
    if (!awb) {
      console.error(`❌ Delhivery document push webhook rejected: Missing AWB/waybill`)
      return res.status(400).json({ message: 'Missing AWB/waybill' })
    }

    console.log(
      `📄 Processing Delhivery document push webhook for AWB: ${awb}, Type: ${documentType}`,
    )
    const result = await processDelhiveryDocumentWebhook(payload, documentType)

    if (result.success) {
      console.log(`✅ Delhivery document push webhook processed successfully for AWB: ${awb}`)
      return res.status(200).json({ success: true })
    }

    console.warn(`⚠️ Delhivery document push webhook partially processed for AWB: ${awb}`)
    return res.status(202).json({ success: false })
  } catch (err: any) {
    console.error('='.repeat(80))
    console.error(
      `❌ [${timestamp}] Delhivery document push webhook error for AWB: ${awb || 'unknown'}`,
    )
    console.error(`   Error Message: ${err?.message || err}`)
    console.error(`   Error Stack:`, err?.stack)
    console.error(`   Payload:`, JSON.stringify(payload, null, 2))
    console.error('='.repeat(80))
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

/**
 * Legacy unified webhook handler (for backward compatibility)
 * Auto-detects webhook type and routes accordingly
 * @deprecated Use delhiveryScanPushHandler or delhiveryDocumentPushHandler instead
 */
export const delhiveryWebhookHandler = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString()
  const payload = req.body
  const shipment = payload?.Shipment
  const awb = shipment?.AWB || payload?.waybill || payload?.AWB || null
  const status = shipment?.Status?.Status || payload?.status || 'unknown'

  if (!(await verifyDelhiveryWebhookSecret(req))) {
    return res.status(401).json({ success: false, message: 'invalid webhook secret' })
  }

  // Detect webhook type: Scan Push (status update) vs Document Push (POD, Sorter Image, QC Image)
  const isDocumentPush =
    payload?.DocumentType ||
    payload?.documentType ||
    payload?.PODDocument ||
    payload?.podDocument ||
    payload?.SorterImage ||
    payload?.sorterImage ||
    payload?.Weight_images ||
    payload?.weight_images ||
    payload?.QCImage ||
    payload?.qcImage ||
    payload?.Image ||
    payload?.image ||
    shipment?.PODDocument ||
    shipment?.SorterImage ||
    shipment?.Weight_images ||
    shipment?.QCImage ||
    shipment?.Image
  const documentType = resolveDocumentTypeFromRequest(req, payload, shipment)

  console.log('='.repeat(80))
  console.log(`📦 [${timestamp}] Delhivery Webhook Received`)
  console.log(
    `   Type: ${isDocumentPush ? `Document Push (${documentType})` : 'Scan Push (Status Update)'}`,
  )
  console.log(`   AWB: ${awb || 'N/A'}`)
  console.log(`   Status: ${status}`)
  console.log(`   IP: ${req.ip || req.socket.remoteAddress || 'unknown'}`)
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`   Full Payload:`, JSON.stringify(payload, null, 2))
  console.log('='.repeat(80))

  try {
    if (!awb) {
      console.error(`❌ Delhivery webhook rejected: Missing AWB/waybill`)
      return res.status(400).json({ message: 'Missing AWB/waybill' })
    }

    // Route to appropriate processor based on webhook type
    if (isDocumentPush) {
      console.log(
        `📄 Processing Delhivery document push webhook for AWB: ${awb}, Type: ${documentType}`,
      )
      const result = await processDelhiveryDocumentWebhook(payload, documentType)

      if (result.success) {
        console.log(`✅ Delhivery document webhook processed successfully for AWB: ${awb}`)
        return res.status(200).json({ success: true })
      }

      console.warn(`⚠️ Delhivery document webhook partially processed for AWB: ${awb}`)
      return res.status(202).json({ success: false })
    }

    console.log(`🔄 Processing Delhivery scan push webhook for AWB: ${awb}, Status: ${status}`)
    // Process the webhook payload (updates order, label, pickup, etc.)
    const result = await processDelhiveryWebhook(payload)

    // If order doesn't exist yet → store webhook for retry
    if (!result.success && result.reason === 'order_not_found') {
      const dedupeWindowStart = new Date(Date.now() - 10 * 60 * 1000)
      const [existingPending] = await db
        .select({ id: pending_webhooks.id })
        .from(pending_webhooks)
        .where(
          and(
            eq(pending_webhooks.awb_number, String(awb)),
            eq(pending_webhooks.status, String(status || 'unknown')),
            isNull(pending_webhooks.processed_at),
            gte(pending_webhooks.created_at, dedupeWindowStart),
          ),
        )
        .limit(1)

      if (!existingPending) {
        await db.insert(pending_webhooks).values({
          awb_number: awb,
          status: status,
          payload,
        })
        console.warn(`⚠️ Stored Delhivery webhook for AWB ${awb} (order not yet created).`)
      } else {
        console.warn(`⚠️ Duplicate pending webhook skipped for AWB ${awb} (within dedupe window).`)
      }
      return res.status(202).json({ success: true, queued: true })
    }

    // Respond OK for successful handling
    if (result.success) {
      console.log(`✅ Delhivery webhook processed successfully for AWB: ${awb}`)
      return res.status(200).json({ success: true })
    }

    // Handle known soft errors (e.g. invalid status)
    console.warn(
      `⚠️ Delhivery webhook partially processed for AWB: ${awb}, reason: ${result.reason}`,
    )
    return res.status(202).json({ success: false })
  } catch (err: any) {
    console.error('='.repeat(80))
    console.error(`❌ [${timestamp}] Delhivery webhook error for AWB: ${awb || 'unknown'}`)
    console.error(`   Error Message: ${err?.message || err}`)
    console.error(`   Error Stack:`, err?.stack)
    console.error(`   Payload:`, JSON.stringify(payload, null, 2))
    console.error('='.repeat(80))
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
