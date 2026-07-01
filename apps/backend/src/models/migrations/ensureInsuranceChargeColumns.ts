import { pool } from '../client'

const insuranceChargeColumnPatch = `
  alter table if exists payment_options
    add column if not exists insurance_charge_enabled boolean not null default false,
    add column if not exists insurance_charge_threshold integer not null default 2000,
    add column if not exists insurance_charge_base_amount numeric(12, 2) not null default '5',
    add column if not exists insurance_charge_percentage numeric(8, 4) not null default '0.5';

  alter table if exists b2c_orders
    add column if not exists insurance_charge numeric,
    add column if not exists insurance_charge_basis numeric;

  alter table if exists b2b_orders
    add column if not exists insurance_charge numeric,
    add column if not exists insurance_charge_basis numeric;
`

export const ensureInsuranceChargeColumns = async () => {
  await pool.query(insuranceChargeColumnPatch)
  console.log('Insurance charge schema is ready')
}
