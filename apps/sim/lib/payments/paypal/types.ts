/**
 * PayPal API types
 */

/**
 * PayPal order status
 */
export enum PayPalOrderStatus {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  APPROVED = 'APPROVED',
  VOIDED = 'VOIDED',
  COMPLETED = 'COMPLETED',
  PAYER_ACTION_REQUIRED = 'PAYER_ACTION_REQUIRED',
}

/**
 * PayPal subscription status
 */
export enum PayPalSubscriptionStatus {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * PayPal webhook event types
 */
export enum PayPalWebhookEventType {
  PAYMENT_CAPTURE_COMPLETED = 'PAYMENT.CAPTURE.COMPLETED',
  PAYMENT_CAPTURE_DENIED = 'PAYMENT.CAPTURE.DENIED',
  PAYMENT_CAPTURE_PENDING = 'PAYMENT.CAPTURE.PENDING',
  PAYMENT_CAPTURE_REFUNDED = 'PAYMENT.CAPTURE.REFUNDED',
  PAYMENT_CAPTURE_REVERSED = 'PAYMENT.CAPTURE.REVERSED',
  BILLING_SUBSCRIPTION_CREATED = 'BILLING.SUBSCRIPTION.CREATED',
  BILLING_SUBSCRIPTION_ACTIVATED = 'BILLING.SUBSCRIPTION.ACTIVATED',
  BILLING_SUBSCRIPTION_UPDATED = 'BILLING.SUBSCRIPTION.UPDATED',
  BILLING_SUBSCRIPTION_EXPIRED = 'BILLING.SUBSCRIPTION.EXPIRED',
  BILLING_SUBSCRIPTION_CANCELLED = 'BILLING.SUBSCRIPTION.CANCELLED',
  BILLING_SUBSCRIPTION_SUSPENDED = 'BILLING.SUBSCRIPTION.SUSPENDED',
  BILLING_SUBSCRIPTION_PAYMENT_FAILED = 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
}

/**
 * PayPal order amount
 */
export interface PayPalAmount {
  currency_code: string
  value: string
}

/**
 * PayPal purchase unit
 */
export interface PayPalPurchaseUnit {
  reference_id?: string
  amount: PayPalAmount
  payee?: {
    email_address?: string
    merchant_id?: string
  }
  description?: string
  custom_id?: string
  invoice_id?: string
}

/**
 * PayPal order creation parameters
 */
export interface CreatePayPalOrderParams {
  intent?: 'CAPTURE' | 'AUTHORIZE'
  purchase_units: PayPalPurchaseUnit[]
  application_context?: {
    return_url?: string
    cancel_url?: string
    brand_name?: string
    locale?: string
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE'
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS'
    user_action?: 'CONTINUE' | 'PAY_NOW'
  }
}

/**
 * PayPal order response
 */
export interface PayPalOrderResponse {
  id: string
  status: PayPalOrderStatus
  purchase_units: PayPalPurchaseUnit[]
  links: Array<{
    href: string
    rel: string
    method: string
  }>
  create_time: string
  update_time?: string
}

/**
 * PayPal capture response
 */
export interface PayPalCaptureResponse {
  id: string
  status: string
  amount: PayPalAmount
  create_time: string
  update_time: string
}

/**
 * PayPal refund parameters
 */
export interface RefundPayPalPaymentParams {
  captureId: string
  amount?: PayPalAmount
  note_to_payer?: string
}

/**
 * PayPal refund response
 */
export interface PayPalRefundResponse {
  id: string
  status: string
  amount: PayPalAmount
  create_time: string
  update_time: string
}

/**
 * PayPal subscription plan
 */
export interface PayPalSubscriptionPlan {
  id: string
  product_id: string
  name: string
  description?: string
  status: string
  billing_cycles: Array<{
    frequency: {
      interval_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
      interval_count: number
    }
    tenure_type: 'REGULAR' | 'TRIAL'
    sequence: number
    total_cycles: number
    pricing_scheme: {
      fixed_price: PayPalAmount
    }
  }>
}

/**
 * PayPal subscription creation parameters
 */
export interface CreatePayPalSubscriptionParams {
  plan_id: string
  start_time?: string
  quantity?: string
  application_context?: {
    brand_name?: string
    locale?: string
    return_url?: string
    cancel_url?: string
  }
}

/**
 * PayPal subscription response
 */
export interface PayPalSubscriptionResponse {
  id: string
  plan_id: string
  status: PayPalSubscriptionStatus
  start_time: string
  create_time: string
  update_time: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

/**
 * PayPal product creation parameters
 */
export interface CreatePayPalProductParams {
  name: string
  description?: string
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
  category?: string
  image_url?: string
  home_url?: string
}

/**
 * PayPal product response
 */
export interface PayPalProductResponse {
  id: string
  name: string
  description?: string
  type: string
  category?: string
  image_url?: string
  home_url?: string
  create_time: string
  update_time: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

/**
 * PayPal webhook event
 */
export interface PayPalWebhookEvent {
  id: string
  event_type: PayPalWebhookEventType
  create_time: string
  resource_type: string
  resource: any
  summary: string
  verified: boolean
}
