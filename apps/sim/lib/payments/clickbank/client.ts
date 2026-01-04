import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'
import type {
  ClickBankOrderResponse,
  ClickBankProduct,
  ClickBankRefundResponse,
  CreateClickBankOrderParams,
  RefundClickBankOrderParams,
} from './types'

const logger = createLogger('ClickBankClient')

const CLICKBANK_API_BASE = 'https://api.clickbank.com/rest/1.3'

/**
 * Check if ClickBank credentials are valid
 */
export function hasValidClickBankCredentials(): boolean {
  return !!(env.CLICKBANK_VENDOR_ID && env.CLICKBANK_API_KEY)
}

/**
 * Get ClickBank API headers
 */
function getClickBankHeaders(): HeadersInit {
  const apiKey = env.CLICKBANK_API_KEY || ''
  const clerkKey = env.CLICKBANK_CLERK_KEY || apiKey

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `${apiKey}:${clerkKey}`,
  }
}

/**
 * Create a ClickBank order
 */
export async function createClickBankOrder(
  params: CreateClickBankOrderParams
): Promise<ClickBankOrderResponse> {
  if (!hasValidClickBankCredentials()) {
    throw new Error('ClickBank credentials not configured')
  }

  try {
    const vendorId = env.CLICKBANK_VENDOR_ID

    // ClickBank uses a payment link approach rather than API order creation
    // Generate payment link with tracking parameters
    const paymentUrl = new URL(`https://${vendorId}.pay.clickbank.net`)
    paymentUrl.searchParams.set('cbskin', vendorId)
    paymentUrl.searchParams.set('cbfid', params.productId)

    if (params.affiliateId) {
      paymentUrl.searchParams.set('cbaffi', params.affiliateId)
    }

    if (params.metadata) {
      for (const [key, value] of Object.entries(params.metadata)) {
        paymentUrl.searchParams.set(key, value)
      }
    }

    const orderId = `CB-${Date.now()}`
    const receipt = `TEMP-${orderId}`

    logger.info('Created ClickBank order', { orderId, productId: params.productId })

    return {
      orderId,
      receipt,
      paymentUrl: paymentUrl.toString(),
      amount: params.price || 0,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Failed to create ClickBank order', { error })
    throw error
  }
}

/**
 * Get ClickBank order details
 */
export async function getClickBankOrder(receipt: string): Promise<ClickBankOrderResponse | null> {
  if (!hasValidClickBankCredentials()) {
    throw new Error('ClickBank credentials not configured')
  }

  try {
    const url = `${CLICKBANK_API_BASE}/orders/${receipt}`
    const response = await fetch(url, {
      method: 'GET',
      headers: getClickBankHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`ClickBank API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    logger.info('Retrieved ClickBank order', { receipt })

    return {
      orderId: data.orderData?.orderNumber || receipt,
      receipt: data.orderData?.receipt || receipt,
      paymentUrl: '',
      amount: parseFloat(data.orderData?.totalAmount || '0'),
      currency: data.orderData?.currency || 'USD',
      status: data.orderData?.status || 'unknown',
      createdAt: data.orderData?.createdDate || new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Failed to get ClickBank order', { error, receipt })
    throw error
  }
}

/**
 * Refund a ClickBank order
 */
export async function refundClickBankOrder(
  params: RefundClickBankOrderParams
): Promise<ClickBankRefundResponse> {
  if (!hasValidClickBankCredentials()) {
    throw new Error('ClickBank credentials not configured')
  }

  try {
    const url = `${CLICKBANK_API_BASE}/orders/${params.receipt}/refund`
    const response = await fetch(url, {
      method: 'POST',
      headers: getClickBankHeaders(),
      body: JSON.stringify({
        reason: params.reason || 'Refund requested',
        amount: params.amount,
      }),
    })

    if (!response.ok) {
      throw new Error(`ClickBank API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    logger.info('Refunded ClickBank order', { receipt: params.receipt })

    return {
      refundId: data.refundId || `RFND-${Date.now()}`,
      receipt: params.receipt,
      amount: params.amount || 0,
      status: 'processed',
      processedAt: new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Failed to refund ClickBank order', { error, receipt: params.receipt })
    throw error
  }
}

/**
 * Get ClickBank products
 */
export async function getClickBankProducts(): Promise<ClickBankProduct[]> {
  if (!hasValidClickBankCredentials()) {
    throw new Error('ClickBank credentials not configured')
  }

  try {
    const vendorId = env.CLICKBANK_VENDOR_ID
    const url = `${CLICKBANK_API_BASE}/products`
    const response = await fetch(url, {
      method: 'GET',
      headers: getClickBankHeaders(),
    })

    if (!response.ok) {
      throw new Error(`ClickBank API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const products = data.products || []

    logger.info('Retrieved ClickBank products', { count: products.length })

    return products.map((product: any) => ({
      id: product.id || product.productId || '',
      title: product.title || product.name || '',
      price: parseFloat(product.price || '0'),
      currency: product.currency || 'USD',
      description: product.description,
      category: product.category,
      active: product.active !== false,
    }))
  } catch (error) {
    logger.error('Failed to get ClickBank products', { error })
    throw error
  }
}

/**
 * Get the ClickBank client - for consistency with other payment providers
 */
export function getClickBankClient() {
  if (!hasValidClickBankCredentials()) {
    logger.warn('ClickBank credentials not available - ClickBank operations will be disabled')
    return null
  }

  return {
    createOrder: createClickBankOrder,
    getOrder: getClickBankOrder,
    refundOrder: refundClickBankOrder,
    getProducts: getClickBankProducts,
  }
}

/**
 * Require ClickBank client - throws if not available
 */
export function requireClickBankClient() {
  const client = getClickBankClient()

  if (!client) {
    throw new Error(
      'ClickBank client is not available. Set CLICKBANK_VENDOR_ID and CLICKBANK_API_KEY in your environment variables.'
    )
  }

  return client
}
