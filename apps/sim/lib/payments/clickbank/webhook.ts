import { createLogger } from '@sim/logger'
import crypto from 'node:crypto'
import { env } from '@/lib/core/config/env'
import type { ClickBankIPNPayload, ClickBankTransactionType, ClickBankWebhookEvent } from './types'

const logger = createLogger('ClickBankWebhook')

/**
 * Verify ClickBank IPN signature
 */
export function verifyClickBankIPNSignature(payload: ClickBankIPNPayload): boolean {
  const secretKey = env.CLICKBANK_SECRET_KEY
  const vendorId = env.CLICKBANK_VENDOR_ID

  if (!secretKey || !vendorId) {
    logger.warn('ClickBank credentials not configured for signature verification')
    return false
  }

  try {
    const { cverify, ctransreceipt, ctransaction } = payload

    if (!cverify || !ctransreceipt) {
      logger.warn('Missing verification fields in ClickBank IPN')
      return false
    }

    // ClickBank verification formula: MD5(secretKey + transactionID + vendorID)
    const verificationString = `${secretKey}${ctransreceipt}${vendorId}`
    const calculatedHash = crypto.createHash('md5').update(verificationString).digest('hex')

    const isValid = calculatedHash.toUpperCase() === cverify.toUpperCase()

    if (!isValid) {
      logger.warn('ClickBank IPN signature verification failed', {
        receipt: ctransreceipt,
        transaction: ctransaction,
      })
    }

    return isValid
  } catch (error) {
    logger.error('Error verifying ClickBank IPN signature', { error })
    return false
  }
}

/**
 * Parse ClickBank IPN payload into a structured webhook event
 */
export function parseClickBankIPN(payload: ClickBankIPNPayload): ClickBankWebhookEvent {
  const verified = verifyClickBankIPNSignature(payload)

  const transactionType = (payload.ctransaction?.toUpperCase() ||
    'SALE') as ClickBankTransactionType
  const amount = parseFloat(payload.ctransamount || '0')
  const transactionTime = payload.ctranstime
    ? new Date(parseInt(payload.ctranstime) * 1000)
    : new Date()

  const event: ClickBankWebhookEvent = {
    type: transactionType,
    receipt: payload.ctransreceipt || '',
    transactionTime,
    amount,
    customerEmail: payload.ccustemail,
    customerName: payload.ccustname,
    productId: payload.cproditem,
    productTitle: payload.cprodtitle,
    affiliateId: payload.ctransaffiliate || payload.caffitid,
    verified,
    rawPayload: payload,
  }

  logger.info('Parsed ClickBank IPN', {
    type: event.type,
    receipt: event.receipt,
    amount: event.amount,
    verified: event.verified,
  })

  return event
}

/**
 * Handle ClickBank webhook event
 */
export async function handleClickBankWebhook(event: ClickBankWebhookEvent): Promise<void> {
  if (!event.verified) {
    logger.error('Rejecting unverified ClickBank IPN', { receipt: event.receipt })
    throw new Error('ClickBank IPN signature verification failed')
  }

  try {
    switch (event.type) {
      case 'SALE':
      case 'TEST_SALE':
        logger.info('Processing ClickBank sale', {
          receipt: event.receipt,
          amount: event.amount,
        })
        // TODO: Store transaction in database
        // TODO: Trigger workflow webhooks
        break

      case 'BILL':
      case 'TEST_BILL':
        logger.info('Processing ClickBank recurring payment', {
          receipt: event.receipt,
          amount: event.amount,
        })
        // TODO: Store transaction in database
        // TODO: Trigger workflow webhooks
        break

      case 'RFND':
      case 'TEST_RFND':
        logger.info('Processing ClickBank refund', {
          receipt: event.receipt,
          amount: event.amount,
        })
        // TODO: Update transaction in database
        // TODO: Trigger workflow webhooks
        break

      case 'CGBK':
        logger.warn('ClickBank chargeback received', {
          receipt: event.receipt,
          amount: event.amount,
        })
        // TODO: Handle chargeback
        break

      case 'INSF':
        logger.warn('ClickBank insufficient funds', {
          receipt: event.receipt,
        })
        // TODO: Handle failed payment
        break

      case 'CANCEL-REBILL':
        logger.info('ClickBank subscription cancelled', {
          receipt: event.receipt,
        })
        // TODO: Update subscription status
        break

      default:
        logger.warn('Unknown ClickBank transaction type', {
          type: event.type,
          receipt: event.receipt,
        })
    }
  } catch (error) {
    logger.error('Error handling ClickBank webhook', { error, receipt: event.receipt })
    throw error
  }
}
