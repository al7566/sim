/**
 * PayPal tool types
 */

export interface PayPalOrderData {
  id: string
  status: string
  purchase_units: any[]
  links: Array<{
    href: string
    rel: string
    method: string
  }>
  create_time: string
  update_time?: string
}

export interface PayPalCaptureData {
  id: string
  status: string
  amount: {
    currency_code: string
    value: string
  }
  create_time: string
  update_time: string
}

export interface PayPalRefundData {
  id: string
  status: string
  amount: {
    currency_code: string
    value: string
  }
  create_time: string
  update_time: string
}

export interface PayPalSubscriptionData {
  id: string
  plan_id: string
  status: string
  start_time: string
  create_time: string
  update_time: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

export interface PayPalProductData {
  id: string
  name: string
  description?: string
  type: string
  category?: string
  image_url?: string
  home_url?: string
  create_time: string
  update_time: string
}

export type PayPalResponse = {
  order?: PayPalOrderData
  orders?: PayPalOrderData[]
  capture?: PayPalCaptureData
  refund?: PayPalRefundData
  subscription?: PayPalSubscriptionData
  subscriptions?: PayPalSubscriptionData[]
  product?: PayPalProductData
  products?: PayPalProductData[]
  metadata?: Record<string, any>
}
