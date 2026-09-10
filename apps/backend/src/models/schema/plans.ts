import { boolean, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(), // e.g. Basic, Gold, Enterprise
  description: varchar('description', { length: 255 }),
  // Percentage added to the courier cost for sellers assigned to this plan.
  commission_percentage: numeric('commission_percentage', { precision: 5, scale: 2 })
    .default('0')
    .notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
})
