import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface GetOrderParams {
  clientId: string
  secret: string
  orderId: string
}

export const paypalGetOrderTool: ToolConfig<GetOrderParams, PayPalResponse> = {
  id: 'paypal_get_order',
  name: 'PayPal Get Order',
  description: 'Retrieve PayPal order details',
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
    orderId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Order ID',
    },
  },

  request: {
    url: (params) => `/api/tools/paypal/get-order?orderId=${params.orderId}`,
    method: 'GET',
    headers: (params) => ({
      'Content-Type': 'application/json',
      'x-client-id': params.clientId,
      'x-secret': params.secret,
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
        },
      },
    }
  },

  outputs: {
    order: {
      type: 'json',
      description: 'Order object',
    },
    metadata: {
      type: 'json',
      description: 'Order metadata',
    },
  },
}
