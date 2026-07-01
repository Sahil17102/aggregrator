import { boolean, integer, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Global payment options settings
 * This table stores a single row with global payment options configuration
 */
export const paymentOptions = pgTable('payment_options', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Payment type availability
  codEnabled: boolean('cod_enabled').default(true).notNull(),
  prepaidEnabled: boolean('prepaid_enabled').default(true).notNull(),

  // Minimum wallet recharge amount in smallest currency unit (e.g. INR rupees)
  // 0 = no minimum enforced
  minWalletRecharge: integer('min_wallet_recharge').default(0).notNull(),

  // Optional shipment insurance charge added during booking wallet debit
  insuranceChargeEnabled: boolean('insurance_charge_enabled').default(false).notNull(),
  insuranceChargeThreshold: integer('insurance_charge_threshold').default(2000).notNull(),
  insuranceChargeBaseAmount: numeric('insurance_charge_base_amount', {
    precision: 12,
    scale: 2,
  })
    .default('5')
    .notNull(),
  insuranceChargePercentage: numeric('insurance_charge_percentage', {
    precision: 8,
    scale: 4,
  })
    .default('0.5')
    .notNull(),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
