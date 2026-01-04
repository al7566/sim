import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPayPalOrder } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalGetOrderAPI')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const clientId = request.headers.get('x-client-id')
    const secret = request.headers.get('x-secret')

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
      const order = await getPayPalOrder(orderId)

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      logger.info('PayPal order retrieved', { orderId })

      return NextResponse.json({ order })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to get PayPal order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get order' },
      { status: 500 }
    )
  }
}
