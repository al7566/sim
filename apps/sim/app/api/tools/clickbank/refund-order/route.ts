import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refundClickBankOrder } from '@/lib/payments/clickbank/client'

const logger = createLogger('ClickBankRefundOrderAPI')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, vendorId, receipt, reason, amount } = body

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
      const refund = await refundClickBankOrder({
        receipt,
        reason,
        amount,
      })

      logger.info('ClickBank order refunded', { receipt })

      return NextResponse.json({ refund })
    } finally {
      // Restore original environment variables
      if (originalApiKey) process.env.CLICKBANK_API_KEY = originalApiKey
      if (originalVendorId) process.env.CLICKBANK_VENDOR_ID = originalVendorId
    }
  } catch (error) {
    logger.error('Failed to refund ClickBank order', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refund order' },
      { status: 500 }
    )
  }
}
