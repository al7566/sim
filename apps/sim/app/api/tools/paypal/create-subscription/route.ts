import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPayPalSubscription } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalCreateSubscriptionAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, planId, returnUrl, cancelUrl } = body

    if (!clientId || !secret || !planId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, planId' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      const subscription = await createPayPalSubscription({
        plan_id: planId,
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      })

      logger.info('PayPal subscription created', { subscriptionId: subscription.id })

      return NextResponse.json({ subscription })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to create PayPal subscription', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
