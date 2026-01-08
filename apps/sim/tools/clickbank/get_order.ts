import type { ToolConfig } from '@/tools/types'
import type { ClickBankResponse } from './types'

interface GetOrderParams {
  apiKey: string
  vendorId: string
  receipt: string
}

export const clickbankGetOrderTool: ToolConfig<GetOrderParams, ClickBankResponse> = {
  id: 'clickbank_get_order',
  name: 'ClickBank Get Order',
  description: 'Retrieve ClickBank order details by receipt number',
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
    receipt: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Order receipt number',
    },
  },

  request: {
    url: (params) => `/api/tools/clickbank/get-order?receipt=${params.receipt}`,
    method: 'GET',
    headers: (params) => ({
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'x-vendor-id': params.vendorId,
    }),
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
          status: data.order?.status,
          amount: data.order?.amount,
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
