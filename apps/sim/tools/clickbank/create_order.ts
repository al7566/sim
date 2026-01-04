import type { ToolConfig } from '@/tools/types'
import type { ClickBankResponse } from './types'

interface CreateOrderParams {
  apiKey: string
  vendorId: string
  productId: string
  quantity?: number
  price?: number
  customerEmail?: string
  customerName?: string
  affiliateId?: string
  metadata?: string
}

export const clickbankCreateOrderTool: ToolConfig<CreateOrderParams, ClickBankResponse> = {
  id: 'clickbank_create_order',
  name: 'ClickBank Create Order',
  description: 'Create a new ClickBank order with payment link',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'ClickBank API key',
    },
    vendorId: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'ClickBank vendor ID',
    },
    productId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Product ID',
    },
    quantity: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Quantity (default: 1)',
    },
    price: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Price override in USD',
    },
    customerEmail: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Customer email address',
    },
    customerName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Customer name',
    },
    affiliateId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Affiliate ID for tracking',
    },
    metadata: {
      type: 'json',
      required: false,
      visibility: 'user-or-llm',
      description: 'Additional metadata (JSON)',
    },
  },

  request: {
    url: () => '/api/tools/clickbank/create-order',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => {
      let parsedMetadata: Record<string, string> | undefined

      if (params.metadata) {
        try {
          parsedMetadata =
            typeof params.metadata === 'string'
              ? JSON.parse(params.metadata)
              : params.metadata
        } catch {
          // Invalid JSON, ignore
        }
      }

      return {
        body: JSON.stringify({
          apiKey: params.apiKey,
          vendorId: params.vendorId,
          productId: params.productId,
          quantity: params.quantity,
          price: params.price,
          customerEmail: params.customerEmail,
          customerName: params.customerName,
          affiliateId: params.affiliateId,
          metadata: parsedMetadata,
        }),
      }
    },
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        order: data.order,
        metadata: {
          orderId: data.order?.orderId,
          receipt: data.order?.receipt,
          paymentUrl: data.order?.paymentUrl,
        },
      },
    }
  },

  outputs: {
    order: {
      type: 'json',
      description: 'Created order object',
    },
    metadata: {
      type: 'json',
      description: 'Order metadata',
    },
  },
}
