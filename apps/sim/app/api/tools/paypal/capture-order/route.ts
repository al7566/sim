import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { capturePayPalOrder } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalCaptureOrderAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, orderId } = body

    if (!clientId || !secret || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, orderId' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      const capture = await capturePayPalOrder(orderId)

      logger.info('PayPal order captured', { orderId })

      return NextResponse.json({ capture })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to capture PayPal order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture order' },
      { status: 500 }
    )
  }
}
