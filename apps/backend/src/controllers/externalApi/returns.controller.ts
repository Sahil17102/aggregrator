import { eq } from 'drizzle-orm'
import { Response } from 'express'
import { db } from '../../models/client'
import { quoteReverseForOrder } from '../../models/services/reverse.service'
import { createB2CShipmentService } from '../../models/services/shiprocket.service'
import { createWalletTransaction } from '../../models/services/wallet.service'
import { b2c_orders, wallets } from '../../schema/schema'
import { sendWebhookEvent } from '../../services/webhookDelivery.service'

/**
 * Create a return order (reverse pickup)
 * POST /api/v1/returns
 */
export const createReturnOrderController = async (req: any, res: Response) => {
  try {
    const userId = req.userId
    const body = req.body || {}
    const originalOrderId = body?.original_order_id || body?.order_id || body?.orderId

    if (!body.order_number || !originalOrderId || !body.consignee || !Array.isArray(body.order_items) || body.order_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'order_number, original_order_id, consignee, and order_items are required',
      })
    }

    const payload = {
      ...body,
      payment_type: 'reverse',
    }

    // Quote reverse charge and debit wallet
    const quote = await quoteReverseForOrder(
      originalOrderId,
      Number(body?.package_weight),
      userId,
    )
    const reverseCharge = Number(quote.rate || 0)
    payload.courier_id = quote.courierId
    payload.integration_type = quote.serviceProvider || payload.integration_type
    payload.shipping_mode = quote.shippingMode || payload.shipping_mode
    payload.selected_max_slab_weight = quote.max_slab_weight ?? payload.selected_max_slab_weight
    payload.freight_charges = reverseCharge

    if (reverseCharge > 0) {
      const [userWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1)
      if (!userWallet) throw new Error('Wallet not found')
      if (Number(userWallet.balance || 0) < reverseCharge) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          message: 'Insufficient wallet balance for reverse shipment',
        })
      }
      await createWalletTransaction({
        walletId: userWallet.id,
        amount: reverseCharge,
        type: 'debit',
        reason: 'reverse_shipment',
        meta: { order_number: payload.order_number },
      })
      payload.shipping_charges = reverseCharge
    }

    const result = await createB2CShipmentService(payload, userId)
    const { order: newOrder, shipment: shipmentData } = result

    // Fetch the full order data
    const [order] = await db
      .select()
      .from(b2c_orders)
      .where(eq(b2c_orders.id, newOrder.id))
      .limit(1)

    if (!order) {
      return res.status(500).json({
        success: false,
        error: 'Return order creation failed',
        message: 'Return order was created but could not be retrieved',
      })
    }

    // 🔔 Send webhook event for return order creation
    sendWebhookEvent(userId, 'order.return_created', {
      order_id: order.id,
      order_number: order.order_number,
      awb_number: order.awb_number,
      original_order_id: originalOrderId,
      status: order.order_status || 'booked',
      reverse_charge: reverseCharge,
      shipment_data: shipmentData,
    }).catch((err) => {
      console.error('Failed to send return order webhook:', err)
    })

    res.status(201).json({
      success: true,
      message: 'Return order created successfully',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        awb_number: order.awb_number,
        status: order.order_status || 'booked',
        reverse_charge: reverseCharge,
        label: order.label,
        courier_partner: order.courier_partner,
      },
    })
  } catch (error: any) {
    console.error('Error creating return order via API:', error)
    const message = error?.message || 'Internal server error'
    const status =
      typeof error?.statusCode === 'number'
        ? error.statusCode
        : /not found/i.test(message)
          ? 404
          : /required|invalid|unavailable|insufficient|no reverse rate/i.test(message)
            ? 400
            : 500
    res.status(status).json({
      success: false,
      error: 'Failed to create return order',
      message,
    })
  }
}

/**
 * Get quote for return order
 * GET /api/v1/returns/quote
 */
export const getReturnQuoteController = async (req: any, res: Response) => {
  try {
    const userId = req.userId
    const { orderId, weightGrams } = req.query as { orderId?: string; weightGrams?: string }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameter',
        message: 'orderId is required',
      })
    }

    const quote = await quoteReverseForOrder(
      orderId,
      weightGrams ? Number(weightGrams) : undefined,
      userId,
    )

    res.status(200).json({
      success: true,
      data: quote,
    })
  } catch (error: any) {
    console.error('Error getting return quote via API:', error)
    const message = error?.message || 'Internal server error'
    const status = /not found/i.test(message)
      ? 404
      : /required|invalid|unavailable|no reverse rate/i.test(message)
        ? 400
        : 500
    res.status(status).json({
      success: false,
      error: 'Failed to get return quote',
      message,
    })
  }
}
