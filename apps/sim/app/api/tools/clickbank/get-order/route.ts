import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getClickBankOrder } from '@/lib/payments/clickbank/client'

const logger = createLogger('ClickBankGetOrderAPI')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const receipt = searchParams.get('receipt')
    const apiKey = request.headers.get('x-api-key')
    const vendorId = request.headers.get('x-vendor-id')

    if (!apiKey || !vendorId || !receipt) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiKey, vendorId, receipt' },
        { status: 400 }
      )
    }

    // Set environment variables temporarily for this request
    const originalApiKey = process.env.CLICKBANK_API_KEY
    const originalVendorId = process.env.CLICKBANK_VENDOR_ID

    process.env.CLICKBANK_API_KEY = apiKey
    process.env.CLICKBANK_VENDOR_ID = vendorId

    try {
      const order = await getClickBankOrder(receipt)

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      logger.info('ClickBank order retrieved', { receipt })

      return NextResponse.json({ order })
    } finally {
      // Restore original environment variables
      if (originalApiKey) process.env.CLICKBANK_API_KEY = originalApiKey
      if (originalVendorId) process.env.CLICKBANK_VENDOR_ID = originalVendorId
    }
  } catch (error) {
    logger.error('Failed to get ClickBank order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get order' },
      { status: 500 }
    )
  }
}
