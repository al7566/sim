import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface CreateOrderParams {
  clientId: string
  secret: string
  amount: string
  currency?: string
  description?: string
  returnUrl?: string
  cancelUrl?: string
}

export const paypalCreateOrderTool: ToolConfig<CreateOrderParams, PayPalResponse> = {
  id: 'paypal_create_order',
  name: 'PayPal Create Order',
  description: 'Create a new PayPal order',
  version: '1.0.0',

  params: {
    clientId: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'PayPal Client ID',
    },
    secret: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'PayPal Secret',
    },
    amount: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Order amount (e.g., "10.00")',
    },
    currency: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Currency code (default: USD)',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Order description',
    },
    returnUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Return URL after payment',
    },
    cancelUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Cancel URL',
    },
  },

  request: {
    url: () => '/api/tools/paypal/create-order',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        amount: params.amount,
        currency: params.currency || 'USD',
        description: params.description,
        returnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
      }),
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        order: data.order,
        metadata: {
          orderId: data.order?.id,
          status: data.order?.status,
          approvalUrl: data.order?.links?.find((l: any) => l.rel === 'approve')?.href,
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
