import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
import path from 'path'

// Determine environment
const env = process.env.NODE_ENV || 'development'

// Load backend env files when this module is used directly from scripts/tests.
const backendRoot = path.resolve(__dirname, '../..')
dotenv.config({ path: path.resolve(backendRoot, `.env.${env}`) })
dotenv.config({ path: path.resolve(backendRoot, '.env') })

const normalizeR2Endpoint = (value: string | undefined) => {
  const endpoint = value?.trim()
  if (!endpoint) return endpoint

  try {
    const url = new URL(endpoint)
    if (url.hostname.endsWith('.r2.cloudflarestorage.com')) {
      url.pathname = '/'
      url.search = ''
      url.hash = ''
      return url.toString().replace(/\/$/, '')
    }
    return endpoint.replace(/\/$/, '')
  } catch {
    return endpoint.replace(/\/$/, '')
  }
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: normalizeR2Endpoint(process.env.R2_ENDPOINT),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const downloadR2ObjectAsBuffer = async (bucket: string, key: string): Promise<Buffer> => {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
  const res = await r2.send(cmd)
  const chunks: Uint8Array[] = []
  for await (const chunk of res.Body as any) chunks.push(chunk)
  return Buffer.concat(chunks)
}
