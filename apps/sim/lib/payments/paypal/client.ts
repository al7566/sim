import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'
import type {
  CreatePayPalOrderParams,
  CreatePayPalProductParams,
  CreatePayPalSubscriptionParams,
  PayPalCaptureResponse,
  PayPalOrderResponse,
  PayPalProductResponse,
  PayPalRefundResponse,
  PayPalSubscriptionResponse,
  RefundPayPalPaymentParams,
} from './types'

const logger = createLogger('PayPalClient')

/**
 * Check if PayPal credentials are valid
 */
export function hasValidPayPalCredentials(): boolean {
  return !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET)
}

/**
 * Get PayPal API base URL based on mode
 */
function getPayPalAPIBase(): string {
  const mode = env.PAYPAL_MODE || 'live'
  return mode === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

/**
 * Get PayPal OAuth token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = env.PAYPAL_CLIENT_ID
  const secret = env.PAYPAL_SECRET
  const base = getPayPalAPIBase()

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  params: CreatePayPalOrderParams
): Promise<PayPalOrderResponse> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: params.intent || 'CAPTURE',
        purchase_units: params.purchase_units,
        application_context: params.application_context,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    const order = await response.json()

    logger.info('Created PayPal order', { orderId: order.id })

    return order
  } catch (error) {
    logger.error('Failed to create PayPal order', { error })
    throw error
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse | null> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`PayPal API error: ${response.status} ${response.statusText}`)
    }

    const order = await response.json()

    logger.info('Retrieved PayPal order', { orderId })

    return order
  } catch (error) {
    logger.error('Failed to get PayPal order', { error, orderId })
    throw error
  }
}

/**
 * Capture PayPal order payment
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    const capture = await response.json()

    logger.info('Captured PayPal order', { orderId })

    return capture.purchase_units[0].payments.captures[0]
  } catch (error) {
    logger.error('Failed to capture PayPal order', { error, orderId })
    throw error
  }
}

/**
 * Refund a PayPal payment
 */
export async function refundPayPalPayment(
  params: RefundPayPalPaymentParams
): Promise<PayPalRefundResponse> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const body: any = {}
    if (params.amount) body.amount = params.amount
    if (params.note_to_payer) body.note_to_payer = params.note_to_payer

    const response = await fetch(`${base}/v2/payments/captures/${params.captureId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    const refund = await response.json()

    logger.info('Refunded PayPal payment', { captureId: params.captureId })

    return refund
  } catch (error) {
    logger.error('Failed to refund PayPal payment', { error, captureId: params.captureId })
    throw error
  }
}

/**
 * Create a PayPal product
 */
export async function createPayPalProduct(
  params: CreatePayPalProductParams
): Promise<PayPalProductResponse> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    const product = await response.json()

    logger.info('Created PayPal product', { productId: product.id })

    return product
  } catch (error) {
    logger.error('Failed to create PayPal product', { error })
    throw error
  }
}

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  params: CreatePayPalSubscriptionParams
): Promise<PayPalSubscriptionResponse> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    const subscription = await response.json()

    logger.info('Created PayPal subscription', { subscriptionId: subscription.id })

    return subscription
  } catch (error) {
    logger.error('Failed to create PayPal subscription', { error })
    throw error
  }
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(
  subscriptionId: string
): Promise<PayPalSubscriptionResponse | null> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`PayPal API error: ${response.status} ${response.statusText}`)
    }

    const subscription = await response.json()

    logger.info('Retrieved PayPal subscription', { subscriptionId })

    return subscription
  } catch (error) {
    logger.error('Failed to get PayPal subscription', { error, subscriptionId })
    throw error
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  if (!hasValidPayPalCredentials()) {
    throw new Error('PayPal credentials not configured')
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const base = getPayPalAPIBase()

    const response = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: reason || 'Cancelled by user' }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${error}`)
    }

    logger.info('Cancelled PayPal subscription', { subscriptionId })
  } catch (error) {
    logger.error('Failed to cancel PayPal subscription', { error, subscriptionId })
    throw error
  }
}

/**
 * Get the PayPal client - for consistency with other payment providers
 */
export function getPayPalClient() {
  if (!hasValidPayPalCredentials()) {
    logger.warn('PayPal credentials not available - PayPal operations will be disabled')
    return null
  }

  return {
    createOrder: createPayPalOrder,
    getOrder: getPayPalOrder,
    captureOrder: capturePayPalOrder,
    refundPayment: refundPayPalPayment,
    createProduct: createPayPalProduct,
    createSubscription: createPayPalSubscription,
    getSubscription: getPayPalSubscription,
    cancelSubscription: cancelPayPalSubscription,
  }
}

/**
 * Require PayPal client - throws if not available
 */
export function requirePayPalClient() {
  const client = getPayPalClient()

  if (!client) {
    throw new Error(
      'PayPal client is not available. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in your environment variables.'
    )
  }

  return client
}
