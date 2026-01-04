import { PayPalIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { PayPalResponse } from '@/tools/paypal/types'

export const PayPalBlock: BlockConfig<PayPalResponse> = {
  type: 'paypal',
  name: 'PayPal',
  description: 'Process payments and manage PayPal transactions',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrates PayPal payment processing into workflows. Create and capture orders, process refunds, manage subscriptions, and create products for billing plans.',
  docsLink: 'https://docs.sim.ai/tools/paypal',
  category: 'tools',
  bgColor: '#0070BA',
  icon: PayPalIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Create Order', id: 'create_order' },
        { label: 'Capture Order', id: 'capture_order' },
        { label: 'Get Order', id: 'get_order' },
        { label: 'Refund Payment', id: 'refund_payment' },
        { label: 'Create Subscription', id: 'create_subscription' },
        { label: 'Cancel Subscription', id: 'cancel_subscription' },
        { label: 'Get Subscription', id: 'get_subscription' },
        { label: 'Create Product', id: 'create_product' },
      ],
      value: () => 'create_order',
    },
    {
      id: 'clientId',
      title: 'PayPal Client ID',
      type: 'short-input',
      placeholder: 'Enter your PayPal Client ID',
      required: true,
    },
    {
      id: 'secret',
      title: 'PayPal Secret',
      type: 'short-input',
      password: true,
      placeholder: 'Enter your PayPal Secret',
      required: true,
    },
    {
      id: 'amount',
      title: 'Amount',
      type: 'short-input',
      placeholder: 'e.g., 10.00',
      condition: {
        field: 'operation',
        value: ['create_order', 'refund_payment'],
      },
      required: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'currency',
      title: 'Currency',
      type: 'short-input',
      placeholder: 'e.g., USD, EUR, GBP',
      condition: {
        field: 'operation',
        value: ['create_order', 'refund_payment'],
      },
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Order description',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'orderId',
      title: 'Order ID',
      type: 'short-input',
      placeholder: 'Enter order ID',
      condition: {
        field: 'operation',
        value: ['capture_order', 'get_order'],
      },
      required: true,
    },
    {
      id: 'captureId',
      title: 'Capture ID',
      type: 'short-input',
      placeholder: 'Enter capture ID',
      condition: {
        field: 'operation',
        value: 'refund_payment',
      },
      required: true,
    },
    {
      id: 'note',
      title: 'Note to Payer',
      type: 'long-input',
      placeholder: 'Refund reason',
      condition: {
        field: 'operation',
        value: 'refund_payment',
      },
    },
    {
      id: 'planId',
      title: 'Plan ID',
      type: 'short-input',
      placeholder: 'Enter billing plan ID',
      condition: {
        field: 'operation',
        value: 'create_subscription',
      },
      required: true,
    },
    {
      id: 'subscriptionId',
      title: 'Subscription ID',
      type: 'short-input',
      placeholder: 'Enter subscription ID',
      condition: {
        field: 'operation',
        value: ['cancel_subscription', 'get_subscription'],
      },
      required: true,
    },
    {
      id: 'reason',
      title: 'Cancellation Reason',
      type: 'long-input',
      placeholder: 'Reason for cancellation',
      condition: {
        field: 'operation',
        value: 'cancel_subscription',
      },
    },
    {
      id: 'name',
      title: 'Product Name',
      type: 'short-input',
      placeholder: 'Enter product name',
      condition: {
        field: 'operation',
        value: 'create_product',
      },
      required: true,
    },
    {
      id: 'type',
      title: 'Product Type',
      type: 'dropdown',
      options: [
        { label: 'Physical', id: 'PHYSICAL' },
        { label: 'Digital', id: 'DIGITAL' },
        { label: 'Service', id: 'SERVICE' },
      ],
      condition: {
        field: 'operation',
        value: 'create_product',
      },
      required: true,
    },
    {
      id: 'category',
      title: 'Category',
      type: 'short-input',
      placeholder: 'Product category',
      condition: {
        field: 'operation',
        value: 'create_product',
      },
    },
    {
      id: 'imageUrl',
      title: 'Image URL',
      type: 'short-input',
      placeholder: 'Product image URL',
      condition: {
        field: 'operation',
        value: 'create_product',
      },
    },
    {
      id: 'homeUrl',
      title: 'Home URL',
      type: 'short-input',
      placeholder: 'Product home page URL',
      condition: {
        field: 'operation',
        value: 'create_product',
      },
    },
    {
      id: 'returnUrl',
      title: 'Return URL',
      type: 'short-input',
      placeholder: 'URL to return after completion',
      condition: {
        field: 'operation',
        value: ['create_order', 'create_subscription'],
      },
    },
    {
      id: 'cancelUrl',
      title: 'Cancel URL',
      type: 'short-input',
      placeholder: 'URL to return on cancellation',
      condition: {
        field: 'operation',
        value: ['create_order', 'create_subscription'],
      },
    },
  ],
  tools: {
    access: [
      'paypal_create_order',
      'paypal_capture_order',
      'paypal_get_order',
      'paypal_refund_payment',
      'paypal_create_subscription',
      'paypal_cancel_subscription',
      'paypal_get_subscription',
      'paypal_create_product',
    ],
    config: {
      tool: (params) => {
        return `paypal_${params.operation}`
      },
      params: (params) => {
        const { operation, ...rest } = params
        return rest
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    clientId: { type: 'string', description: 'PayPal Client ID' },
    secret: { type: 'string', description: 'PayPal Secret' },
    amount: { type: 'string', description: 'Payment amount' },
    currency: { type: 'string', description: 'Currency code' },
    description: { type: 'string', description: 'Order description' },
    orderId: { type: 'string', description: 'Order ID' },
    captureId: { type: 'string', description: 'Capture ID' },
    note: { type: 'string', description: 'Note to payer' },
    planId: { type: 'string', description: 'Billing plan ID' },
    subscriptionId: { type: 'string', description: 'Subscription ID' },
    reason: { type: 'string', description: 'Cancellation reason' },
    name: { type: 'string', description: 'Product name' },
    type: { type: 'string', description: 'Product type' },
    category: { type: 'string', description: 'Product category' },
    imageUrl: { type: 'string', description: 'Product image URL' },
    homeUrl: { type: 'string', description: 'Product home URL' },
    returnUrl: { type: 'string', description: 'Return URL' },
    cancelUrl: { type: 'string', description: 'Cancel URL' },
  },
  outputs: {
    order: { type: 'json', description: 'Order object' },
    capture: { type: 'json', description: 'Capture object' },
    refund: { type: 'json', description: 'Refund object' },
    subscription: { type: 'json', description: 'Subscription object' },
    product: { type: 'json', description: 'Product object' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
