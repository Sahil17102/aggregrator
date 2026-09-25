import { and, eq, sql } from 'drizzle-orm'
import { db } from '../client'
import { couriers } from '../schema/couriers'
import { plans } from '../schema/plans'
import { shippingRates } from '../schema/shippingRates'
import { b2bZoneToZoneRates, zones } from '../schema/zones'

const SHADOWFAX_COURIER_ID = 4
const SHADOWFAX_PROVIDER = 'shadowfax'
const DEFAULT_FORWARD_RATES: Record<string, number> = {
  A: 23.6,
  B: 27.2,
  C: 32.7,
  D: 34.5,
  E: 38.1,
  WITHIN_CITY: 23.6,
  'WITHIN CITY': 23.6,
  WITHIN_STATE: 27.2,
  'WITHIN STATE': 27.2,
  WITHIN_REGION: 32.7,
  'WITHIN REGION': 32.7,
  METRO_TO_METRO: 34.5,
  'METRO TO METRO': 34.5,
  ROI: 38.1,
  SPECIAL: 38.1,
  SPECIAL_ZONE: 38.1,
  'SPECIAL ZONE': 38.1,
  KASHMIR: 38.1,
}

/**
 * Keeps the direct Shadowfax integration selectable in B2C checkout.
 * Existing/admin-managed rates are never overwritten; defaults are inserted only
 * for plan/zone combinations that do not already have a Shadowfax forward rate.
 */
export const ensureShadowfaxCourierCatalog = async () => {
  await db
    .insert(couriers)
    .values({
      id: SHADOWFAX_COURIER_ID,
      name: 'Shadowfax Surface',
      serviceProvider: SHADOWFAX_PROVIDER,
      isEnabled: true,
      businessType: ['b2c', 'b2b'],
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [couriers.id, couriers.serviceProvider],
      set: {
        name: 'Shadowfax Surface',
        isEnabled: true,
        businessType: ['b2c', 'b2b'],
        updatedAt: new Date(),
      },
    })

  const [planRows, zoneRows] = await Promise.all([
    db.select({ id: plans.id }).from(plans).where(eq(plans.is_active, true)),
    db
      .select({ id: zones.id, code: zones.code })
      .from(zones)
      .where(sql`lower(${zones.business_type}) = 'b2c'`),
  ])

  let inserted = 0
  for (const plan of planRows) {
    for (const zone of zoneRows) {
      const code = String(zone.code || '').trim().toUpperCase().replace(/^ZONE\s+/, '')
      const rate = DEFAULT_FORWARD_RATES[code]
      if (rate == null) continue

      const existing = await db
        .select({ id: shippingRates.id })
        .from(shippingRates)
        .where(
          and(
            eq(shippingRates.plan_id, plan.id),
            eq(shippingRates.zone_id, zone.id),
            eq(shippingRates.courier_id, SHADOWFAX_COURIER_ID),
            eq(shippingRates.service_provider, SHADOWFAX_PROVIDER),
            eq(shippingRates.business_type, 'b2c'),
            eq(shippingRates.type, 'forward'),
          ),
        )
        .limit(1)
      if (existing.length) continue

      await db.insert(shippingRates).values({
        plan_id: plan.id,
        service_provider: SHADOWFAX_PROVIDER,
        cod_charges: '32.70',
        cod_percent: '1.80',
        other_charges: '0.00',
        rate: rate.toFixed(2),
        courier_id: SHADOWFAX_COURIER_ID,
        courier_name: 'Shadowfax Surface',
        mode: 'Surface',
        business_type: 'b2c',
        min_weight: '1.00',
        zone_id: zone.id,
        type: 'forward',
      })
      inserted += 1
    }
  }

  console.log('[Shadowfax] Courier catalog ready', {
    plans: planRows.length,
    zones: zoneRows.length,
    insertedRates: inserted,
  })

  const b2bZones = await db
    .select({ id: zones.id })
    .from(zones)
    .where(sql`lower(${zones.business_type}) = 'b2b'`)
  let insertedB2BRates = 0
  for (const plan of planRows) {
    for (const origin of b2bZones) {
      for (const destination of b2bZones) {
        const existing = await db
          .select({ id: b2bZoneToZoneRates.id })
          .from(b2bZoneToZoneRates)
          .where(
            and(
              eq(b2bZoneToZoneRates.plan_id, plan.id),
              eq(b2bZoneToZoneRates.origin_zone_id, origin.id),
              eq(b2bZoneToZoneRates.destination_zone_id, destination.id),
              eq(b2bZoneToZoneRates.courier_id, SHADOWFAX_COURIER_ID),
              eq(b2bZoneToZoneRates.service_provider, SHADOWFAX_PROVIDER),
            ),
          )
          .limit(1)
        if (existing.length) continue

        await db.insert(b2bZoneToZoneRates).values({
          plan_id: plan.id,
          origin_zone_id: origin.id,
          destination_zone_id: destination.id,
          courier_id: SHADOWFAX_COURIER_ID,
          service_provider: SHADOWFAX_PROVIDER,
          rate_per_kg: '56.30',
          volumetric_factor: '5000',
          is_active: true,
          metadata: { demo: true, source: 'shadowfax-demo-rate-card' },
        })
        insertedB2BRates += 1
      }
    }
  }
  console.log('[Shadowfax] B2B demo rate matrix ready', {
    plans: planRows.length,
    zones: b2bZones.length,
    insertedRates: insertedB2BRates,
  })
}
