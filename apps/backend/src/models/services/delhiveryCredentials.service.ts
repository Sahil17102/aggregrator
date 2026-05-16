import { eq } from 'drizzle-orm'
import { db } from '../client'
import { courier_credentials } from '../schema/courierCredentials'

const DEFAULT_DELHIVERY_API_BASE = 'https://track.delhivery.com'

export interface DelhiveryCredentials {
  apiBase: string
  clientName: string
  apiKey: string
}

const normalize = (value?: string | null) => String(value || '').trim()

export const getDelhiveryCredentials = async (): Promise<DelhiveryCredentials> => {
  const fromEnv = (): DelhiveryCredentials => ({
    apiBase:
      normalize(process.env.DELHIVERY_API_BASE) ||
      normalize(process.env.DELIVERY_ONE_API_BASE) ||
      normalize(process.env.DELIVERYONE_API_BASE) ||
      DEFAULT_DELHIVERY_API_BASE,
    clientName: normalize(process.env.DELHIVERY_CLIENT_NAME),
    apiKey:
      normalize(process.env.DELHIVERY_API_KEY) ||
      normalize(process.env.DELIVERY_ONE_API_KEY) ||
      normalize(process.env.DELIVERYONE_API_KEY),
  })

  const envCredentials = fromEnv()

  try {
    const [credentials] = await db
      .select({
        apiBase: courier_credentials.apiBase,
        clientName: courier_credentials.clientName,
        apiKey: courier_credentials.apiKey,
      })
      .from(courier_credentials)
      .where(eq(courier_credentials.provider, 'delhivery'))
      .limit(1)

    if (normalize(credentials?.apiKey)) {
      return {
        apiBase: normalize(credentials?.apiBase) || envCredentials.apiBase,
        clientName: normalize(credentials?.clientName) || envCredentials.clientName,
        apiKey: normalize(credentials?.apiKey),
      }
    }

    const [deliveryOneCredentials] = await db
      .select({
        apiBase: courier_credentials.apiBase,
        clientName: courier_credentials.clientName,
        apiKey: courier_credentials.apiKey,
      })
      .from(courier_credentials)
      .where(eq(courier_credentials.provider, 'deliveryone'))
      .limit(1)

    if (normalize(deliveryOneCredentials?.apiKey)) {
      return {
        apiBase: normalize(deliveryOneCredentials?.apiBase) || envCredentials.apiBase,
        clientName: normalize(credentials?.clientName) || envCredentials.clientName,
        apiKey: normalize(deliveryOneCredentials?.apiKey),
      }
    }
  } catch (err: any) {
    if (
      !(
        err?.message?.includes('does not exist') ||
        err?.message?.includes('relation') ||
        err?.code === '42P01'
      )
    ) {
      throw err
    }
  }

  return {
    apiBase: envCredentials.apiBase,
    clientName: envCredentials.clientName,
    apiKey: envCredentials.apiKey,
  }
}
