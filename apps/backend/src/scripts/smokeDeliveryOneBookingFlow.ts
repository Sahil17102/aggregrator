import { randomUUID } from 'crypto'
import { inArray } from 'drizzle-orm'
import { db, pool } from '../models/client'
import { plans } from '../models/schema/plans'
import { userPlans } from '../models/schema/userPlans'
import { users } from '../models/schema/users'
import { fetchAvailableCouriersWithRates } from '../models/services/shiprocket.service'
import { normalizeServiceProviderKey } from '../utils/courierProviders'

type SmokeCourier = {
  id?: number | string
  name?: string
  integration_type?: string | null
  serviceProvider?: string | null
  rate?: number | string | null
  provider_quote?: number | string | null
  is_bookable?: boolean | null
  final_courier_charge?: number | string | null
  localRates?: {
    forward?: {
      rate?: number | string | null
      cod_charges?: number | string | null
    }
  }
  approxZone?: {
    code?: string | null
    name?: string | null
  } | null
}

const money = (value: unknown) => Number(value ?? 0).toFixed(2)

async function getBasicPlanId() {
  const planRows = await db.select({ id: plans.id, name: plans.name }).from(plans)
  const basicPlan = planRows.find((plan) => plan.name?.trim().toLowerCase() === 'basic')
  return basicPlan?.id ?? null
}

async function createSmokeUser(planId: string) {
  const userId = randomUUID()
  await db.insert(users).values({
    id: userId,
    email: `delivery-one-booking-smoke-${Date.now()}-${userId.slice(0, 8)}@example.test`,
    emailVerified: true,
    accountVerified: true,
    role: 'customer',
  })

  await db.insert(userPlans).values({
    userId,
    plan_id: planId,
    is_active: true,
  })

  return userId
}

function assertDeliveryOneCourier(paymentType: 'prepaid' | 'cod', couriers: SmokeCourier[]) {
  const deliveryOne = couriers.find(
    (courier) =>
      Number(courier.id) === 99 &&
      normalizeServiceProviderKey(courier.integration_type || courier.serviceProvider) ===
        'deliveryone',
  )

  if (!deliveryOne) {
    throw new Error(`Delhivery Surface was not returned for ${paymentType} booking smoke.`)
  }

  if (deliveryOne.is_bookable === false) {
    throw new Error(`Delhivery Surface returned as unbookable for ${paymentType} booking smoke.`)
  }

  const localFreight = Number(deliveryOne.localRates?.forward?.rate ?? deliveryOne.rate ?? 0)
  const providerQuote = Number(deliveryOne.provider_quote ?? 0)
  const finalCharge = Number(deliveryOne.final_courier_charge ?? 0)

  if (!Number.isFinite(localFreight) || localFreight <= 0) {
    throw new Error(`Delhivery local freight was missing for ${paymentType} booking smoke.`)
  }

  if (!Number.isFinite(providerQuote) || providerQuote <= 0) {
    throw new Error(`Delhivery live provider quote was missing for ${paymentType} booking smoke.`)
  }

  if (!Number.isFinite(finalCharge) || finalCharge <= 0) {
    throw new Error(`Delhivery final courier charge was missing for ${paymentType} booking smoke.`)
  }

  return {
    id: Number(deliveryOne.id),
    name: deliveryOne.name,
    zone: deliveryOne.approxZone?.code || deliveryOne.approxZone?.name || 'unknown',
    localFreight,
    providerQuote,
    codCharge: Number(deliveryOne.localRates?.forward?.cod_charges ?? 0),
    finalCharge,
  }
}

async function quoteFor(userId: string, paymentType: 'prepaid' | 'cod') {
  return fetchAvailableCouriersWithRates(
    {
      origin: 190001,
      destination: 110042,
      payment_type: paymentType,
      order_amount: 10,
      cod_charge_basis: paymentType === 'cod' ? 10 : 0,
      shipment_type: 'b2c',
      weight: 500,
      length: 10,
      breadth: 10,
      height: 10,
    } as any,
    userId,
  )
}

async function main() {
  const planId = await getBasicPlanId()
  if (!planId) {
    throw new Error('Basic plan is required before running Delhivery booking smoke.')
  }

  const userId = await createSmokeUser(planId)
  try {
    const prepaidResults = await quoteFor(userId, 'prepaid')
    const codResults = await quoteFor(userId, 'cod')
    const prepaid = assertDeliveryOneCourier('prepaid', Array.isArray(prepaidResults) ? prepaidResults : [])
    const cod = assertDeliveryOneCourier('cod', Array.isArray(codResults) ? codResults : [])

    console.log(
      JSON.stringify(
        {
          ok: true,
          message:
            'Delhivery booking courier lookup passed for a live Rs 10 test order without creating a shipment.',
          route: {
            origin: 190001,
            destination: 110042,
            weight_g: 500,
          },
          prepaid: {
            courier_id: prepaid.id,
            courier: prepaid.name,
            zone: prepaid.zone,
            local_freight: money(prepaid.localFreight),
            provider_quote: money(prepaid.providerQuote),
            final_charge: money(prepaid.finalCharge),
          },
          cod: {
            courier_id: cod.id,
            courier: cod.name,
            zone: cod.zone,
            local_freight: money(cod.localFreight),
            cod_charge: money(cod.codCharge),
            provider_quote: money(cod.providerQuote),
            final_charge: money(cod.finalCharge),
          },
        },
        null,
        2,
      ),
    )
  } finally {
    await db.delete(users).where(inArray(users.id, [userId]))
    await pool.end()
  }
}

main().catch(async (error) => {
  console.error('Delhivery booking smoke failed:', error)
  await pool.end()
  process.exit(1)
})
