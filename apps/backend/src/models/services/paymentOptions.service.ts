import { db } from '../client'
import { paymentOptions } from '../schema/paymentOptions'

/**
 * Get payment options settings
 * Returns the first (and only) row, or creates default if none exists
 */
export async function getPaymentOptions() {
  const [settings] = await db.select().from(paymentOptions).limit(1)

  if (settings) {
    return settings
  }

  // Create default settings (both enabled by default)
  const [newSettings] = await db
    .insert(paymentOptions)
    .values({
      codEnabled: true,
      prepaidEnabled: true,
    })
    .returning()

  return newSettings
}

/**
 * Update payment options settings
 */
export async function updatePaymentOptions(updates: {
  codEnabled?: boolean
  prepaidEnabled?: boolean
  minWalletRecharge?: number
  insuranceChargeEnabled?: boolean
  insuranceChargeThreshold?: number
  insuranceChargeBaseAmount?: number
  insuranceChargePercentage?: number
}) {
  // Ensure settings exist
  await getPaymentOptions()

  const updateData: any = { updatedAt: new Date() }

  if (updates.codEnabled !== undefined) {
    updateData.codEnabled = updates.codEnabled
  }
  if (updates.prepaidEnabled !== undefined) {
    updateData.prepaidEnabled = updates.prepaidEnabled
  }
  if (updates.minWalletRecharge !== undefined) {
    const value = Number(updates.minWalletRecharge)
    updateData.minWalletRecharge = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  }
  if (updates.insuranceChargeEnabled !== undefined) {
    updateData.insuranceChargeEnabled = updates.insuranceChargeEnabled
  }
  if (updates.insuranceChargeThreshold !== undefined) {
    const value = Number(updates.insuranceChargeThreshold)
    updateData.insuranceChargeThreshold = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  }
  if (updates.insuranceChargeBaseAmount !== undefined) {
    const value = Number(updates.insuranceChargeBaseAmount)
    updateData.insuranceChargeBaseAmount = Number.isFinite(value) && value >= 0 ? value.toFixed(2) : '0.00'
  }
  if (updates.insuranceChargePercentage !== undefined) {
    const value = Number(updates.insuranceChargePercentage)
    updateData.insuranceChargePercentage = Number.isFinite(value) && value >= 0 ? value.toFixed(4) : '0.0000'
  }

  // Update the first (and only) row
  const [updated] = await db.update(paymentOptions).set(updateData).returning()

  // If no rows exist, create one
  if (!updated) {
    const [newSettings] = await db
      .insert(paymentOptions)
      .values({
        codEnabled: updates.codEnabled ?? true,
        prepaidEnabled: updates.prepaidEnabled ?? true,
        minWalletRecharge:
          updates.minWalletRecharge !== undefined && !isNaN(Number(updates.minWalletRecharge))
            ? Math.max(0, Math.floor(Number(updates.minWalletRecharge)))
            : 0,
        insuranceChargeEnabled: updates.insuranceChargeEnabled ?? false,
        insuranceChargeThreshold:
          updates.insuranceChargeThreshold !== undefined &&
          !isNaN(Number(updates.insuranceChargeThreshold))
            ? Math.max(0, Math.floor(Number(updates.insuranceChargeThreshold)))
            : 2000,
        insuranceChargeBaseAmount:
          updates.insuranceChargeBaseAmount !== undefined &&
          Number.isFinite(Number(updates.insuranceChargeBaseAmount))
            ? Math.max(0, Number(updates.insuranceChargeBaseAmount)).toFixed(2)
            : '5.00',
        insuranceChargePercentage:
          updates.insuranceChargePercentage !== undefined &&
          Number.isFinite(Number(updates.insuranceChargePercentage))
            ? Math.max(0, Number(updates.insuranceChargePercentage)).toFixed(4)
            : '0.5000',
      })
      .returning()

    return newSettings
  }

  return updated
}
