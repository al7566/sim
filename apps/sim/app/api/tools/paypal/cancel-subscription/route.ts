import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cancelPayPalSubscription } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalCancelSubscriptionAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, subscriptionId, reason } = body

    if (!clientId || !secret || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, subscriptionId' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      await cancelPayPalSubscription(subscriptionId, reason)

      logger.info('PayPal subscription cancelled', { subscriptionId })

      return NextResponse.json({ subscriptionId, cancelled: true })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to cancel PayPal subscription', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
