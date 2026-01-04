import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPayPalSubscription } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalGetSubscriptionAPI')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subscriptionId = searchParams.get('subscriptionId')
    const clientId = request.headers.get('x-client-id')
    const secret = request.headers.get('x-secret')

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
      const subscription = await getPayPalSubscription(subscriptionId)

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      logger.info('PayPal subscription retrieved', { subscriptionId })

      return NextResponse.json({ subscription })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to get PayPal subscription', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get subscription' },
      { status: 500 }
    )
  }
}
