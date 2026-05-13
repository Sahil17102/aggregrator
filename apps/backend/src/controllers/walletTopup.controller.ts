import { Request, Response } from 'express'
import { getPaymentOptions } from '../models/services/paymentOptions.service'
import { confirmClientTopup, createWalletOrder } from '../models/services/walletTopupService'

const getErrorMessage = (err: unknown, fallback: string) => {
  const error = err as {
    message?: string
    error?: { description?: string; reason?: string }
    response?: { data?: { error?: { description?: string; reason?: string }; message?: string } }
  }

  return (
    error?.response?.data?.error?.description ||
    error?.response?.data?.error?.reason ||
    error?.response?.data?.message ||
    error?.error?.description ||
    error?.error?.reason ||
    error?.message ||
    fallback
  )
}

export const createTopup = async (req: Request, res: Response): Promise<any> => {
  const amt = Number(req.body.amount)
  const { name, email, phone } = req.body

  if (!amt || amt <= 0) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    // Enforce minimum wallet recharge amount (if configured)
    const paymentSettings = await getPaymentOptions()
    const minWalletRecharge = paymentSettings.minWalletRecharge ?? 0

    if (minWalletRecharge > 0 && amt < minWalletRecharge) {
      return res.status(400).json({
        error: `Minimum wallet recharge amount is ₹${minWalletRecharge}`,
        minWalletRecharge,
      })
    }

    const userId = (req as any).user?.sub

    // Razorpay order creation
    const data = await createWalletOrder(userId, amt, { name, email, phone })

    // returns { orderId, amount, currency, key, name, description, prefill, theme }
    res.status(201).json(data)
  } catch (err: any) {
    console.error('Razorpay top-up error:', err)
    const message = getErrorMessage(err, 'Top-up failed')
    const status = message.toLowerCase().includes('credential') ? 503 : 500
    res.status(status).json({ error: message })
  }
}

export const confirmFromClient = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body
    const userId = (req as any).user?.sub

    const data = await confirmClientTopup({
      userId,
      orderId,
      paymentId,
      signature,
    })

    res.json({ ok: true, data })
  } catch (err: any) {
    console.error('Razorpay client confirmation error:', err)
    res.status(400).json({ error: getErrorMessage(err, 'Payment confirmation failed') })
  }
}
