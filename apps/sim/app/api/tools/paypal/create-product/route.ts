import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPayPalProduct } from '@/lib/payments/paypal/client'

const logger = createLogger('PayPalCreateProductAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, secret, name, description, type, category, imageUrl, homeUrl } = body

    if (!clientId || !secret || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, secret, name, type' },
        { status: 400 }
      )
    }

    const originalClientId = process.env.PAYPAL_CLIENT_ID
    const originalSecret = process.env.PAYPAL_SECRET

    process.env.PAYPAL_CLIENT_ID = clientId
    process.env.PAYPAL_SECRET = secret

    try {
      const product = await createPayPalProduct({
        name,
        description,
        type,
        category,
        image_url: imageUrl,
        home_url: homeUrl,
      })

      logger.info('PayPal product created', { productId: product.id })

      return NextResponse.json({ product })
    } finally {
      if (originalClientId) process.env.PAYPAL_CLIENT_ID = originalClientId
      if (originalSecret) process.env.PAYPAL_SECRET = originalSecret
    }
  } catch (error) {
    logger.error('Failed to create PayPal product', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
