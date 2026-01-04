import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPayPalOrder } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalCreateOrderAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, amount, currency, description, returnUrl, cancelUrl } = body

    if (!clientId || !secret || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, amount' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      const order = await createPayPalOrder({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency || 'USD',
              value: amount,
            },
            description,
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'PAY_NOW',
        },
      })

      logger.info('PayPal order created', { orderId: order.id })

      return NextResponse.json({ order })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to create PayPal order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
