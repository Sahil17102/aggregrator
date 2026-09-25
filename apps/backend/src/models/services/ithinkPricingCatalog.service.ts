import { randomUUID } from 'crypto'
import { and, eq, sql } from 'drizzle-orm'
import { db, pool } from '../client'
import { couriers } from '../schema/couriers'
import { plans } from '../schema/plans'
import { shippingRateCodSlabs, shippingRates, shippingRateSlabs } from '../schema/shippingRates'
import { b2bZoneToZoneRates, zones } from '../schema/zones'

const SOURCE = 'ithink-default-pricing-v1'
const PROVIDER = 'ithink'

const catalog = [
  { id: 1, name: 'Xpressbees Surface', b2cBase: 95.46, b2bPerKg: 18 },
  { id: 3, name: 'Delhivery Surface', b2cBase: 74.37, b2bPerKg: 16 },
  { id: 7, name: 'BlueDart Surface', b2cBase: 102.96, b2bPerKg: 22 },
  { id: 8, name: 'Shadowfax Surface', b2cBase: 66.6, b2bPerKg: 15 },
  { id: 14, name: 'DTDC Surface', b2cBase: 85.45, b2bPerKg: 19 },
] as const

const money = (value: number) => (Math.round(value * 100) / 100).toFixed(2)
const zoneMultiplier = (code: string) => {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'WITHIN_CITY') return 0.85
  if (normalized === 'WITHIN_STATE') return 0.9
  if (normalized === 'WITHIN_REGION') return 0.95
  if (normalized === 'METRO_TO_METRO') return 1
  if (normalized === 'SPECIAL_ZONE') return 1.3
  if (normalized === 'KASHMIR') return 1.4
  return 1.1
}

const planMultiplier = (name: string) => {
  const normalized = name.trim().toLowerCase()
  if (normalized === 'premium') return 1
  if (normalized === 'basic') return 1.1
  return 1.05
}

async function ensureCourierCatalog() {
  for (const courier of catalog) {
    await db
      .insert(couriers)
      .values({
        id: courier.id,
        name: courier.name,
        serviceProvider: PROVIDER,
        businessType: ['b2c', 'b2b'],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [couriers.id, couriers.serviceProvider],
        set: {
          name: courier.name,
          businessType: ['b2c', 'b2b'],
          isEnabled: true,
          updatedAt: new Date(),
        },
      })
  }
}

async function ensureB2CRates() {
  const activePlans = await db
    .select({ id: plans.id, name: plans.name })
    .from(plans)
    .where(eq(plans.is_active, true))
  const b2cZones = await db
    .select({ id: zones.id, code: zones.code })
    .from(zones)
    .where(sql`lower(trim(${zones.business_type})) = 'b2c'`)

  let inserted = 0
  for (const courier of catalog) {
    for (const plan of activePlans) {
      for (const zone of b2cZones) {
        for (const type of ['forward', 'rto'] as const) {
          const [existing] = await db
            .select({ id: shippingRates.id })
            .from(shippingRates)
            .where(
              and(
                eq(shippingRates.plan_id, plan.id),
                eq(shippingRates.zone_id, zone.id),
                eq(shippingRates.courier_id, courier.id),
                eq(shippingRates.service_provider, PROVIDER),
                eq(shippingRates.business_type, 'b2c'),
                eq(shippingRates.mode, 'Surface'),
                eq(shippingRates.type, type),
              ),
            )
            .limit(1)
          if (existing) continue

          const typeMultiplier = type === 'rto' ? 0.9 : 1
          const base = courier.b2cBase * zoneMultiplier(zone.code) * planMultiplier(plan.name) * typeMultiplier
          const rateId = randomUUID()
          await db.insert(shippingRates).values({
            id: rateId,
            plan_id: plan.id,
            service_provider: PROVIDER,
            cod_charges: '40.00',
            cod_percent: '2.00',
            other_charges: '0.00',
            rate: money(base),
            courier_id: courier.id,
            courier_name: courier.name,
            mode: 'Surface',
            business_type: 'b2c',
            min_weight: '0.50',
            zone_id: zone.id,
            type,
          })
          await db.insert(shippingRateSlabs).values([
            { shipping_rate_id: rateId, weight_from: '0.000', weight_to: '0.500', rate: money(base) },
            { shipping_rate_id: rateId, weight_from: '0.500', weight_to: '1.000', rate: money(base * 1.6) },
            { shipping_rate_id: rateId, weight_from: '1.000', weight_to: '2.000', rate: money(base * 2.6) },
            { shipping_rate_id: rateId, weight_from: '2.000', weight_to: '5.000', rate: money(base * 5.2) },
            {
              shipping_rate_id: rateId,
              weight_from: '5.000',
              weight_to: null,
              rate: money(base * 5.2),
              extra_rate: money(base * 0.8),
              extra_weight_unit: '1.000',
            },
          ])
          if (type === 'forward') {
            await db.insert(shippingRateCodSlabs).values([
              {
                shipping_rate_id: rateId,
                amount_from: '0.00',
                amount_to: '2000.00',
                charge_type: 'flat',
                charge_value: '40.00',
              },
              {
                shipping_rate_id: rateId,
                amount_from: '2000.00',
                amount_to: null,
                charge_type: 'percent',
                charge_value: '2.00',
              },
            ])
          }
          inserted += 1
        }
      }
    }
  }
  return inserted
}

async function ensureB2BRates() {
  const activePlans = await db
    .select({ id: plans.id, name: plans.name })
    .from(plans)
    .where(eq(plans.is_active, true))
  const b2bZones = await db
    .select({ id: zones.id, code: zones.code })
    .from(zones)
    .where(sql`lower(trim(${zones.business_type})) = 'b2b'`)
  let inserted = 0

  for (const courier of catalog) {
    for (const plan of activePlans) {
      for (const origin of b2bZones) {
        for (const destination of b2bZones) {
          const [existing] = await db
            .select({ id: b2bZoneToZoneRates.id })
            .from(b2bZoneToZoneRates)
            .where(
              and(
                eq(b2bZoneToZoneRates.plan_id, plan.id),
                eq(b2bZoneToZoneRates.origin_zone_id, origin.id),
                eq(b2bZoneToZoneRates.destination_zone_id, destination.id),
                eq(b2bZoneToZoneRates.courier_id, courier.id),
                eq(b2bZoneToZoneRates.service_provider, PROVIDER),
                eq(b2bZoneToZoneRates.is_active, true),
              ),
            )
            .limit(1)
          if (existing) continue

          const isNorthEast =
            origin.code.toUpperCase().includes('NORTHEAST') ||
            destination.code.toUpperCase().includes('NORTHEAST')
          const laneMultiplier = origin.id === destination.id ? 0.85 : isNorthEast ? 1.35 : 1.15
          await db.insert(b2bZoneToZoneRates).values({
            plan_id: plan.id,
            origin_zone_id: origin.id,
            destination_zone_id: destination.id,
            courier_id: courier.id,
            service_provider: PROVIDER,
            rate_per_kg: money(
              courier.b2bPerKg * laneMultiplier * (plan.name.trim().toLowerCase() === 'premium' ? 1 : 1.1),
            ),
            volumetric_factor: '5000',
            effective_from: new Date(),
            is_active: true,
            metadata: { source: SOURCE, currency: 'INR', unit: 'kg' },
          })
          inserted += 1
        }
      }
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const courier of catalog) {
      await client.query(
        `
          INSERT INTO meracourierwala_b2b_zone_states
            (zone_id, state_name, courier_id, service_provider, created_at, updated_at)
          SELECT z.id, state_name, $1::integer, $2::varchar, now(), now()
          FROM meracourierwala_zones z
          CROSS JOIN LATERAL jsonb_array_elements_text(z.states) AS state_name
          WHERE lower(trim(z.business_type)) = 'b2b'
            AND NOT EXISTS (
              SELECT 1 FROM meracourierwala_b2b_zone_states current
              WHERE current.zone_id = z.id AND current.state_name = state_name
                AND current.courier_id = $1::integer AND current.service_provider = $2::varchar
            )
        `,
        [courier.id, PROVIDER],
      )
      await client.query(
        `
          INSERT INTO meracourierwala_b2b_additional_charges
            (plan_id, courier_id, service_provider, awb_charges, cft_factor,
             minimum_chargeable_amount, minimum_chargeable_weight, fuel_surcharge_percentage,
             oda_charges, oda_per_kg_charge, insurance_charge, cod_fixed_amount, cod_percentage,
             metadata, created_at, updated_at)
          SELECT p.id, $1::integer, $2::varchar, 40, 5, 200, 10, 10, 500, 5, 75, 50, 1,
            $3::jsonb, now(), now()
          FROM plans p
          WHERE p.is_active = true AND NOT EXISTS (
            SELECT 1 FROM meracourierwala_b2b_additional_charges current
            WHERE current.plan_id = p.id AND current.courier_id = $1::integer
              AND current.service_provider = $2::varchar
          )
        `,
        [courier.id, PROVIDER, JSON.stringify({ source: SOURCE })],
      )
      await client.query(
        `
          INSERT INTO meracourierwala_b2b_volumetric_rules
            (courier_id, service_provider, volumetric_divisor, cft_factor,
             minimum_volumetric_weight, metadata, created_at, updated_at)
          SELECT $1::integer, $2::varchar, 5000, 5, 1, $3::jsonb, now(), now()
          WHERE NOT EXISTS (
            SELECT 1 FROM meracourierwala_b2b_volumetric_rules
            WHERE courier_id = $1::integer AND service_provider = $2::varchar
          )
        `,
        [courier.id, PROVIDER, JSON.stringify({ source: SOURCE })],
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  return inserted
}

export async function ensureIThinkPricingCatalog() {
  await ensureCourierCatalog()
  const b2cInserted = await ensureB2CRates()
  const b2bInserted = await ensureB2BRates()
  console.log(
    `[iThink pricing] catalog ready; inserted ${b2cInserted} missing B2C cards and ${b2bInserted} B2B lanes`,
  )
}
