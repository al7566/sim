import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getClickBankProducts } from '@/lib/payments/clickbank/client'

const logger = createLogger('ClickBankGetProductsAPI')

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const vendorId = request.headers.get('x-vendor-id')

    if (!apiKey || !vendorId) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiKey, vendorId' },
        { status: 400 }
      )
    }

    // Set environment variables temporarily for this request
    const originalApiKey = process.env.CLICKBANK_API_KEY
    const originalVendorId = process.env.CLICKBANK_VENDOR_ID

    process.env.CLICKBANK_API_KEY = apiKey
    process.env.CLICKBANK_VENDOR_ID = vendorId

    try {
      const products = await getClickBankProducts()

      logger.info('ClickBank products retrieved', { count: products.length })

      return NextResponse.json({ products })
    } finally {
      // Restore original environment variables
      if (originalApiKey) process.env.CLICKBANK_API_KEY = originalApiKey
      if (originalVendorId) process.env.CLICKBANK_VENDOR_ID = originalVendorId
    }
  } catch (error) {
    logger.error('Failed to get ClickBank products', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get products' },
      { status: 500 }
    )
  }
}
