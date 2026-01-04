/**
 * ClickBank API and IPN types
 */

/**
 * ClickBank IPN transaction types
 */
export enum ClickBankTransactionType {
  SALE = 'SALE',
  BILL = 'BILL',
  RFND = 'RFND',
  CGBK = 'CGBK',
  INSF = 'INSF',
  CANCEL_REBILL = 'CANCEL-REBILL',
  TEST = 'TEST',
  TEST_SALE = 'TEST_SALE',
  TEST_BILL = 'TEST_BILL',
  TEST_RFND = 'TEST_RFND',
}

/**
 * ClickBank IPN notification payload
 */
export interface ClickBankIPNPayload {
  ccustname?: string
  ccuststate?: string
  ccustcc?: string
  ccustemail?: string
  ccustphone?: string
  cproditem?: string
  cprodtitle?: string
  cprodtype?: string
  ctransaction?: string
  ctransaffiliate?: string
  ctransamount?: string
  ctransreceipt?: string
  ctranstime?: string
  ctransvendor?: string
  cverify?: string
  cupsellreceipt?: string
  caccountamount?: string
  ctaxamount?: string
  cshippingamount?: string
  caffitid?: string
  crebillstatus?: string
  cnextpaymentdate?: string
  corderamount?: string
  cfuturepayments?: string
  role?: string
  crebillamount?: string
  [key: string]: string | undefined
}

/**
 * ClickBank order creation parameters
 */
export interface CreateClickBankOrderParams {
  productId: string
  quantity?: number
  price?: number
  customerEmail?: string
  customerName?: string
  affiliateId?: string
  metadata?: Record<string, string>
}

/**
 * ClickBank order response
 */
export interface ClickBankOrderResponse {
  orderId: string
  receipt: string
  paymentUrl: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

/**
 * ClickBank refund parameters
 */
export interface RefundClickBankOrderParams {
  receipt: string
  reason?: string
  amount?: number
}

/**
 * ClickBank refund response
 */
export interface ClickBankRefundResponse {
  refundId: string
  receipt: string
  amount: number
  status: string
  processedAt: string
}

/**
 * ClickBank product information
 */
export interface ClickBankProduct {
  id: string
  title: string
  price: number
  currency: string
  description?: string
  category?: string
  active: boolean
}

/**
 * ClickBank sale tracking parameters
 */
export interface TrackClickBankSaleParams {
  receipt: string
  affiliateId?: string
  amount?: number
  metadata?: Record<string, string>
}

/**
 * ClickBank webhook event
 */
export interface ClickBankWebhookEvent {
  type: ClickBankTransactionType
  receipt: string
  transactionTime: Date
  amount: number
  customerEmail?: string
  customerName?: string
  productId?: string
  productTitle?: string
  affiliateId?: string
  verified: boolean
  rawPayload: ClickBankIPNPayload
}
