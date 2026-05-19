import { sql } from 'drizzle-orm'
import { db } from '../client'
import { couriers } from '../schema/couriers'
import { DELHIVERY_COURIER_IDS } from '../../utils/delhiveryCourier'

export const DELIVERY_ONE_SERVICE_PROVIDER = 'deliveryone'

export const DELIVERY_ONE_COURIER_CATALOG = [
  {
    id: DELHIVERY_COURIER_IDS.SURFACE,
    name: 'Delivery One Surface',
    shippingMode: 'Surface',
  },
  {
    id: DELHIVERY_COURIER_IDS.EXPRESS,
    name: 'Delivery One Express',
    shippingMode: 'Express',
  },
] as const

export const ensureDeliveryOneCouriers = async () => {
  const businessType: ('b2c' | 'b2b')[] = ['b2c']

  await db
    .insert(couriers)
    .values(
      DELIVERY_ONE_COURIER_CATALOG.map((courier) => ({
        id: courier.id,
        name: courier.name,
        serviceProvider: DELIVERY_ONE_SERVICE_PROVIDER,
        businessType,
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: [couriers.id, couriers.serviceProvider],
      set: {
        name: sql`excluded.name`,
        businessType,
        isEnabled: true,
        updatedAt: new Date(),
      },
    })
}
