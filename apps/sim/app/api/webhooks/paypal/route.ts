import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  handlePayPalWebhook,
  parsePayPalWebhook,
  verifyPayPalWebhookSignature,
} from '@/lib/payments/paypal/webhook'

const logger = createLogger('PayPalWebhookRoute')

/**
 * Handle PayPal webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)

    logger.info('Received PayPal webhook', {
      eventType: payload.event_type,
      eventId: payload.id,
    })

    // Extract headers for signature verification
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })

    // Get webhook ID from environment or use a default
    // In production, you should register webhooks and store the webhook ID
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WEBHOOK_ID'

    // Verify webhook signature
    const verified = await verifyPayPalWebhookSignature(webhookId, headers, body)

    // Parse the webhook event
    const event = parsePayPalWebhook(payload, verified)

    if (!event.verified) {
      logger.error('PayPal webhook signature verification failed', {
        eventId: payload.id,
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle the webhook event
    await handlePayPalWebhook(event)

    logger.info('PayPal webhook processed successfully', {
      eventType: event.event_type,
      eventId: event.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to process PayPal webhook', { error })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
