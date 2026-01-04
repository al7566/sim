import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClickBankOrder } from '@/lib/payments/clickbank/client'

const logger = createLogger('ClickBankCreateOrderAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, vendorId, productId, quantity, price, customerEmail, customerName, affiliateId, metadata } = body

    if (!apiKey || !vendorId || !productId) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiKey, vendorId, productId' },
        { status: 400 }
      )
    }

    // Set environment variables temporarily for this request
    const originalApiKey = process.env.CLICKBANK_API_KEY
    const originalVendorId = process.env.CLICKBANK_VENDOR_ID

    process.env.CLICKBANK_API_KEY = apiKey
    process.env.CLICKBANK_VENDOR_ID = vendorId

    try {
      const order = await createClickBankOrder({
        productId,
        quantity,
        price,
        customerEmail,
        customerName,
        affiliateId,
        metadata,
      })

      logger.info('ClickBank order created', { orderId: order.orderId })

      return NextResponse.json({ order })
    } finally {
      // Restore original environment variables
      if (originalApiKey) process.env.CLICKBANK_API_KEY = originalApiKey
      if (originalVendorId) process.env.CLICKBANK_VENDOR_ID = originalVendorId
    }
  } catch (error) {
    logger.error('Failed to create ClickBank order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
