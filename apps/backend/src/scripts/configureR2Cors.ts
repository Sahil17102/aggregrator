import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  type CORSRule,
} from '@aws-sdk/client-s3'
import { r2 } from '../config/r2Client'
import { getBucketName } from '../utils/functions'

const managedOrigins = [
  'https://ship.truetransitmobility.com',
  'https://admin.ship.truetransitmobility.com',
]

const run = async () => {
  const bucket = getBucketName()
  let existingRules: CORSRule[] = []

  try {
    const current = await r2.send(new GetBucketCorsCommand({ Bucket: bucket }))
    existingRules = current.CORSRules || []
  } catch (error: any) {
    const missingConfiguration =
      error?.name === 'NoSuchCORSConfiguration' ||
      error?.Code === 'NoSuchCORSConfiguration' ||
      error?.$metadata?.httpStatusCode === 404

    if (!missingConfiguration) throw error
  }

  const preservedRules = existingRules.filter(
    (rule) => !rule.AllowedOrigins?.some((origin) => managedOrigins.includes(origin)),
  )
  const managedRule: CORSRule = {
    AllowedOrigins: managedOrigins,
    AllowedMethods: ['GET', 'PUT', 'HEAD'],
    AllowedHeaders: ['*'],
    ExposeHeaders: ['ETag'],
    MaxAgeSeconds: 3600,
  }

  await r2.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: { CORSRules: [...preservedRules, managedRule] },
    }),
  )

  const updated = await r2.send(new GetBucketCorsCommand({ Bucket: bucket }))
  const applied = updated.CORSRules?.some((rule) =>
    managedOrigins.every((origin) => rule.AllowedOrigins?.includes(origin)),
  )

  if (!applied) throw new Error('R2 CORS verification failed after update')
  console.log(`R2 CORS configured for ${managedOrigins.join(', ')}`)
}

run().catch((error) => {
  console.error('R2 CORS configuration failed:', error?.message || error)
  process.exit(1)
})
