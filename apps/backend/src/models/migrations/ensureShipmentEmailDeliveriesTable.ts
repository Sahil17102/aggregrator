import { pool } from '../client'

const shipmentEmailDeliveriesTablePatch = `
  create table if not exists shipment_email_deliveries (
    id uuid primary key default gen_random_uuid(),
    seller_id uuid not null,
    shipment_key varchar(120) not null,
    order_number varchar(64),
    awb_number varchar(100) not null,
    stage varchar(32) not null,
    recipient_email varchar(150) not null,
    status varchar(20) not null default 'sending',
    attempts integer not null default 1,
    subject text not null,
    error text,
    message_id varchar(255),
    sent_at timestamp,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );

  alter table shipment_email_deliveries
    add column if not exists seller_id uuid,
    add column if not exists message_id varchar(255);

  alter table shipment_email_deliveries
    alter column status set default 'sending',
    alter column sent_at drop default;
`

const shipmentEmailDeliveriesIndexPatch = `
  drop index if exists shipment_email_deliveries_shipment_key_stage_recipient_idx;

  create unique index if not exists shipment_email_deliveries_seller_shipment_stage_recipient_idx
    on shipment_email_deliveries (seller_id, shipment_key, stage, recipient_email);

  create index if not exists shipment_email_deliveries_retry_idx
    on shipment_email_deliveries (status, updated_at)
    where status in ('sending', 'failed');
`

export const ensureShipmentEmailDeliveriesTable = async () => {
  await pool.query(shipmentEmailDeliveriesTablePatch)
  await pool.query(shipmentEmailDeliveriesIndexPatch)
  console.log('Shipment email delivery ledger schema is ready')
}
