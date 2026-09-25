import { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../models/client'
import { courier_credentials } from '../../models/schema/courierCredentials'
import {
  DEFAULT_ITHINK_API_BASE,
  ITHINK_OPERATIONS,
  IThinkOperation,
  IThinkService,
  maskIThinkSecret,
  saveIThinkCredentials,
} from '../../models/services/couriers/ithink.service'

const errorResponse = (res: Response, error: any, fallback: string) =>
  res.status(Number(error?.statusCode || error?.response?.status || 500)).json({
    success: false,
    message: error?.message || fallback,
    ...(error?.upstream === undefined ? {} : { upstream: error.upstream }),
  })

export const getIThinkCredentialsController = async (_req: Request, res: Response) => {
  try {
    const [saved] = await db
      .select({
        apiBase: courier_credentials.apiBase,
        accessToken: courier_credentials.apiKey,
        secretKey: courier_credentials.password,
        pickupAddressId: courier_credentials.clientId,
      })
      .from(courier_credentials)
      .where(eq(courier_credentials.provider, 'ithink'))
      .limit(1)
    res.json({
      success: true,
      data: {
        provider: 'ithink',
        apiBase: saved?.apiBase || DEFAULT_ITHINK_API_BASE,
        configured: Boolean(saved?.accessToken?.trim() && saved?.secretKey?.trim()),
        accessTokenMasked: maskIThinkSecret(saved?.accessToken),
        secretKeyMasked: maskIThinkSecret(saved?.secretKey),
        pickupAddressId: saved?.pickupAddressId || '',
      },
    })
  } catch (error) {
    return errorResponse(res, error, 'Failed to fetch iThink credentials')
  }
}

export const updateIThinkCredentialsController = async (req: Request, res: Response) => {
  try {
    const saved = await saveIThinkCredentials(req.body || {})
    res.json({
      success: true,
      message: 'iThink Logistics credentials saved successfully',
      data: {
        provider: 'ithink',
        apiBase: saved.apiBase,
        configured: true,
        accessTokenMasked: maskIThinkSecret(saved.accessToken),
        secretKeyMasked: maskIThinkSecret(saved.secretKey),
        pickupAddressId: saved.pickupAddressId,
      },
    })
  } catch (error) {
    return errorResponse(res, error, 'Failed to save iThink credentials')
  }
}

export const testIThinkCredentialsController = async (req: Request, res: Response) => {
  try {
    const service = new IThinkService(req.body || {})
    const result = await service.getWarehouse({})
    res.json({ success: true, message: 'iThink Logistics credentials are valid', data: result })
  } catch (error) {
    return errorResponse(res, error, 'iThink credential verification failed')
  }
}

export const callIThinkOperationController = async (req: Request, res: Response) => {
  const operation = String(req.params.operation || '') as IThinkOperation
  if (!Object.prototype.hasOwnProperty.call(ITHINK_OPERATIONS, operation)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported iThink operation. Allowed operations: ${Object.keys(ITHINK_OPERATIONS).join(', ')}`,
    })
  }

  try {
    const result = await new IThinkService().call(operation, req.body?.data || req.body || {})
    res.json({ success: true, data: result })
  } catch (error) {
    return errorResponse(res, error, `iThink ${operation} request failed`)
  }
}
