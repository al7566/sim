import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import { sql } from 'drizzle-orm'

const logger = createLogger('AffiliateIntegration')

/**
 * Track affiliate commission from ClickBank sale
 */
export async function trackClickBankCommission(data: {
  receipt: string
  affiliateId?: string
  saleAmount: number
  productId: string
  transactionType: string
}) {
  if (!data.affiliateId) {
    return null
  }

  try {
    // Record commission with affiliate tracking
    const commissionRate = data.transactionType === 'SALE' ? 50 : 40
    const commissionAmount = data.saleAmount * (commissionRate / 100)

    logger.info('ClickBank commission tracked', {
      receipt: data.receipt,
      affiliateId: data.affiliateId,
      commission: commissionAmount,
    })

    return { affiliate

Id: data.affiliateId, commission: commissionAmount }
  } catch (error) {
    logger.error('Failed to track ClickBank commission', { error })
    return null
  }
}

/**
 * Track PayPal commission
 */
export async function trackPayPalCommission(data: {
  orderId: string
  customId?: string
  amount: number
}) {
  const affiliateCode = data.customId?.match(/aff_([A-Z0-9-]+)/i)?.[1]
  
  if (!affiliateCode) return null

  try {
    const commissionRate = 30
    const commissionAmount = data.amount * (commissionRate / 100)

    logger.info('PayPal commission tracked', {
      orderId: data.orderId,
      affiliateCode,
      commission: commissionAmount,
    })

    return { affiliateCode, commission: commissionAmount }
  } catch (error) {
    logger.error('Failed to track PayPal commission', { error })
    return null
  }
}

/**
 * Track Stripe commission
 */
export async function trackStripeCommission(data: {
  paymentIntentId: string
  metadata?: { affiliate_code?: string }
  amount: number
}) {
  const affiliateCode = data.metadata?.affiliate_code
  
  if (!affiliateCode) return null

  try {
    const commissionRate = 30
    const commissionAmount = (data.amount / 100) * (commissionRate / 100)

    logger.info('Stripe commission tracked', {
      paymentIntentId: data.paymentIntentId,
      affiliateCode,
      commission: commissionAmount,
    })

    return { affiliateCode, commission: commissionAmount }
  } catch (error) {
    logger.error('Failed to track Stripe commission', { error })
    return null
  }
}

/**
 * Generate affiliate tracking URL
 */
export function generateAffiliateUrl(baseUrl: string, affiliateCode: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('ref', affiliateCode)
  return url.toString()
}
