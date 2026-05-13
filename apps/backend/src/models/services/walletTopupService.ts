import { and, eq, or } from 'drizzle-orm'
import {
  assertRazorpayConfigured,
  getRazorpayKeyId,
  razorpay,
  verifyRazorpayPaymentSignature,
} from '../../utils/razorpay'
import { db } from '../client'
import { wallets, walletTopups } from '../schema/wallet'
import { createWalletTransaction } from './wallet.service'

const WALLET_TOPUP_DESCRIPTION = 'Wallet Top-up'

type RazorpayPaymentEntity = {
  id: string
  order_id: string
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed' | string
  method?: string
  email?: string
  contact?: string
}

export async function walletOfUser(userId: string, tx: any = db) {
  const w = await tx?.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  })
  if (!w) throw new Error('Wallet not found')
  return w
}

export async function createWalletOrder(
  userId: string,
  amount: number,
  details: { name?: string; email?: string; phone?: string },
) {
  if (!userId) throw new Error('Unauthorized')
  assertRazorpayConfigured()

  const wallet = await walletOfUser(userId)
  const roundedAmount = Number(amount.toFixed(2))
  const receipt = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(roundedAmount * 100),
    currency: wallet.currency ?? 'INR',
    receipt,
    notes: {
      userId,
      walletId: wallet.id,
      type: 'wallet_recharge',
      description: WALLET_TOPUP_DESCRIPTION,
    },
  })

  await db.insert(walletTopups).values({
    walletId: wallet.id,
    amount: roundedAmount,
    currency: wallet.currency ?? 'INR',
    gatewayOrderId: razorpayOrder.id,
    status: 'created',
  })

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: getRazorpayKeyId(),
    name: 'ChoiceMee Logistics',
    description: 'Wallet Recharge',
    prefill: {
      name: details.name || 'ChoiceMee Customer',
      email: details.email || '',
      contact: details.phone || '',
    },
    theme: {
      color: '#0052CC',
    },
  }
}

export async function confirmSuccess(
  orderId: string,
  paymentId: string,
  paise: number,
  meta: Record<string, unknown> = {},
) {
  const paidAmount = Number((paise / 100).toFixed(2))

  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(walletTopups)
      .set({
        status: 'success',
        gatewayPaymentId: paymentId,
        meta: {
          ...(meta ?? {}),
          paidAmount,
        },
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(walletTopups.gatewayOrderId, orderId),
          or(eq(walletTopups.status, 'created'), eq(walletTopups.status, 'processing')),
        ),
      )
      .returning()

    if (!row) {
      console.warn('Wallet top-up was already processed or not found for order:', orderId)
      return null
    }

    const expectedAmount = Number(row.amount)
    if (Math.abs(expectedAmount - paidAmount) > 0.01) {
      throw new Error(
        `Wallet top-up amount mismatch for order ${orderId}. Expected ${expectedAmount}, received ${paidAmount}.`,
      )
    }

    await createWalletTransaction({
      walletId: row.walletId,
      amount: expectedAmount,
      currency: row.currency ?? 'INR',
      type: 'credit',
      ref: paymentId,
      reason: 'Wallet Recharge',
      meta: { orderId, gateway: 'razorpay', ...meta },
      tx,
    })

    return row
  })
}

export async function confirmClientTopup({
  userId,
  orderId,
  paymentId,
  signature,
}: {
  userId: string
  orderId: string
  paymentId: string
  signature: string
}) {
  if (!userId) throw new Error('Unauthorized')
  if (!orderId || !paymentId || !signature) throw new Error('Missing Razorpay payment details')

  assertRazorpayConfigured()

  if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
    throw new Error('Invalid Razorpay payment signature')
  }

  const [topup] = await db
    .select()
    .from(walletTopups)
    .where(eq(walletTopups.gatewayOrderId, orderId))
    .limit(1)

  if (!topup) throw new Error('Wallet top-up order not found')

  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, topup.walletId)).limit(1)
  if (!wallet || wallet.userId !== userId) {
    throw new Error('Wallet top-up order does not belong to this user')
  }

  if (topup.status === 'success') {
    return { status: 'success', alreadyProcessed: true, orderId, paymentId }
  }
  if (topup.status === 'failed') {
    throw new Error('Wallet top-up order is already marked failed')
  }

  const expectedPaise = Math.round(Number(topup.amount) * 100)
  let payment = (await (razorpay.payments as any).fetch(paymentId)) as RazorpayPaymentEntity

  if (payment.order_id !== orderId) {
    throw new Error('Razorpay payment does not belong to this wallet top-up order')
  }
  if (Number(payment.amount) !== expectedPaise) {
    throw new Error('Razorpay payment amount does not match wallet top-up amount')
  }

  if (payment.status === 'authorized') {
    payment = (await (razorpay.payments as any).capture(
      paymentId,
      expectedPaise,
      topup.currency ?? 'INR',
    )) as RazorpayPaymentEntity
  }

  if (payment.status !== 'captured') {
    throw new Error(`Razorpay payment is not captured yet. Current status: ${payment.status}`)
  }

  const creditedTopup = await confirmSuccess(orderId, paymentId, Number(payment.amount), {
    source: 'client_confirm',
    method: payment.method,
    email: payment.email,
    contact: payment.contact,
  })

  return {
    status: 'success',
    alreadyProcessed: !creditedTopup,
    orderId,
    paymentId,
  }
}

export async function confirmFailure(orderId: string, paymentId: string | null, reason: string) {
  await db
    .update(walletTopups)
    .set({
      status: 'failed',
      gatewayPaymentId: paymentId,
      meta: { reason },
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(walletTopups.gatewayOrderId, orderId),
        or(eq(walletTopups.status, 'created'), eq(walletTopups.status, 'processing')),
      ),
    )
    .returning()
}

export async function markTopupProcessing(orderId: string, paymentId: string) {
  await db
    .update(walletTopups)
    .set({
      status: 'processing',
      gatewayPaymentId: paymentId,
      updatedAt: new Date(),
    })
    .where(and(eq(walletTopups.gatewayOrderId, orderId), eq(walletTopups.status, 'created')))
}
