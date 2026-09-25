import { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../models/client'
import { courier_credentials } from '../../models/schema/courierCredentials'
import { checkShadowfaxServiceability, DEFAULT_SHADOWFAX_API_BASE } from '../../models/services/couriers/shadowfax.service'

const clean = (value: unknown) => String(value ?? '').trim()
const mask = (value: string) => value ? `${value.slice(0, 4)}${'*'.repeat(Math.max(4, value.length - 8))}${value.slice(-4)}` : ''

export const getShadowfaxCredentialsController = async (_req: Request, res: Response) => {
  const [saved] = await db.select().from(courier_credentials).where(eq(courier_credentials.provider, 'shadowfax')).limit(1)
  const token = clean(saved?.apiKey || process.env.SHADOWFAX_API_TOKEN)
  res.json({ success: true, data: {
    provider: 'shadowfax',
    apiBase: clean(saved?.apiBase || process.env.SHADOWFAX_API_BASE || DEFAULT_SHADOWFAX_API_BASE),
    configured: Boolean(token),
    tokenMasked: mask(token),
  } })
}

export const updateShadowfaxCredentialsController = async (req: Request, res: Response) => {
  const [saved] = await db.select().from(courier_credentials).where(eq(courier_credentials.provider, 'shadowfax')).limit(1)
  const apiBase = clean(req.body?.apiBase || saved?.apiBase || process.env.SHADOWFAX_API_BASE || DEFAULT_SHADOWFAX_API_BASE).replace(/\/+$/, '')
  const token = clean(req.body?.token || req.body?.apiToken || saved?.apiKey || process.env.SHADOWFAX_API_TOKEN)
  if (!token) return res.status(400).json({ success: false, message: 'Shadowfax API token is required' })
  await db.insert(courier_credentials).values({ provider: 'shadowfax', apiBase, apiKey: token }).onConflictDoUpdate({
    target: courier_credentials.provider,
    set: { apiBase, apiKey: token, updatedAt: new Date() },
  })
  res.json({ success: true, data: { provider: 'shadowfax', apiBase, configured: true, tokenMasked: mask(token) } })
}

export const testShadowfaxCredentialsController = async (_req: Request, res: Response) => {
  try {
    const data = await checkShadowfaxServiceability(['110001'])
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(Number(error?.statusCode || error?.response?.status || 500)).json({ success: false, message: error?.message || 'Shadowfax authentication failed' })
  }
}
