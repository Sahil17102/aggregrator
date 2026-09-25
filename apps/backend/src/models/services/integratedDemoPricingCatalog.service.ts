import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../client'
import { couriers } from '../schema/couriers'
import { plans } from '../schema/plans'
import { shippingRateCodSlabs, shippingRates, shippingRateSlabs } from '../schema/shippingRates'
import { b2bZoneToZoneRates, zones } from '../schema/zones'

const PROVIDERS = ['deliveryone', 'shipway', 'shadowfax', 'ithink'] as const
const SOURCE = 'integrated-provider-demo-rates-v1'
const money = (value: number) => (Math.round(value * 100) / 100).toFixed(2)
const chunks = <T>(values: T[], size = 250) => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}
const stableBase = (provider: string, courierId: number, name: string) => {
  const providerBase: Record<string, number> = { deliveryone: 42, shipway: 48, shadowfax: 38, ithink: 44 }
  const nameScore = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return (providerBase[provider] || 45) + ((Math.abs(courierId) + nameScore) % 17)
}
const zoneFactor = (code: string) => {
  const value = code.trim().toUpperCase()
  if (value === 'WITHIN_CITY') return 0.82
  if (value === 'WITHIN_STATE') return 0.9
  if (value === 'WITHIN_REGION') return 0.98
  if (value === 'METRO_TO_METRO') return 1.05
  if (value === 'KASHMIR' || value === 'SPECIAL_ZONE') return 1.35
  return 1.15
}
const planFactor = (name: string) => name.trim().toLowerCase() === 'premium' ? 1 : 1.08

export async function ensureIntegratedDemoPricingCatalog() {
  const [activePlans, b2cZones, b2bZones, integratedCouriers] = await Promise.all([
    db.select({ id: plans.id, name: plans.name }).from(plans).where(eq(plans.is_active, true)),
    db.select({ id: zones.id, code: zones.code }).from(zones).where(sql`lower(trim(${zones.business_type})) = 'b2c'`),
    db.select({ id: zones.id, code: zones.code }).from(zones).where(sql`lower(trim(${zones.business_type})) = 'b2b'`),
    db.select({ id: couriers.id, name: couriers.name, provider: couriers.serviceProvider }).from(couriers).where(and(eq(couriers.isEnabled, true), inArray(couriers.serviceProvider, [...PROVIDERS]))),
  ])

  const existingB2C = await db.select({
    courierId: shippingRates.courier_id,
    provider: shippingRates.service_provider,
    planId: shippingRates.plan_id,
    zoneId: shippingRates.zone_id,
    type: shippingRates.type,
  }).from(shippingRates).where(and(eq(shippingRates.business_type, 'b2c'), inArray(shippingRates.service_provider, [...PROVIDERS])))
  const b2cKeys = new Set(existingB2C.map((row) => `${row.provider}|${row.courierId}|${row.planId}|${row.zoneId}|${row.type}`))
  const missingB2C: Array<typeof shippingRates.$inferInsert> = []
  for (const courier of integratedCouriers) for (const plan of activePlans) for (const zone of b2cZones) for (const type of ['forward', 'rto'] as const) {
    const key = `${courier.provider}|${courier.id}|${plan.id}|${zone.id}|${type}`
    if (b2cKeys.has(key)) continue
    const base = stableBase(courier.provider, courier.id, courier.name) * zoneFactor(zone.code) * planFactor(plan.name)
    missingB2C.push({
      plan_id: plan.id, zone_id: zone.id, courier_id: courier.id, courier_name: courier.name,
      service_provider: courier.provider, business_type: 'b2c', mode: /air|express/i.test(courier.name) ? 'Air' : 'Surface',
      type, min_weight: '0.00', rate: money(base * (type === 'rto' ? 0.9 : 1)),
      cod_charges: '40.00', cod_percent: '2.00', other_charges: '0.00',
    })
  }

  let b2cInserted = 0
  for (const batch of chunks(missingB2C, 150)) {
    const inserted = await db.insert(shippingRates).values(batch).returning({ id: shippingRates.id, rate: shippingRates.rate, type: shippingRates.type })
    b2cInserted += inserted.length
    const slabRows = inserted.flatMap((rate) => {
      const base = Number(rate.rate)
      return [
        { weight_from: '0.000', weight_to: '0.500', rate: money(base), extra_rate: money(base), extra_weight_unit: '0.500' },
        { weight_from: '0.500', weight_to: '1.000', rate: money(base * 1.7), extra_rate: money(base * 0.75), extra_weight_unit: '0.500' },
        { weight_from: '1.000', weight_to: '2.000', rate: money(base * 2.5), extra_rate: money(base * 0.7), extra_weight_unit: '0.500' },
        { weight_from: '2.000', weight_to: '5.000', rate: money(base * 4.2), extra_rate: money(base * 0.65), extra_weight_unit: '0.500' },
        { weight_from: '5.000', weight_to: null, rate: money(base * 7), extra_rate: money(base * 0.6), extra_weight_unit: '0.500' },
      ].map((slab) => ({ ...slab, shipping_rate_id: rate.id }))
    })
    for (const slabBatch of chunks(slabRows, 500)) await db.insert(shippingRateSlabs).values(slabBatch)
    const codRows = inserted.filter((rate) => rate.type === 'forward').flatMap((rate) => [
      { shipping_rate_id: rate.id, amount_from: '0.00', amount_to: '2000.00', charge_type: 'flat', charge_value: '40.00' },
      { shipping_rate_id: rate.id, amount_from: '2000.00', amount_to: null, charge_type: 'percent', charge_value: '2.00' },
    ])
    if (codRows.length) await db.insert(shippingRateCodSlabs).values(codRows)
  }

  const existingB2B = await db.select({
    courierId: b2bZoneToZoneRates.courier_id, provider: b2bZoneToZoneRates.service_provider,
    planId: b2bZoneToZoneRates.plan_id, originId: b2bZoneToZoneRates.origin_zone_id,
    destinationId: b2bZoneToZoneRates.destination_zone_id,
  }).from(b2bZoneToZoneRates).where(and(eq(b2bZoneToZoneRates.is_active, true), inArray(b2bZoneToZoneRates.service_provider, [...PROVIDERS])))
  const b2bKeys = new Set(existingB2B.map((row) => `${row.provider}|${row.courierId}|${row.planId}|${row.originId}|${row.destinationId}`))
  const missingB2B: Array<typeof b2bZoneToZoneRates.$inferInsert> = []
  for (const courier of integratedCouriers) for (const plan of activePlans) for (const origin of b2bZones) for (const destination of b2bZones) {
    const key = `${courier.provider}|${courier.id}|${plan.id}|${origin.id}|${destination.id}`
    if (b2bKeys.has(key)) continue
    const base = stableBase(courier.provider, courier.id, courier.name) * 0.45
    const northeast = origin.code.toUpperCase().includes('NORTHEAST') || destination.code.toUpperCase().includes('NORTHEAST')
    const lane = origin.id === destination.id ? 0.85 : northeast ? 1.35 : 1.15
    missingB2B.push({
      plan_id: plan.id, origin_zone_id: origin.id, destination_zone_id: destination.id,
      courier_id: courier.id, service_provider: courier.provider, rate_per_kg: money(base * lane * planFactor(plan.name)),
      volumetric_factor: '5000', effective_from: new Date(), is_active: true,
      metadata: { demo: true, source: SOURCE, provider: courier.provider, courier: courier.name },
    })
  }
  let b2bInserted = 0
  for (const batch of chunks(missingB2B, 500)) {
    const inserted = await db.insert(b2bZoneToZoneRates).values(batch).returning({ id: b2bZoneToZoneRates.id })
    b2bInserted += inserted.length
  }
  console.log(`[Integrated demo pricing] inserted ${b2cInserted} B2C cards and ${b2bInserted} B2B lanes`)
}
