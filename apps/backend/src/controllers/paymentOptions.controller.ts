import { Request, Response } from 'express'
import { getPaymentOptions, updatePaymentOptions } from '../models/services/paymentOptions.service'

function setNoStoreHeaders(req: Request, res: Response) {
  delete req.headers['if-none-match']
  delete req.headers['if-modified-since']
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
}

function serializePaymentOptions(settings: Awaited<ReturnType<typeof getPaymentOptions>>) {
  return {
    codEnabled: settings.codEnabled,
    prepaidEnabled: settings.prepaidEnabled,
    minWalletRecharge: settings.minWalletRecharge ?? 0,
    insuranceChargeEnabled: settings.insuranceChargeEnabled ?? false,
    insuranceChargeThreshold: Number(settings.insuranceChargeThreshold ?? 2000),
    insuranceChargeBaseAmount: Number(settings.insuranceChargeBaseAmount ?? 5),
    insuranceChargePercentage: Number(settings.insuranceChargePercentage ?? 0.5),
  }
}

/**
 * Get payment options settings (public endpoint)
 * GET /api/payment-options
 */
export async function getPaymentOptionsController(req: Request, res: Response) {
  try {
    const settings = await getPaymentOptions()
    setNoStoreHeaders(req, res)

    return res.json(serializePaymentOptions(settings))
  } catch (error: any) {
    console.error('Error getting payment options:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch payment options' })
  }
}

/**
 * Update payment options settings (admin only)
 * PUT /api/admin/payment-options
 */
export async function updatePaymentOptionsController(req: Request, res: Response) {
  try {
    const {
      codEnabled,
      prepaidEnabled,
      minWalletRecharge,
      insuranceChargeEnabled,
      insuranceChargeThreshold,
      insuranceChargeBaseAmount,
      insuranceChargePercentage,
    } = req.body

    if (
      codEnabled === undefined &&
      prepaidEnabled === undefined &&
      (minWalletRecharge === undefined || minWalletRecharge === null) &&
      insuranceChargeEnabled === undefined &&
      (insuranceChargeThreshold === undefined || insuranceChargeThreshold === null) &&
      (insuranceChargeBaseAmount === undefined || insuranceChargeBaseAmount === null) &&
      (insuranceChargePercentage === undefined || insuranceChargePercentage === null)
    ) {
      return res
        .status(400)
        .json({
          error:
            'At least one field (codEnabled, prepaidEnabled, minWalletRecharge, insuranceChargeEnabled, insuranceChargeThreshold, insuranceChargeBaseAmount, insuranceChargePercentage) must be provided',
        })
    }

    if (minWalletRecharge !== undefined && minWalletRecharge !== null) {
      const value = Number(minWalletRecharge)
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: 'minWalletRecharge must be a non-negative number' })
      }
    }
    if (insuranceChargeThreshold !== undefined && insuranceChargeThreshold !== null) {
      const value = Number(insuranceChargeThreshold)
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: 'insuranceChargeThreshold must be a non-negative number' })
      }
    }
    if (insuranceChargeBaseAmount !== undefined && insuranceChargeBaseAmount !== null) {
      const value = Number(insuranceChargeBaseAmount)
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: 'insuranceChargeBaseAmount must be a non-negative number' })
      }
    }
    if (insuranceChargePercentage !== undefined && insuranceChargePercentage !== null) {
      const value = Number(insuranceChargePercentage)
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: 'insuranceChargePercentage must be a non-negative number' })
      }
    }

    const updates: {
      codEnabled?: boolean
      prepaidEnabled?: boolean
      minWalletRecharge?: number
      insuranceChargeEnabled?: boolean
      insuranceChargeThreshold?: number
      insuranceChargeBaseAmount?: number
      insuranceChargePercentage?: number
    } = {}
    if (codEnabled !== undefined) {
      updates.codEnabled = Boolean(codEnabled)
    }
    if (prepaidEnabled !== undefined) {
      updates.prepaidEnabled = Boolean(prepaidEnabled)
    }
    if (minWalletRecharge !== undefined && minWalletRecharge !== null) {
      updates.minWalletRecharge = Number(minWalletRecharge)
    }
    if (insuranceChargeEnabled !== undefined) {
      updates.insuranceChargeEnabled = Boolean(insuranceChargeEnabled)
    }
    if (insuranceChargeThreshold !== undefined && insuranceChargeThreshold !== null) {
      updates.insuranceChargeThreshold = Number(insuranceChargeThreshold)
    }
    if (insuranceChargeBaseAmount !== undefined && insuranceChargeBaseAmount !== null) {
      updates.insuranceChargeBaseAmount = Number(insuranceChargeBaseAmount)
    }
    if (insuranceChargePercentage !== undefined && insuranceChargePercentage !== null) {
      updates.insuranceChargePercentage = Number(insuranceChargePercentage)
    }

    const settings = await updatePaymentOptions(updates)
    setNoStoreHeaders(req, res)

    return res.json({
      success: true,
      settings: serializePaymentOptions(settings),
    })
  } catch (error: any) {
    console.error('Error updating payment options:', error)
    return res.status(500).json({ error: error.message || 'Failed to update payment options' })
  }
}
