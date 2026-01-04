import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'
import type { PayPalWebhookEvent, PayPalWebhookEventType } from './types'

const logger = createLogger('PayPalWebhook')

/**
 * Get PayPal API base URL based on mode
 */
function getPayPalAPIBase(): string {
  const mode = env.PAYPAL_MODE || 'live'
  return mode === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhookSignature(
  webhookId: string,
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const clientId = env.PAYPAL_CLIENT_ID
  const secret = env.PAYPAL_SECRET

  if (!clientId || !secret) {
    logger.warn('PayPal credentials not configured for webhook verification')
    return false
  }

  try {
    const transmissionId = headers['paypal-transmission-id']
    const transmissionTime = headers['paypal-transmission-time']
    const transmissionSig = headers['paypal-transmission-sig']
    const certUrl = headers['paypal-cert-url']
    const authAlgo = headers['paypal-auth-algo']

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      logger.warn('Missing required PayPal webhook headers')
      return false
    }

    // Get PayPal access token
    const base = getPayPalAPIBase()

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

    const authResponse = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!authResponse.ok) {
      logger.error('Failed to get PayPal access token for verification')
      return false
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Verify webhook signature using PayPal API
    const verifyResponse = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    })

    if (!verifyResponse.ok) {
      logger.error('PayPal webhook verification request failed', {
        status: verifyResponse.status,
      })
      return false
    }

    const verifyData = await verifyResponse.json()
    const isValid = verifyData.verification_status === 'SUCCESS'

    if (!isValid) {
      logger.warn('PayPal webhook signature verification failed')
    }

    return isValid
  } catch (error) {
    logger.error('Error verifying PayPal webhook signature', { error })
    return false
  }
}

/**
 * Parse PayPal webhook payload
 */
export function parsePayPalWebhook(payload: any, verified: boolean): PayPalWebhookEvent {
  const event: PayPalWebhookEvent = {
    id: payload.id,
    event_type: payload.event_type as PayPalWebhookEventType,
    create_time: payload.create_time,
    resource_type: payload.resource_type,
    resource: payload.resource,
    summary: payload.summary || '',
    verified,
  }

  logger.info('Parsed PayPal webhook', {
    eventType: event.event_type,
    eventId: event.id,
    verified: event.verified,
  })

  return event
}

/**
 * Handle PayPal webhook event
 */
export async function handlePayPalWebhook(event: PayPalWebhookEvent): Promise<void> {
  if (!event.verified) {
    logger.error('Rejecting unverified PayPal webhook', { eventId: event.id })
    throw new Error('PayPal webhook signature verification failed')
  }

  try {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        logger.info('Processing PayPal payment capture', {
          eventId: event.id,
          captureId: event.resource.id,
        })
        // TODO: Store transaction in database
        // TODO: Trigger workflow webhooks
        break

      case 'PAYMENT.CAPTURE.DENIED':
        logger.warn('PayPal payment capture denied', {
          eventId: event.id,
          captureId: event.resource.id,
        })
        // TODO: Handle denied payment
        break

      case 'PAYMENT.CAPTURE.PENDING':
        logger.info('PayPal payment capture pending', {
          eventId: event.id,
          captureId: event.resource.id,
        })
        // TODO: Update transaction status
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        logger.info('PayPal payment refunded', {
          eventId: event.id,
          captureId: event.resource.id,
        })
        // TODO: Update transaction in database
        // TODO: Trigger workflow webhooks
        break

      case 'PAYMENT.CAPTURE.REVERSED':
        logger.warn('PayPal payment reversed', {
          eventId: event.id,
          captureId: event.resource.id,
        })
        // TODO: Handle payment reversal
        break

      case 'BILLING.SUBSCRIPTION.CREATED':
        logger.info('PayPal subscription created', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Store subscription in database
        break

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        logger.info('PayPal subscription activated', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Update subscription status
        // TODO: Trigger workflow webhooks
        break

      case 'BILLING.SUBSCRIPTION.UPDATED':
        logger.info('PayPal subscription updated', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Update subscription in database
        break

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        logger.info('PayPal subscription expired', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Update subscription status
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        logger.info('PayPal subscription cancelled', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Update subscription status
        // TODO: Trigger workflow webhooks
        break

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        logger.warn('PayPal subscription suspended', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Update subscription status
        break

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        logger.error('PayPal subscription payment failed', {
          eventId: event.id,
          subscriptionId: event.resource.id,
        })
        // TODO: Handle failed payment
        break

      default:
        logger.warn('Unknown PayPal webhook event type', {
          eventType: event.event_type,
          eventId: event.id,
        })
    }
  } catch (error) {
    logger.error('Error handling PayPal webhook', { error, eventId: event.id })
    throw error
  }
}
