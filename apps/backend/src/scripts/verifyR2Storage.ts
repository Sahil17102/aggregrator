import assert from 'node:assert/strict'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import { r2 } from '../config/r2Client'
import {
  uploadBufferToR2,
  presignDownload,
  presignUpload,
} from '../models/services/upload.service'
import { getBucketName } from '../utils/functions'

const run = async () => {
  const marker = `truetransit-r2-check-${Date.now()}`
  const prefix = process.env.R2_KEY_PREFIX?.replace(/^\/+|\/+$/g, '')
  const uploadedKeys: string[] = []

  try {
    const uploaded = await uploadBufferToR2({
      buffer: Buffer.from(marker, 'utf8'),
      filename: `${marker}.txt`,
      contentType: 'text/plain; charset=utf-8',
      userId: 'system',
      folderKey: 'deployment-checks',
    })
    uploadedKeys.push(uploaded.key)

    if (prefix) {
      assert.ok(uploaded.key.startsWith(`${prefix}/`), `Object key must use ${prefix}/`)
    }

    const signed = await presignDownload(uploaded.key)
    assert.equal(typeof signed, 'string', 'Expected a presigned download URL')

    const response = await axios.get<string>(signed as string, { responseType: 'text' })
    assert.equal(response.data, marker, 'Downloaded R2 object did not match the upload')

    const browserUpload = await presignUpload({
      filename: `${marker}-browser.txt`,
      contentType: 'text/plain; charset=utf-8',
      userId: 'system',
      folderKey: 'deployment-checks',
    })
    uploadedKeys.push(browserUpload.key)

    const preflight = await axios.options(browserUpload.uploadUrl, {
      headers: {
        Origin: 'https://ship.truetransitmobility.com',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      },
    })
    assert.equal(
      preflight.headers['access-control-allow-origin'],
      'https://ship.truetransitmobility.com',
      'R2 CORS did not allow the seller panel origin',
    )

    await axios.put(browserUpload.uploadUrl, marker, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
    const browserSigned = await presignDownload(browserUpload.key)
    const browserResponse = await axios.get<string>(browserSigned as string, {
      responseType: 'text',
    })
    assert.equal(browserResponse.data, marker, 'Presigned browser upload did not round-trip')

    console.log(`R2 storage checks passed for ${uploaded.bucket}/${prefix || ''}`)
  } finally {
    for (const key of uploadedKeys) {
      await r2.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }))
    }
  }
}

run().catch((error) => {
  console.error('R2 storage check failed:', error?.message || error)
  process.exit(1)
})
