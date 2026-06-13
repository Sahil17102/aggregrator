// utils/emailSender.ts
import dotenv from 'dotenv'
import fs from 'fs'
import nodemailer from 'nodemailer'
import path from 'path'
import sgMail from '@sendgrid/mail'

// Load correct .env based on NODE_ENV
const resolveRuntimeEnv = () =>
  process.env.NODE_ENV ||
  (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.K_SERVICE
    ? 'production'
    : 'development')

const env = resolveRuntimeEnv()
const backendRoot = path.resolve(__dirname, '../..')
dotenv.config({ path: path.resolve(backendRoot, `.env.${env}`) })
dotenv.config({ path: path.resolve(backendRoot, '.env') })

const AUTH_CODE_LOGGING_ENABLED =
  process.env.EXPOSE_AUTH_CODES === 'true' || process.env.ALLOW_INLINE_OTP === 'true'

type EmailConfig = {
  senderFrom: string
  smtpUser: string
  smtpPassword: string
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  sendGridApiKey: string
  sendGridFrom: string
  isGmail: boolean
  connectionTimeout: number
  greetingTimeout: number
  socketTimeout: number
}

type TransportCandidate = {
  name: string
  host: string
  port: number
  secure: boolean
  options: any
}

const trimEnv = (value?: string) => (value ?? '').trim()

const parseBooleanEnv = (value: string | undefined, fallback = false) => {
  const normalized = trimEnv(value).toLowerCase()
  if (!normalized) return fallback

  return ['true', '1', 'yes', 'on'].includes(normalized)
}

const parsePositiveIntEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(trimEnv(value))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const readEmailConfig = (): EmailConfig => {
  const configuredSendGridFrom = trimEnv(process.env.SENDGRID_FROM_EMAIL)
  const configuredFrom = trimEnv(process.env.EMAIL_FROM)
  const configuredUser = trimEnv(process.env.GOOGLE_SMTP_USER)
  const senderFrom = configuredSendGridFrom || configuredFrom || configuredUser
  const smtpUser = configuredUser || senderFrom
  const smtpPassword = trimEnv(process.env.GOOGLE_SMTP_PASSWORD)
  const smtpHost = trimEnv(process.env.SMTP_HOST)
  const smtpPort = parsePositiveIntEnv(process.env.SMTP_PORT, 587)
  const smtpSecure = parseBooleanEnv(process.env.SMTP_SECURE, smtpPort === 465)
  const sendGridApiKey =
    trimEnv(process.env.SENDGRID_API_KEY) ||
    trimEnv(process.env.TWILIO_SENDGRID_API_KEY) ||
    trimEnv(process.env.TWILLIO_SENDGRID_API_KEY)
  const sendGridFrom = configuredSendGridFrom || senderFrom
  const isGmail =
    /(^|\.)gmail\.com$/i.test(smtpHost) || /@gmail\.com$/i.test(smtpUser)

  return {
    senderFrom,
    smtpUser,
    smtpPassword,
    smtpHost,
    smtpPort,
    smtpSecure,
    sendGridApiKey,
    sendGridFrom,
    isGmail,
    connectionTimeout: parsePositiveIntEnv(process.env.SMTP_CONNECTION_TIMEOUT_MS, 10000),
    greetingTimeout: parsePositiveIntEnv(process.env.SMTP_GREETING_TIMEOUT_MS, 10000),
    socketTimeout: parsePositiveIntEnv(process.env.SMTP_SOCKET_TIMEOUT_MS, 30000),
  }
}

const maskEmailForLog = (email: string) => {
  const [localPart = '', domain = ''] = email.split('@')
  if (!localPart || !domain) return '[invalid-email]'

  const visibleLocal =
    localPart.length <= 2 ? `${localPart[0] ?? '*'}*` : `${localPart.slice(0, 2)}***`

  return `${visibleLocal}@${domain}`
}

const createPlainTextFallback = (htmlContent: string) =>
  htmlContent
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const getFrontendBaseUrl = () => process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'

type AttachmentInput = {
  /** local file path OR Buffer */
  path?: string
  buffer?: Buffer
  filename: string
  mimeType?: string
}

export const isEmailDeliveryConfigured = () => {
  const config = readEmailConfig()
  return Boolean(
    config.senderFrom &&
      (config.sendGridApiKey || (config.smtpUser && config.smtpPassword)),
  )
}

export const getTransactionalFromAddress = () => readEmailConfig().senderFrom

export const logAuthCode = ({
  purpose,
  to,
  code,
}: {
  purpose: string
  to: string
  code: string
}) => {
  if (!AUTH_CODE_LOGGING_ENABLED) {
    console.warn('[Auth Code] Code logging suppressed because inline auth codes are disabled.', {
      purpose,
      to: maskEmailForLog(to),
    })
    return
  }

  console.log('[Auth Code Debug]', {
    purpose,
    to: maskEmailForLog(to),
    code,
  })
}

const assertEmailConfig = (config: EmailConfig) => {
  if (!config.senderFrom || !config.smtpUser) {
    throw new Error(
      'Email service is not configured. Missing EMAIL_FROM, SENDGRID_FROM_EMAIL, or GOOGLE_SMTP_USER.',
    )
  }

  if (!config.smtpPassword) {
    throw new Error('Email service is not configured. Missing GOOGLE_SMTP_PASSWORD.')
  }
}

const makeTransportCandidate = (
  config: EmailConfig,
  name: string,
  host: string,
  port: number,
  secure: boolean,
): TransportCandidate => ({
  name,
  host,
  port,
  secure,
  options: {
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    connectionTimeout: config.connectionTimeout,
    greetingTimeout: config.greetingTimeout,
    socketTimeout: config.socketTimeout,
    tls: {
      servername: host,
      minVersion: 'TLSv1.2',
    },
  },
})

const addTransportCandidate = (
  candidates: TransportCandidate[],
  candidate: TransportCandidate,
) => {
  const alreadyAdded = candidates.some(
    (item) => item.host === candidate.host && item.port === candidate.port && item.secure === candidate.secure,
  )

  if (!alreadyAdded) candidates.push(candidate)
}

const buildTransportCandidates = (config: EmailConfig) => {
  assertEmailConfig(config)

  const candidates: TransportCandidate[] = []
  const configuredHost = config.smtpHost || 'smtp.gmail.com'

  if (config.isGmail) {
    addTransportCandidate(
      candidates,
      makeTransportCandidate(config, 'gmail-smtps', 'smtp.gmail.com', 465, true),
    )

    if (parseBooleanEnv(process.env.SMTP_ENABLE_GMAIL_STARTTLS_FALLBACK, false)) {
      addTransportCandidate(
        candidates,
        makeTransportCandidate(
          config,
          config.smtpHost ? 'configured-smtp' : 'gmail-starttls-fallback',
          configuredHost,
          config.smtpPort,
          config.smtpSecure,
        ),
      )
      addTransportCandidate(
        candidates,
        makeTransportCandidate(config, 'gmail-starttls-fallback', 'smtp.gmail.com', 587, false),
      )
    }

    return candidates
  }

  addTransportCandidate(
    candidates,
    makeTransportCandidate(
      config,
      config.smtpHost ? 'configured-smtp' : 'gmail-smtps',
      configuredHost,
      config.smtpPort,
      config.smtpSecure,
    ),
  )

  return candidates
}

const isRetryableSmtpConnectionError = (error: unknown) => {
  const smtpError = error as { code?: string; command?: string }
  const retryableCodes = new Set([
    'ETIMEDOUT',
    'ECONNECTION',
    'ESOCKET',
    'ECONNRESET',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ENETUNREACH',
  ])

  return retryableCodes.has(smtpError.code || '') || smtpError.command === 'CONN'
}

export const verifyEmailTransport = async () => {
  const config = readEmailConfig()
  const candidates = buildTransportCandidates(config)
  let lastError: unknown

  for (const [index, candidate] of candidates.entries()) {
    const transporter = nodemailer.createTransport(candidate.options)

    try {
      console.log('[Email] Verifying transporter', {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
        from: config.senderFrom,
      })
      await transporter.verify()
      console.log('[Email] Transporter verified', {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
      })
      return {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
      }
    } catch (error) {
      lastError = error
      console.error('[Email] Transporter verification failed', {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
        error,
      })

      if (index < candidates.length - 1 && isRetryableSmtpConnectionError(error)) {
        console.warn('[Email] Trying fallback SMTP transporter after connection failure', {
          failedTransport: candidate.name,
          nextTransport: candidates[index + 1].name,
        })
        continue
      }

      throw error
    } finally {
      transporter.close()
    }
  }

  throw lastError
}

/**
 * Low-level sendEmail supporting optional attachments
 */
const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: AttachmentInput[],
  textContent?: string,
) => {
  const config = readEmailConfig()
  const maskedRecipient = maskEmailForLog(to)
  const text = textContent || createPlainTextFallback(htmlContent)
  const resolvedAttachments = attachments?.length
    ? await Promise.all(
        attachments.map(async (a) => {
          let buffer: Buffer
          if (a.buffer) buffer = a.buffer
          else if (a.path) buffer = fs.readFileSync(a.path)
          else throw new Error('Attachment must have path or buffer')

          return {
            filename: a.filename,
            content: buffer,
            contentType: a.mimeType,
          }
        }),
      )
    : undefined

  if (config.sendGridApiKey) {
    try {
      sgMail.setApiKey(config.sendGridApiKey)
      console.log('[Email] Sending email', {
        transport: 'sendgrid',
        to: maskedRecipient,
        subject,
        attachments: resolvedAttachments?.length ?? 0,
      })

      const [response] = await sgMail.send({
        to,
        from: {
          email: config.sendGridFrom,
          name: 'ChoiceMee Logistics',
        },
        replyTo: config.sendGridFrom,
        subject,
        text,
        html: htmlContent,
        headers: {
          'X-ChoiceMee-Message-Type': 'transactional',
          'X-ChoiceMee-Mailer': 'choiceme-backend',
        },
        attachments: resolvedAttachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content.toString('base64'),
          type: attachment.contentType,
          disposition: 'attachment',
        })),
      } as any)

      console.log('[Email] Email accepted by SendGrid', {
        transport: 'sendgrid',
        to: maskedRecipient,
        statusCode: response.statusCode,
        messageId: response.headers?.['x-message-id'],
      })
      return response
    } catch (error) {
      console.error('[Email] SendGrid delivery failed', {
        transport: 'sendgrid',
        to: maskedRecipient,
        subject,
        error,
      })

      if (!config.smtpUser || !config.smtpPassword) {
        throw new Error('Email delivery failed through SendGrid')
      }

      console.warn('[Email] Falling back to SMTP after SendGrid failure', {
        to: maskedRecipient,
        subject,
      })
    }
  }

  const mailOptions: any = {
    from: `"ChoiceMee Logistics" <${config.senderFrom}>`,
    sender: config.senderFrom,
    replyTo: config.senderFrom,
    to,
    subject,
    text,
    html: htmlContent,
    headers: {
      'X-ChoiceMee-Message-Type': 'transactional',
      'X-ChoiceMee-Mailer': 'choiceme-backend',
    },
  }

  if (resolvedAttachments?.length) {
    mailOptions.attachments = resolvedAttachments
  }

  const candidates = buildTransportCandidates(config)
  let lastError: unknown

  for (const [index, candidate] of candidates.entries()) {
    const transporter = nodemailer.createTransport(candidate.options)

    try {
      console.log('[Email] Sending email', {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
        to: maskedRecipient,
        subject,
        attachments: attachments?.length ?? 0,
      })
      const info = await transporter.sendMail(mailOptions)
      console.log('[Email] Email sent successfully', {
        transport: candidate.name,
        to: maskedRecipient,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      })
      return info
    } catch (error) {
      lastError = error
      console.error('[Email] Error sending email', {
        transport: candidate.name,
        host: candidate.host,
        port: candidate.port,
        secure: candidate.secure,
        to: maskedRecipient,
        subject,
        error,
      })

      if (index < candidates.length - 1 && isRetryableSmtpConnectionError(error)) {
        console.warn('[Email] Retrying email with fallback SMTP transporter', {
          failedTransport: candidate.name,
          nextTransport: candidates[index + 1].name,
        })
        continue
      }

      throw error
    } finally {
      transporter.close()
    }
  }

  throw lastError
}

export type ShipmentStatusEmailStage =
  | 'booked'
  | 'manifested'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'

export type ShipmentOrderLike = {
  orderNumber?: string | null
  order_number?: string | null
  orderName?: string | null
  order_name?: string | null
  name?: string | null
  title?: string | null
  products?: unknown
  order_items?: unknown
  packages?: unknown
}

const firstString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const trimmed = String(value || '').trim()
    if (trimmed) return trimmed
  }

  return ''
}

const extractItemLabel = (value: unknown) => {
  const items = Array.isArray(value) ? value : []
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const candidate = firstString(
      (item as Record<string, unknown>).order_name as string | null | undefined,
      (item as Record<string, unknown>).orderName as string | null | undefined,
      (item as Record<string, unknown>).name as string | null | undefined,
      (item as Record<string, unknown>).productName as string | null | undefined,
      (item as Record<string, unknown>).box_name as string | null | undefined,
      (item as Record<string, unknown>).boxName as string | null | undefined,
      (item as Record<string, unknown>).title as string | null | undefined,
      (item as Record<string, unknown>).label as string | null | undefined,
      (item as Record<string, unknown>).itemName as string | null | undefined,
    )

    if (candidate) return candidate
  }

  return ''
}

export const resolveShipmentOrderLabel = (order?: ShipmentOrderLike | null) => {
  if (!order) return ''

  return firstString(
    order.orderName,
    order.order_name,
    order.name,
    order.title,
    extractItemLabel(order.products),
    extractItemLabel(order.order_items),
    extractItemLabel(order.packages),
    order.orderNumber,
    order.order_number,
  )
}

const formatShipmentDetailRows = (rows: Array<{ label: string; value?: string | null }>) => {
  const visibleRows = rows
    .map((row) => ({
      label: row.label,
      value: String(row.value || '').trim(),
    }))
    .filter((row) => row.value)

  if (!visibleRows.length) {
    return { html: '', text: '' }
  }

  return {
    html: `
      <div style="margin:18px 0 0;padding:16px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        ${visibleRows
          .map(
            (row) => `
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#111827;">
                <strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}
              </p>
            `,
          )
          .join('')}
      </div>
    `,
    text: visibleRows.map((row) => `${row.label}: ${row.value}`).join('\n'),
  }
}

export const sendShipmentStatusEmail = async (opts: {
  to: string
  awbNumber: string
  orderNumber?: string | null
  orderLabel?: string | null
  stage: ShipmentStatusEmailStage
}) => {
  const { to, awbNumber, orderNumber, orderLabel, stage } = opts
  const safeAwb = escapeHtml(String(awbNumber || '').trim())
  const safeOrderNumber = escapeHtml(String(orderNumber || '').trim())
  const safeOrderLabel = escapeHtml(String(orderLabel || '').trim())
  const detailRows = formatShipmentDetailRows([
    { label: 'AWB Number', value: safeAwb },
    { label: 'Order Number', value: safeOrderNumber },
    {
      label: 'Order Name',
      value: safeOrderLabel && safeOrderLabel !== safeOrderNumber ? safeOrderLabel : null,
    },
  ])

  const templates: Record<
    ShipmentStatusEmailStage,
    { subject: string; body: string; htmlBody: string }
  > = {
    booked: {
      subject: `ChoiceMee Shipment Booked${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Seller,\n\nYour order${safeAwb ? ` with AWB ${awbNumber}` : ''} has been booked successfully on ChoiceMee.\nWe will share the next update as soon as it is available.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Seller,</p>
        <p style="margin:0 0 14px;">Your order${safeAwb ? ` with AWB <strong>${safeAwb}</strong>` : ''} has been booked successfully on ChoiceMee.</p>
        <p style="margin:0 0 14px;">We will share the next update as soon as it is available.</p>
      `,
    },
    manifested: {
      subject: `ChoiceMee Shipment Manifested${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Seller,\n\nYour order under AWB ${awbNumber} from ChoiceMee has been manifested.\nYou will receive the next update shortly.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Seller,</p>
        <p style="margin:0 0 14px;">Your order under AWB <strong>${safeAwb}</strong> from ChoiceMee has been manifested.</p>
        <p style="margin:0 0 14px;">You will receive the next update shortly.</p>
      `,
    },
    picked_up: {
      subject: `ChoiceMee Shipment Picked Up${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Sellers,\n\nYour order AWB ${awbNumber} from ChoiceMee has been picked up.\nYou will receive the next update shortly.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Sellers,</p>
        <p style="margin:0 0 14px;">Your order AWB <strong>${safeAwb}</strong> from ChoiceMee has been picked up.</p>
        <p style="margin:0 0 14px;">You will receive the next update shortly.</p>
      `,
    },
    out_for_delivery: {
      subject: `ChoiceMee Out for Delivery${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Sellers,\n\nYour order under AWB ${awbNumber} from ChoiceMee is now OUT FOR DELIVERY and will be delivered by EOD.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Sellers,</p>
        <p style="margin:0 0 14px;">Your order under AWB <strong>${safeAwb}</strong> from ChoiceMee is now <strong>OUT FOR DELIVERY</strong> and will be delivered by EOD.</p>
      `,
    },
    delivered: {
      subject: `ChoiceMee Delivered${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Seller,\n\nYour order under AWB ${awbNumber} is now successfully delivered.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Seller,</p>
        <p style="margin:0 0 14px;">Your order under AWB <strong>${safeAwb}</strong> is now successfully delivered.</p>
      `,
    },
    failed: {
      subject: `ChoiceMee Delivery Failed${safeAwb ? ` - AWB ${safeAwb}` : ''}`,
      body: `Dear Seller,\n\nYour order under AWB ${awbNumber} from ChoiceMee delivery failed. Kindly contact the consignee.\n\nRegards\nChoiceMee Logistic`,
      htmlBody: `
        <p style="margin:0 0 14px;">Dear Seller,</p>
        <p style="margin:0 0 14px;">Your order under AWB <strong>${safeAwb}</strong> from ChoiceMee delivery failed. Kindly contact the consignee.</p>
      `,
    },
  }

  const template = templates[stage]
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; color: #111827;">
      <div style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">
          ChoiceMee Logistic
        </div>
        <h2 style="margin: 10px 0 0; font-size: 22px; line-height: 1.3; color: #0f172a;">
          ${escapeHtml(template.subject)}
        </h2>
      </div>

      <div style="font-size: 16px; line-height: 1.8; color: #1f2937;">
        ${template.htmlBody}
        ${detailRows.html}
      </div>

      <div style="margin-top: 24px; font-size: 15px; line-height: 1.8; color: #111827;">
        <p style="margin:0 0 14px;">Regards</p>
        <p style="margin:0;">ChoiceMee Logistic</p>
      </div>
    </div>
  `

  await sendEmail(
    to,
    template.subject,
    html,
    undefined,
    `${template.body}${detailRows.text ? `\n\n${detailRows.text}` : ''}`,
  )
}

export const sendSmtpTestEmail = async (to?: string) => {
  const config = readEmailConfig()
  const recipient = to || config.senderFrom

  await sendEmail(
    recipient,
    'ChoiceMee Logistics SMTP test',
    `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="margin:0 0 12px;color:#0D1B4D">SMTP delivery is working</h2>
        <p>This is a production mailer test from ChoiceMee Logistics.</p>
      </div>
    `,
    undefined,
    'SMTP delivery is working. This is a production mailer test from ChoiceMee Logistics.',
  )
}

// Login / verification Email for OTP-based auth
export const sendVerificationEmail = async (to: string, token: string) => {
  console.log('[Auth Email] Preparing verification email', {
    to: maskEmailForLog(to),
    tokenLength: token.length,
  })

  if (!isEmailDeliveryConfigured()) {
    throw new Error('Email service is not configured. Missing SendGrid API key or SMTP credentials.')
  }

  const html = `
    <div style="margin:0; padding:24px 12px; background:#f4f1ed;">
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        max-width: 620px;
        margin: 0 auto;
        background: #fffdf9;
        border: 1px solid #eadfd4;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 40px rgba(23,19,16,0.08);
        color: #171310;
      ">
        <div style="
          padding: 26px 28px 18px;
          background: linear-gradient(135deg, #0D1B4D 0%, #18346F 58%, #FF8A28 100%);
          color: #ffffff;
        ">
          <div style="
            display:inline-block;
            padding:6px 12px;
            border-radius:999px;
            background:rgba(255,138,40,0.24);
            font-size:12px;
            font-weight:700;
            letter-spacing:0.08em;
            text-transform:uppercase;
          ">
            ChoiceMee
          </div>

          <h1 style="margin:18px 0 8px; font-size:28px; line-height:1.2; font-weight:800;">
            Your sign-in code is ready
          </h1>

          <p style="margin:0; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.82);">
            Use the verification code below to securely continue your login.
          </p>
        </div>

        <div style="padding:28px;">
          <div style="
            border:1px solid #eadfd4;
            border-radius:20px;
            background:linear-gradient(180deg, #fff 0%, #fbf5ef 100%);
            padding:22px;
            text-align:center;
          ">
            <p style="
              margin:0 0 10px;
              font-size:12px;
              font-weight:700;
              letter-spacing:0.12em;
              text-transform:uppercase;
              color:#8a6f5a;
            ">
              Verification Code
            </p>

            <div style="
              display:inline-block;
              padding:16px 24px;
              border-radius:16px;
              background:#171310;
              color:#ffffff;
              font-size:30px;
              line-height:1;
              font-weight:800;
              letter-spacing:8px;
            ">
              ${token}
            </div>

            <p style="margin:14px 0 0; font-size:13px; color:#6a5e59; line-height:1.6;">
              This code expires in <strong style="color:#171310;">6 minutes</strong>.
            </p>
          </div>

          <div style="
            margin-top:18px;
            padding:18px 20px;
            border-radius:18px;
            background:#f6efe7;
            border:1px solid #eadfd4;
          ">
            <p style="margin:0 0 8px; font-size:14px; font-weight:700; color:#171310;">
              Didn&apos;t request this?
            </p>
            <p style="margin:0; font-size:13px; line-height:1.7; color:#6a5e59;">
              You can safely ignore this email. Your account stays protected unless this code is entered.
            </p>
          </div>

          <div style="margin-top:22px; padding-top:18px; border-top:1px solid #eadfd4;">
            <p style="margin:0; font-size:12px; line-height:1.7; color:#8c7b70;">
              Sent by ChoiceMee Logistics
            </p>
            <p style="margin:4px 0 0; font-size:12px; line-height:1.7; color:#a19185;">
              Â© ${new Date().getFullYear()} ChoiceMee Logistics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `

  await sendEmail(
    to,
    'Your ChoiceMee Logistics verification code',
    html,
    undefined,
    `Your ChoiceMee Logistics verification code is ${token}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
  )
  return { delivered: true }
}

export const sendPasswordResetEmail = async (to: string, token: string) => {
  console.log('[Auth Email] Preparing password reset email', {
    to: maskEmailForLog(to),
    tokenLength: token.length,
  })

  if (!isEmailDeliveryConfigured()) {
    throw new Error('Email service is not configured. Missing SendGrid API key or SMTP credentials.')
  }

  const resetUrl = `${getFrontendBaseUrl()}/reset-password?email=${encodeURIComponent(to)}&token=${encodeURIComponent(token)}`

  const html = `
    <div style="margin:0; padding:24px 12px; background:#f4f1ed;">
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        max-width: 620px;
        margin: 0 auto;
        background: #fffdf9;
        border: 1px solid #eadfd4;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 40px rgba(23,19,16,0.08);
        color: #171310;
      ">
        <div style="
          padding: 26px 28px 18px;
          background: linear-gradient(135deg, #0D1B4D 0%, #18346F 58%, #FF8A28 100%);
          color: #ffffff;
        ">
          <div style="
            display:inline-block;
            padding:6px 12px;
            border-radius:999px;
            background:rgba(255,138,40,0.24);
            font-size:12px;
            font-weight:700;
            letter-spacing:0.08em;
            text-transform:uppercase;
          ">
            ChoiceMee
          </div>

          <h1 style="margin:18px 0 8px; font-size:28px; line-height:1.2; font-weight:800;">
            Reset your password
          </h1>

          <p style="margin:0; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.82);">
            We received a request to reset the password for your ChoiceMee account.
          </p>
        </div>

        <div style="padding:28px;">
          <div style="
            border:1px solid #eadfd4;
            border-radius:20px;
            background:linear-gradient(180deg, #fff 0%, #fbf5ef 100%);
            padding:22px;
            text-align:center;
          ">
            <p style="
              margin:0 0 10px;
              font-size:12px;
              font-weight:700;
              letter-spacing:0.12em;
              text-transform:uppercase;
              color:#8a6f5a;
            ">
              Reset Code
            </p>

            <div style="
              display:inline-block;
              padding:16px 24px;
              border-radius:16px;
              background:#171310;
              color:#ffffff;
              font-size:30px;
              line-height:1;
              font-weight:800;
              letter-spacing:8px;
            ">
              ${token}
            </div>

            <p style="margin:14px 0 0; font-size:13px; color:#6a5e59; line-height:1.6;">
              This reset code expires in <strong style="color:#171310;">15 minutes</strong>.
            </p>
          </div>

          <div style="margin-top:18px; text-align:center;">
            <a href="${resetUrl}" style="
              display:inline-block;
              padding:14px 24px;
              border-radius:999px;
              background:#0D1B4D;
              color:#fff;
              font-size:15px;
              font-weight:700;
              text-decoration:none;
            ">
              Reset Password
            </a>
          </div>

          <div style="
            margin-top:18px;
            padding:18px 20px;
            border-radius:18px;
            background:#f6efe7;
            border:1px solid #eadfd4;
          ">
            <p style="margin:0 0 8px; font-size:14px; font-weight:700; color:#171310;">
              Didn&apos;t request this?
            </p>
            <p style="margin:0; font-size:13px; line-height:1.7; color:#6a5e59;">
              You can safely ignore this email. Your current password stays active until you change it.
            </p>
          </div>

          <div style="margin-top:22px; padding-top:18px; border-top:1px solid #eadfd4;">
            <p style="margin:0; font-size:12px; line-height:1.7; color:#8c7b70;">
              Sent by ChoiceMee Logistics
            </p>
            <p style="margin:4px 0 0; font-size:12px; line-height:1.7; color:#a19185;">
              © ${new Date().getFullYear()} ChoiceMee Logistics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `

  await sendEmail(
    to,
    'Reset your ChoiceMee password',
    html,
    undefined,
    `Reset your ChoiceMee password using this code: ${token}. It expires in 15 minutes. Open ${resetUrl} to continue. If you did not request this, ignore this email.`,
  )
  return { delivered: true, resetUrl }
}

// Employee Credentials Email
export const sendEmployeeCredentials = async (
  to: string,
  email: string,
  password: string,
  createdBy: string, // name or email of the seller/admin
) => {
  const html = `
    <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1e293b; margin: 0;">Welcome to <span style="color:#2563eb;">ChoiceMee Logistics</span> ðŸš€</h2>
        <p style="font-size: 15px; color: #64748b; margin-top: 8px;">Your employee account has been created successfully.</p>
      </div>

      <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #334155; margin: 0 0 12px 0;">
          An account has been created for you by <strong>${createdBy}</strong>.
        </p>
        <p style="font-size: 16px; color: #334155; margin: 0 0 12px 0;">Here are your login credentials:</p>
        <table style="width: 100%; font-size: 15px; color: #1e293b; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 40%;">Email</td>
            <td style="padding: 8px; background: #f9fafb; border-radius: 4px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Password</td>
            <td style="padding: 8px; background: #f9fafb; border-radius: 4px;">${password}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #64748b; margin-top: 28px; text-align: center;">
        You can now log in to your ChoiceMee Logistics account using these credentials.<br/>
        If you face any issues, please contact your administrator.
      </p>

      <div style="text-align: center; margin-top: 32px; font-size: 13px; color: #94a3b8;">
        â€” The ChoiceMee Logistics Team
      </div>
    </div>
  `

  await sendEmail(to, 'Your ChoiceMee Logistics Employee Account', html)
}
export const sendTempPasswordEmail = async (to: string, tempPassword: string) => {
  const safePassword = escapeHtml(tempPassword)

  const html = `
    <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width:600px; margin:auto; padding:32px; border:1px solid #e5e7eb; border-radius:12px; background-color:#f9fafb;">
      <div style="text-align:center; margin-bottom:24px;">
        <h2 style="color:#1e293b; margin:0;">ChoiceMee Logistics Account Password Reset</h2>
        <p style="font-size:15px; color:#64748b; margin-top:8px;">
          Your account password has been reset by our team.
        </p>
      </div>

      <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e5e7eb; text-align:center;">
        <p style="font-size:16px; color:#334155; margin-bottom:16px;">
          Here is your temporary password:
        </p>
        <span style="display:inline-block; padding:12px 24px; font-size:20px; font-weight:bold; color:#ffffff; background-color:#2563eb; border-radius:6px; letter-spacing:1px;">
          ${safePassword}
        </span>
        <p style="font-size:14px; color:#64748b; margin-top:16px;">
          Use this password to log in and change it immediately.
        </p>
      </div>

      <p style="font-size:13px; color:#94a3b8; margin-top:28px; text-align:center;">
        If you did not request this, please contact our support immediately.<br/>
        â€” The ChoiceMee Logistics Team
      </p>
    </div>
  `

  await sendEmail(to, 'Your Temporary ChoiceMee Logistics Password', html)
}

export const sendInvoiceReadyEmail = async (opts: {
  to: string
  sellerName?: string
  invoiceNo: string
  periodStart: string // e.g. '01 Sep 2025'
  periodEnd: string
  totalAmount: string | number
  pdfUrl?: string // optional public url or local path
  csvUrl?: string // optional public url or local path
  attachFiles?: boolean // default false for production
  preferSignedUrls?: boolean // if true, treat pdfUrl/csvUrl as download links
}) => {
  const {
    to,
    sellerName,
    invoiceNo,
    periodStart,
    periodEnd,
    totalAmount,
    pdfUrl,
    csvUrl,
    attachFiles = false,
    preferSignedUrls = false,
  } = opts

  const safeSeller = sellerName ? sellerName : 'Seller'

  const html = `
  <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; padding:24px; color:#111">
    <h2 style="margin-bottom: 8px;">Your invoice is ready â€” ${invoiceNo}</h2>
    <p style="color:#555; margin-top:0;">Hello ${safeSeller},</p>
    <p style="color:#555">Your invoice for the period <strong>${periodStart}</strong> â€” <strong>${periodEnd}</strong> has been generated.</p>

    <table style="width:100%; margin-top:12px; border-collapse: collapse;">
      <tr>
        <td style="padding:8px; font-weight:600; width:40%;">Invoice No</td>
        <td style="padding:8px;">${invoiceNo}</td>
      </tr>
      <tr>
        <td style="padding:8px; font-weight:600;">Period</td>
        <td style="padding:8px;">${periodStart} â€” ${periodEnd}</td>
      </tr>
      <tr>
        <td style="padding:8px; font-weight:600;">Amount (GST inclusive)</td>
        <td style="padding:8px;">â‚¹${Number(totalAmount).toFixed(2)}</td>
      </tr>
    </table>

    <div style="margin-top:16px;">
  ${
    preferSignedUrls && (pdfUrl || csvUrl)
      ? `<p style="margin-bottom:8px;">Download files:</p>
       ${pdfUrl ? `<p><a href="${pdfUrl}">Download PDF Invoice</a></p>` : ''}
       ${csvUrl ? `<p><a href="${csvUrl}">Download CSV breakdown</a></p>` : ''}`
      : `<p style="color:#555; margin-bottom:8px;">You can download the invoice files attached to this email.</p>`
  }
    </div>

    <p style="color:#777; margin-top:20px; font-size:13px;">
      If you have any questions or dispute an item on the invoice, please contact support or use the â€œraise disputeâ€ option in your seller dashboard.
    </p>

    <div style="margin-top:22px; font-size:12px; color:#999;">
      â€” ChoiceMee Logistics Team
    </div>
  </div>
  `

  // If attachFiles true and pdfUrl/csvUrl point to local files, attach them
  let attachments: AttachmentInput[] | undefined = undefined
  if (attachFiles) {
    attachments = []
    if (pdfUrl && !preferSignedUrls) {
      if (fs.existsSync(pdfUrl)) {
        attachments.push({ path: pdfUrl, filename: `${invoiceNo}.pdf` })
      }
    }
    if (csvUrl && !preferSignedUrls) {
      if (fs.existsSync(csvUrl)) {
        attachments.push({ path: csvUrl, filename: `${invoiceNo}.csv` })
      }
    }
  }

  await sendEmail(to, `Your Invoice ${invoiceNo} is ready`, html, attachments)
}

export const sendInvoiceReminderEmail = async (opts: {
  to: string
  invoiceNo: string
  amount: number | string
  pdfUrl?: string
  csvUrl?: string
}) => {
  const { to, invoiceNo, amount, pdfUrl, csvUrl } = opts

  const html = `
  <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; padding:24px; color:#111">
    <h2 style="margin-bottom: 8px; color: #dc2626;">Payment Reminder â€” Invoice ${invoiceNo}</h2>
    <p style="color:#555; margin-top:0;">Hello,</p>
    <p style="color:#555">This is a friendly reminder that your invoice <strong>${invoiceNo}</strong> with an outstanding amount of <strong>â‚¹${Number(
    amount,
  ).toFixed(2)}</strong> is still pending payment.</p>

    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #991b1b;">Outstanding Amount: â‚¹${Number(
        amount,
      ).toFixed(2)}</p>
    </div>

    <div style="margin-top:16px;">
      ${
        pdfUrl || csvUrl
          ? `<p style="margin-bottom:8px;">Access your invoice:</p>
       ${
         pdfUrl
           ? `<p><a href="${pdfUrl}" style="color: #2563eb; text-decoration: underline;">Download PDF Invoice</a></p>`
           : ''
       }
       ${
         csvUrl
           ? `<p><a href="${csvUrl}" style="color: #2563eb; text-decoration: underline;">Download CSV breakdown</a></p>`
           : ''
       }`
          : ''
      }
    </div>

    <p style="color:#777; margin-top:20px; font-size:13px;">
      Please make the payment at your earliest convenience. If you have already made the payment, please ignore this reminder.
    </p>

    <p style="color:#777; margin-top:16px; font-size:13px;">
      If you have any questions or need assistance, please contact our support team.
    </p>

    <div style="margin-top:22px; font-size:12px; color:#999;">
      â€” ChoiceMee Logistics Team
    </div>
  </div>
  `

  await sendEmail(to, `Payment Reminder: Invoice ${invoiceNo}`, html)
}

export const sendKycStatusEmail = async (opts: {
  to: string
  userName?: string
  status: 'verified' | 'rejected'
  reason?: string
}) => {
  const { to, userName, status, reason } = opts
  const safeName = userName || 'Merchant'
  const isApproved = status === 'verified'
  const subject = isApproved ? 'Your KYC has been approved' : 'Your KYC has been rejected'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="margin: 0 0 10px 0; color: ${isApproved ? '#166534' : '#991b1b'};">
        ${isApproved ? 'KYC Approved' : 'KYC Rejected'}
      </h2>
      <p style="margin: 0 0 12px 0; color: #374151;">Hello ${safeName},</p>
      <p style="margin: 0 0 14px 0; color: #374151;">
        Your KYC verification status has been updated to:
        <strong>${isApproved ? 'Approved' : 'Rejected'}</strong>.
      </p>
      ${
        !isApproved && reason
          ? `<div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 14px 0; border-radius: 6px;">
               <p style="margin: 0; color: #7f1d1d;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
             </div>`
          : ''
      }
      <p style="margin: 14px 0 0 0; color: #6b7280; font-size: 13px;">
        If you need help, please contact support from your dashboard.
      </p>
      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">â€” ChoiceMee Logistics Team</p>
    </div>
  `

  await sendEmail(to, subject, html)
}


