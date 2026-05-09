import { pool } from '../client'

const invoicePreferenceColumnPatch = `
  alter table if exists invoice_preferences
    add column if not exists seller_name varchar(255),
    add column if not exists brand_name varchar(255),
    add column if not exists gst_number varchar(32),
    add column if not exists pan_number varchar(32),
    add column if not exists seller_address text,
    add column if not exists state_code varchar(10),
    add column if not exists support_email varchar(150),
    add column if not exists support_phone varchar(50),
    add column if not exists invoice_notes text,
    add column if not exists terms_and_conditions text
`

export const ensureInvoicePreferencesColumns = async () => {
  await pool.query(invoicePreferenceColumnPatch)
  console.log('Invoice preferences schema is ready')
}
