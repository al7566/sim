import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refundPayPalPayment } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalRefundPaymentAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, captureId, amount, currency, note } = body

    if (!clientId || !secret || !captureId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, captureId' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      const refundParams: any = { captureId }
      if (amount && currency) {
        refundParams.amount = { currency_code: currency, value: amount }
      }
      if (note) {
        refundParams.note_to_payer = note
      }

      const refund = await refundPayPalPayment(refundParams)

      logger.info('PayPal payment refunded', { captureId })

      return NextResponse.json({ refund })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to refund PayPal payment', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refund payment' },
      { status: 500 }
    )
  }
}
