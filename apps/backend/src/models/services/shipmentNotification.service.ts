import { eq, sql } from 'drizzle-orm'
import { db } from '../client'
import { userProfiles } from '../schema/userProfile'
import { users } from '../schema/users'
import {
  sendShipmentStatusEmail,
  type ShipmentStatusEmailStage,
  type ShipmentOrderLike,
  resolveShipmentOrderLabel,
} from '../../utils/emailSender'

const normalizeStatus = (value?: string | null) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

const firstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const trimmed = String(value || '').trim()
    if (trimmed) return trimmed
  }

  return ''
}

const normalizeEmailCandidate = (value?: string | null) => {
  const trimmed = String(value || '').trim().toLowerCase()
  if (!trimmed) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return ''
  return trimmed
}

const collectUniqueEmails = (...values: Array<string | null | undefined>) => {
  const seen = new Set<string>()
  const emails: string[] = []

  for (const value of values) {
    const normalized = normalizeEmailCandidate(value)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    emails.push(normalized)
  }

  return emails
}

const deriveShipmentEmailStage = (status?: string | null): ShipmentStatusEmailStage | null => {
  const normalized = normalizeStatus(status)
  if (!normalized) return null

  if (
    normalized.includes('cancelled') ||
    normalized.includes('canceled') ||
    normalized.includes('rto') ||
    normalized.includes('lost')
  ) {
    return 'failed'
  }

  if (
    normalized.includes('undelivered') ||
    normalized.includes('ndr') ||
    normalized.includes('delivery attempted') ||
    normalized.includes('attempt failed') ||
    normalized.includes('exception') ||
    normalized.includes('not delivered')
  ) {
    return 'ndr'
  }

  if (
    normalized.includes('booked') ||
    normalized.includes('confirmed') ||
    normalized.includes('order created')
  ) {
    return 'booked'
  }

  if (normalized.includes('out for delivery') || normalized.includes('ofd')) {
    return 'out_for_delivery'
  }

  if (
    normalized.includes('picked up') ||
    normalized.includes('pickup done') ||
    normalized.includes('pickup complete') ||
    normalized.includes('pickup completed') ||
    normalized.includes('pickup successful')
  ) {
    return 'picked_up'
  }

  if (
    normalized.includes('in transit') ||
    normalized.includes('transit') ||
    normalized.includes('dispatched')
  ) {
    return 'in_transit'
  }

  if (
    normalized.includes('manifest') ||
    normalized.includes('booked') ||
    normalized.includes('pickup initiated') ||
    normalized.includes('pickup_initiated') ||
    normalized.includes('pickup scheduled') ||
    normalized.includes('pickup_scheduled') ||
    normalized.includes('shipment created') ||
    normalized.includes('created') ||
    normalized.includes('manifest generated')
  ) {
    return 'manifested'
  }

  if (normalized.includes('delivered')) {
    return 'delivered'
  }

  return null
}

async function resolveSellerBrandDetails(userId: string) {
  const [row] = await db
    .select({
      loginEmail: users.email,
      pendingEmail: users.pendingEmail,
      contactEmail: sql<string>`coalesce((${userProfiles.companyInfo} ->> 'contactEmail'), '')`,
      companyEmail: sql<string>`coalesce((${userProfiles.companyInfo} ->> 'companyEmail'), '')`,
      alternateEmail: sql<string>`coalesce((${userProfiles.companyInfo} ->> 'email'), '')`,
      supportEmail: sql<string>`coalesce((${userProfiles.companyInfo} ->> 'supportEmail'), '')`,
      notificationEmail: sql<string>`coalesce((${userProfiles.companyInfo} ->> 'notificationEmail'), '')`,
      brandName: sql<string>`coalesce(
        (${userProfiles.companyInfo} ->> 'brandName'),
        (${userProfiles.companyInfo} ->> 'businessName'),
        ''
      )`,
      logoUrl: sql<string>`coalesce(
        (${userProfiles.companyInfo} ->> 'companyLogoUrl'),
        (${userProfiles.companyInfo} ->> 'profilePicture'),
        ''
      )`,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  const recipientEmails = collectUniqueEmails(
    row?.contactEmail,
    row?.companyEmail,
    row?.alternateEmail,
    row?.supportEmail,
    row?.notificationEmail,
    row?.loginEmail,
    row?.pendingEmail,
  )

  return {
    recipientEmails,
    brandName: String(row?.brandName || '').trim() || null,
    logoUrl: String(row?.logoUrl || '').trim() || null,
  }
}

function resolveOrderFallbackEmail(orderDetails?: ShipmentOrderLike | null) {
  return firstNonEmpty(
    orderDetails?.buyer_email,
    orderDetails?.buyerEmail,
    orderDetails?.consignee_email,
    orderDetails?.consigneeEmail,
    orderDetails?.customer_email,
    orderDetails?.customerEmail,
    orderDetails?.email,
  )
}

export async function sendShipmentStatusEmailIfChanged(params: {
  userId: string
  awbNumber: string
  orderNumber?: string | null
  orderDetails?: ShipmentOrderLike | null
  previousStatus?: string | null
  nextStatus?: string | null
}) {
  const { userId, awbNumber, orderNumber, orderDetails, previousStatus, nextStatus } = params
  const nextStage = deriveShipmentEmailStage(nextStatus)
  if (!nextStage) {
    return { sent: false, reason: 'unsupported_status' as const }
  }

  const previousStage = deriveShipmentEmailStage(previousStatus)
  if (previousStage === nextStage) {
    return { sent: false, reason: 'duplicate_stage' as const }
  }

  const sellerDetails = await resolveSellerBrandDetails(userId)
  const to = sellerDetails.recipientEmails
  const fallbackTo = resolveOrderFallbackEmail(orderDetails)
  const recipients = to.length > 0 ? to : fallbackTo ? [fallbackTo] : []
  if (!recipients.length) {
    return { sent: false, reason: 'missing_recipient' as const }
  }

  if (!to.length && fallbackTo) {
    console.warn('[ShipmentEmail] Falling back to order email because seller email is missing', {
      userId,
      orderNumber,
      recipient: fallbackTo,
    })
  }

  const orderLabel = resolveShipmentOrderLabel(orderDetails) || orderNumber || null
  let sentCount = 0

  for (const recipient of recipients) {
    try {
      await sendShipmentStatusEmail({
        to: recipient,
        awbNumber,
        orderNumber,
        orderLabel,
        stage: nextStage,
        sellerName: sellerDetails.brandName || null,
        sellerLogoUrl: sellerDetails.logoUrl,
        orderDetails,
      })
    } catch (error) {
      console.error('[ShipmentEmail] Failed to send seller shipment email', {
        userId,
        orderNumber,
        awbNumber,
        recipient,
        stage: nextStage,
        error,
      })
      continue
    }

    sentCount += 1
  }

  return { sent: sentCount > 0, stage: nextStage, to: recipients, sentCount }
}
