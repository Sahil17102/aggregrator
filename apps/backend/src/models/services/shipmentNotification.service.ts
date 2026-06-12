import { eq, sql } from 'drizzle-orm'
import { db } from '../client'
import { userProfiles } from '../schema/userProfile'
import { users } from '../schema/users'
import {
  sendShipmentStatusEmail,
  type ShipmentStatusEmailStage,
} from '../../utils/emailSender'

const normalizeStatus = (value?: string | null) => String(value || '').trim().toLowerCase()

const deriveShipmentEmailStage = (status?: string | null): ShipmentStatusEmailStage | null => {
  const normalized = normalizeStatus(status)
  if (!normalized) return null

  if (
    normalized.includes('failed') ||
    normalized.includes('cancelled') ||
    normalized.includes('canceled') ||
    normalized.includes('rto') ||
    normalized.includes('undelivered') ||
    normalized.includes('ndr')
  ) {
    return 'failed'
  }

  if (normalized.includes('out for delivery') || normalized.includes('ofd')) {
    return 'out_for_delivery'
  }

  if (
    normalized.includes('picked up') ||
    normalized.includes('in transit') ||
    normalized.includes('transit') ||
    normalized.includes('dispatched')
  ) {
    return 'picked_up'
  }

  if (
    normalized.includes('manifest') ||
    normalized.includes('booked') ||
    normalized.includes('pickup initiated') ||
    normalized.includes('pickup_initiated') ||
    normalized.includes('pickup scheduled') ||
    normalized.includes('pickup_scheduled') ||
    normalized.includes('shipment created') ||
    normalized.includes('created')
  ) {
    return 'manifested'
  }

  if (normalized.includes('delivered')) {
    return 'delivered'
  }

  return null
}

async function resolveSellerEmail(userId: string) {
  const [row] = await db
    .select({
      loginEmail: users.email,
      profileEmail: sql<string>`coalesce(
        (${userProfiles.companyInfo} ->> 'contactEmail'),
        (${userProfiles.companyInfo} ->> 'companyEmail'),
        ''
      )`,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  const resolvedEmail = String(row?.profileEmail || row?.loginEmail || '').trim()
  return resolvedEmail || null
}

export async function sendShipmentStatusEmailIfChanged(params: {
  userId: string
  awbNumber: string
  orderNumber?: string | null
  previousStatus?: string | null
  nextStatus?: string | null
}) {
  const { userId, awbNumber, orderNumber, previousStatus, nextStatus } = params
  const nextStage = deriveShipmentEmailStage(nextStatus)
  if (!nextStage) {
    return { sent: false, reason: 'unsupported_status' as const }
  }

  const previousStage = deriveShipmentEmailStage(previousStatus)
  if (previousStage === nextStage) {
    return { sent: false, reason: 'duplicate_stage' as const }
  }

  const to = await resolveSellerEmail(userId)
  if (!to) {
    return { sent: false, reason: 'missing_recipient' as const }
  }

  await sendShipmentStatusEmail({
    to,
    awbNumber,
    orderNumber,
    stage: nextStage,
  })

  return { sent: true, stage: nextStage, to }
}
