import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleClickBankWebhook, parseClickBankIPN } from '@/lib/payments/clickbank/webhook'
import type { ClickBankIPNPayload } from '@/lib/payments/clickbank/types'

const logger = createLogger('ClickBankWebhookRoute')

/**
 * Handle ClickBank IPN (Instant Payment Notification) webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // ClickBank sends IPN as form-urlencoded data
    const formData = await request.formData()
    const payload: ClickBankIPNPayload = {}

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      payload[key] = value.toString()
    }

    logger.info('Received ClickBank IPN', {
      receipt: payload.ctransreceipt,
      transaction: payload.ctransaction,
    })

    // Parse and verify the IPN
    const event = parseClickBankIPN(payload)

    if (!event.verified) {
      logger.error('ClickBank IPN signature verification failed', {
        receipt: payload.ctransreceipt,
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle the webhook event
    await handleClickBankWebhook(event)

    logger.info('ClickBank webhook processed successfully', {
      type: event.type,
      receipt: event.receipt,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to process ClickBank webhook', { error })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * ClickBank also supports GET requests for verification
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const payload: ClickBankIPNPayload = {}

    // Convert URL params to object
    for (const [key, value] of searchParams.entries()) {
      payload[key] = value
    }

    if (!payload.ctransreceipt) {
      return NextResponse.json({ error: 'Missing transaction receipt' }, { status: 400 })
    }

    logger.info('Received ClickBank IPN (GET)', {
      receipt: payload.ctransreceipt,
      transaction: payload.ctransaction,
    })

    // Parse and verify the IPN
    const event = parseClickBankIPN(payload)

    if (!event.verified) {
      logger.error('ClickBank IPN signature verification failed (GET)', {
        receipt: payload.ctransreceipt,
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle the webhook event
    await handleClickBankWebhook(event)

    logger.info('ClickBank webhook (GET) processed successfully', {
      type: event.type,
      receipt: event.receipt,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to process ClickBank webhook (GET)', { error })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
