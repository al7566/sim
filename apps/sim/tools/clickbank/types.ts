/**
 * ClickBank tool types
 */

export interface ClickBankOrderData {
  orderId: string
  receipt: string
  paymentUrl?: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export interface ClickBankProductData {
  id: string
  title: string
  price: number
  currency: string
  description?: string
  category?: string
  active: boolean
}

export interface ClickBankRefundData {
  refundId: string
  receipt: string
  amount: number
  status: string
  processedAt: string
}

export type ClickBankResponse = {
  order?: ClickBankOrderData
  orders?: ClickBankOrderData[]
  product?: ClickBankProductData
  products?: ClickBankProductData[]
  refund?: ClickBankRefundData
  metadata?: Record<string, any>
}
