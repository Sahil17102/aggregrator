import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const shipment_email_deliveries = pgTable(
  'shipment_email_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id').notNull(),
    shipmentKey: varchar('shipment_key', { length: 120 }).notNull(),
    orderNumber: varchar('order_number', { length: 64 }),
    awbNumber: varchar('awb_number', { length: 100 }).notNull(),
    stage: varchar('stage', { length: 32 }).notNull(),
    recipientEmail: varchar('recipient_email', { length: 150 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('sending'),
    attempts: integer('attempts').notNull().default(1),
    subject: text('subject').notNull(),
    error: text('error'),
    messageId: varchar('message_id', { length: 255 }),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqueShipmentRecipientStage: uniqueIndex(
      'shipment_email_deliveries_seller_shipment_stage_recipient_idx',
    ).on(table.sellerId, table.shipmentKey, table.stage, table.recipientEmail),
  }),
)
