import axios from 'axios'

process.env.DATABASE_URL ||= 'postgresql://verify:verify@127.0.0.1:5432/verify'

const originalPost = axios.post
const calls: Array<{ url: string; body: any; config: any }> = []

;(axios as any).post = async (url: string, body: any, config: any) => {
  calls.push({ url, body, config })
  return { data: { ok: true, url } }
}

const fail = (message: string): never => {
  throw new Error(message)
}

const run = async () => {
  const { ITHINK_OPERATIONS, IThinkService } = await import(
    '../models/services/couriers/ithink.service'
  )
  const service = new IThinkService({
    apiBase: 'https://ithink.verify.local/api_v3/',
    accessToken: 'test-access-token',
    secretKey: 'test-secret-key',
  })

  for (const operation of Object.keys(ITHINK_OPERATIONS) as Array<keyof typeof ITHINK_OPERATIONS>) {
    const result = await service.call(operation, { marker: operation })
    if (!result?.ok) fail(`${operation} did not return the mocked response`)
  }

  if (calls.length !== Object.keys(ITHINK_OPERATIONS).length) {
    fail(`Expected ${Object.keys(ITHINK_OPERATIONS).length} calls, received ${calls.length}`)
  }

  calls.forEach((call, index) => {
    const operation = Object.keys(ITHINK_OPERATIONS)[index] as keyof typeof ITHINK_OPERATIONS
    const expectedUrl = `https://ithink.verify.local/api_v3${ITHINK_OPERATIONS[operation]}`
    if (call.url !== expectedUrl) fail(`${operation} URL mismatch: ${call.url}`)
    if (call.body?.data?.access_token !== 'test-access-token') {
      fail(`${operation} did not include access_token in the data envelope`)
    }
    if (call.body?.data?.secret_key !== 'test-secret-key') {
      fail(`${operation} did not include secret_key in the data envelope`)
    }
    if (call.body?.data?.marker !== operation) fail(`${operation} payload was not preserved`)
    if (call.config?.headers?.['Content-Type'] !== 'application/json') {
      fail(`${operation} content type mismatch`)
    }
  })

  let limitRejected = false
  try {
    await service.syncOrder({ shipments: Array.from({ length: 26 }, () => ({})) })
  } catch (error: any) {
    limitRejected = error?.statusCode === 400
  }
  if (!limitRejected) fail('Sync Order limit validation did not reject 26 shipments')

  console.log(`iThink API contract verification passed for ${calls.length} operations.`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => {
    ;(axios as any).post = originalPost
  })
