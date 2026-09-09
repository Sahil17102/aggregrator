import axios from 'axios'
import { eq } from 'drizzle-orm'
import { db } from '../../client'
import { courier_credentials } from '../../schema/courierCredentials'
import { couriers } from '../../schema/couriers'

const SHIPWAY_PROVIDER = 'shipway'
export const DEFAULT_SHIPWAY_API_BASE = 'https://app.shipway.com/api'

export type ShipwayCredentialInput = {
  apiBase?: string
  api_base?: string
  baseUrl?: string
  email?: string
  username?: string
  shipwayEmail?: string
  licenseKey?: string
  license_key?: string
  apiKey?: string
  api_key?: string
  apiToken?: string
  api_token?: string
  token?: string
  password?: string
}

type ShipwayConfig = {
  apiBase: string
  username: string
  password: string
}

type ShipwayCarrier = {
  id: number
  name: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const readSavedCredentials = async () => {
  const [saved] = await db
    .select({
      apiBase: courier_credentials.apiBase,
      username: courier_credentials.username,
      password: courier_credentials.password,
    })
    .from(courier_credentials)
    .where(eq(courier_credentials.provider, SHIPWAY_PROVIDER))
    .limit(1)

  return saved
}

const resolveConfig = async (input: ShipwayCredentialInput = {}): Promise<ShipwayConfig> => {
  const saved = await readSavedCredentials()
  const apiBase = clean(input.apiBase || input.api_base || input.baseUrl || saved?.apiBase)
    .replace(/\/+$/, '')
  const username = clean(input.email || input.username || input.shipwayEmail || saved?.username)
  const password = clean(
    input.licenseKey ||
      input.license_key ||
      input.apiKey ||
      input.api_key ||
      input.apiToken ||
      input.api_token ||
      input.token ||
      input.password ||
      saved?.password,
  )

  if (!username || !password) {
    throw new Error('Shipway email and license key are required')
  }

  return {
    apiBase: apiBase || DEFAULT_SHIPWAY_API_BASE,
    username,
    password,
  }
}

const fetchCarriers = async (config: ShipwayConfig): Promise<ShipwayCarrier[]> => {
  const response = await axios.get(`${config.apiBase}/getcarrier`, {
    auth: { username: config.username, password: config.password },
    headers: { Accept: 'application/json' },
    // Shipway's carrier catalog can take more than 20 seconds on a cold request.
    timeout: 60000,
  })
  const payload = response.data
  const rawCarriers = Array.isArray(payload?.message)
    ? payload.message
    : Array.isArray(payload?.data)
      ? payload.data
      : []
  const carriers = rawCarriers
    .map((carrier: any) => ({
      id: Number(carrier?.id ?? carrier?.carrier_id),
      name: clean(carrier?.carrier_title || carrier?.name || carrier?.carrier_name),
    }))
    .filter((carrier: ShipwayCarrier) => Number.isInteger(carrier.id) && carrier.name)

  if (!carriers.length) {
    const message = clean(payload?.error || payload?.message) || 'Shipway returned no active carriers'
    throw new Error(message)
  }

  return carriers
}

const syncCarriers = async (carriers: ShipwayCarrier[]) => {
  for (const carrier of carriers) {
    await db
      .insert(couriers)
      .values({
        id: carrier.id,
        name: carrier.name,
        serviceProvider: SHIPWAY_PROVIDER,
        isEnabled: true,
        businessType: ['b2c'],
      })
      .onConflictDoUpdate({
        target: [couriers.id, couriers.serviceProvider],
        set: {
          name: carrier.name,
          businessType: ['b2c'],
          updatedAt: new Date(),
        },
      })
  }
}

export const saveShipwayCredentials = async (input: ShipwayCredentialInput) => {
  const config = await resolveConfig(input)
  const carriers = await fetchCarriers(config)

  await db
    .insert(courier_credentials)
    .values({
      provider: SHIPWAY_PROVIDER,
      apiBase: config.apiBase,
      username: config.username,
      password: config.password,
    })
    .onConflictDoUpdate({
      target: courier_credentials.provider,
      set: {
        apiBase: config.apiBase,
        username: config.username,
        password: config.password,
        updatedAt: new Date(),
      },
    })

  await syncCarriers(carriers)
  return { config, carriers }
}

export const verifyAndSyncShipwayCredentials = async (input: ShipwayCredentialInput = {}) => {
  const config = await resolveConfig(input)
  const carriers = await fetchCarriers(config)
  await syncCarriers(carriers)
  return { config, carriers }
}
