import { and, desc, eq } from 'drizzle-orm'
import { sendNotification } from '../../config/socketServer'
import { sendTransactionalEmail } from '../../utils/emailSender'
import { db } from '../client'
import { notifications } from '../schema/notifications'
import { users } from '../schema/users'

export type NotificationType = 'ticket_update' | 'payment' | 'general'

interface CreateNotificationParams {
  userId?: string
  title: string
  message: string
  targetRole: 'admin' | 'user'
  type?: NotificationType
  sendEmail?: boolean
  email?: string
}

export async function createNotificationService(params: CreateNotificationParams) {
  const { targetRole, userId, title, message } = params

  if (targetRole === 'admin') {
    const adminUsers = await db.query.users.findMany({
      where: eq(users.role, 'admin'),
      columns: { id: true, email: true },
    })

    if (adminUsers.length === 0) return null

    const notificationsData = adminUsers.map((admin) => ({
      targetRole,
      userId: admin.id,
      title,
      message,
    }))

    const newNotifications = await db.insert(notifications).values(notificationsData).returning()

    newNotifications.forEach((n) => {
      if (n?.userId) sendNotification(n.userId, n)
    })

    if (params.sendEmail) {
      await Promise.all(
        adminUsers.map((admin) =>
          admin.email ? sendEmailNotification(admin.email, title, message) : Promise.resolve(),
        ),
      )
    }

    return newNotifications
  }

  const [newNotification] = await db
    .insert(notifications)
    .values({
      targetRole,
      userId: userId || null,
      title,
      message,
    })
    .returning()

  if (userId && targetRole === 'user') {
    sendNotification(userId, newNotification)
  }

  if (params.sendEmail) {
    const recipient =
      params.email ||
      (
        await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, userId || ''))
          .limit(1)
      )[0]?.email

    if (recipient) await sendEmailNotification(recipient, title, message)
  }

  return newNotification
}

export async function getNotificationsForUser(userId: string) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId) as any)
    .orderBy(desc(notifications.createdAt))
  return rows
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning()
  return updated
}

export async function markAllNotificationsAsRead(userId: string) {
  const updated = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    .returning({ id: notifications.id })

  return {
    count: updated.length,
  }
}

async function sendEmailNotification(to: string, subject: string, message: string) {
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">${subject}</h2>
        <p style="font-size: 16px; color: #555;">${message}</p>
        <p style="font-size: 14px; color: #888; margin-top: 32px;">- The Ship Aggregator Team</p>
      </div>
    `

  try {
    await sendTransactionalEmail(to, subject, html)
  } catch (error) {
    console.error('Email sending failed:', error)
  }
}


