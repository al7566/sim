import { ClickBankIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { ClickBankResponse } from '@/tools/clickbank/types'

export const ClickBankBlock: BlockConfig<ClickBankResponse> = {
  type: 'clickbank',
  name: 'ClickBank',
  description: 'Process payments and manage ClickBank orders',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrates ClickBank payment processing into workflows. Create orders, retrieve order details, process refunds, list products, and track affiliate sales.',
  docsLink: 'https://docs.sim.ai/tools/clickbank',
  category: 'tools',
  bgColor: '#0066CC',
  icon: ClickBankIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Create Order', id: 'create_order' },
        { label: 'Get Order', id: 'get_order' },
        { label: 'Refund Order', id: 'refund_order' },
        { label: 'List Products', id: 'get_products' },
        { label: 'Track Sale', id: 'track_sale' },
      ],
      value: () => 'create_order',
    },
    {
      id: 'apiKey',
      title: 'ClickBank API Key',
      type: 'short-input',
      password: true,
      placeholder: 'Enter your ClickBank API key',
      required: true,
    },
    {
      id: 'vendorId',
      title: 'Vendor ID',
      type: 'short-input',
      placeholder: 'Enter your ClickBank vendor ID',
      required: true,
    },
    {
      id: 'productId',
      title: 'Product ID',
      type: 'short-input',
      placeholder: 'Enter product ID',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
      required: true,
    },
    {
      id: 'receipt',
      title: 'Receipt Number',
      type: 'short-input',
      placeholder: 'Enter receipt number',
      condition: {
        field: 'operation',
        value: ['get_order', 'refund_order', 'track_sale'],
      },
      required: true,
    },
    {
      id: 'quantity',
      title: 'Quantity',
      type: 'short-input',
      placeholder: '1',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'price',
      title: 'Price Override (USD)',
      type: 'short-input',
      placeholder: 'Leave empty to use default price',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'customerEmail',
      title: 'Customer Email',
      type: 'short-input',
      placeholder: 'customer@example.com',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'customerName',
      title: 'Customer Name',
      type: 'short-input',
      placeholder: 'John Doe',
      condition: {
        field: 'operation',
        value: 'create_order',
      },
    },
    {
      id: 'affiliateId',
      title: 'Affiliate ID',
      type: 'short-input',
      placeholder: 'Affiliate ID for tracking',
      condition: {
        field: 'operation',
        value: ['create_order', 'track_sale'],
      },
    },
    {
      id: 'reason',
      title: 'Refund Reason',
      type: 'long-input',
      placeholder: 'Enter refund reason',
      condition: {
        field: 'operation',
        value: 'refund_order',
      },
    },
    {
      id: 'amount',
      title: 'Refund Amount (USD)',
      type: 'short-input',
      placeholder: 'Leave empty for full refund',
      condition: {
        field: 'operation',
        value: ['refund_order', 'track_sale'],
      },
    },
    {
      id: 'metadata',
      title: 'Metadata (JSON)',
      type: 'code',
      placeholder: '{"key": "value"}',
      condition: {
        field: 'operation',
        value: ['create_order', 'track_sale'],
      },
    },
  ],
  tools: {
    access: [
      'clickbank_create_order',
      'clickbank_get_order',
      'clickbank_refund_order',
      'clickbank_get_products',
      'clickbank_track_sale',
    ],
    config: {
      tool: (params) => {
        return `clickbank_${params.operation}`
      },
      params: (params) => {
        const { operation, metadata, ...rest } = params

        let parsedMetadata: any | undefined

        try {
          if (metadata) parsedMetadata = JSON.parse(metadata)
        } catch (error: any) {
          throw new Error(`Invalid JSON input: ${error.message}`)
        }

        return {
          ...rest,
          ...(parsedMetadata && { metadata: parsedMetadata }),
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'ClickBank API key' },
    vendorId: { type: 'string', description: 'ClickBank vendor ID' },
    productId: { type: 'string', description: 'Product ID' },
    receipt: { type: 'string', description: 'Order receipt number' },
    quantity: { type: 'number', description: 'Order quantity' },
    price: { type: 'number', description: 'Price override in USD' },
    customerEmail: { type: 'string', description: 'Customer email address' },
    customerName: { type: 'string', description: 'Customer name' },
    affiliateId: { type: 'string', description: 'Affiliate ID for tracking' },
    reason: { type: 'string', description: 'Refund reason' },
    amount: { type: 'number', description: 'Amount in USD' },
    metadata: { type: 'json', description: 'Additional metadata' },
  },
  outputs: {
    order: { type: 'json', description: 'Order object' },
    orders: { type: 'json', description: 'Array of orders' },
    product: { type: 'json', description: 'Product object' },
    products: { type: 'json', description: 'Array of products' },
    refund: { type: 'json', description: 'Refund object' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
