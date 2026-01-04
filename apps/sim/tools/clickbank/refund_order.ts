import type { ToolConfig } from '@/tools/types'
import type { ClickBankResponse } from './types'

interface RefundOrderParams {
  apiKey: string
  vendorId: string
  receipt: string
  reason?: string
  amount?: number
}

export const clickbankRefundOrderTool: ToolConfig<RefundOrderParams, ClickBankResponse> = {
  id: 'clickbank_refund_order',
  name: 'ClickBank Refund Order',
  description: 'Process a refund for a ClickBank order',
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
    reason: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Refund reason',
    },
    amount: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Partial refund amount (leave empty for full refund)',
    },
  },

  request: {
    url: () => '/api/tools/clickbank/refund-order',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        apiKey: params.apiKey,
        vendorId: params.vendorId,
        receipt: params.receipt,
        reason: params.reason,
        amount: params.amount,
      }),
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        refund: data.refund,
        metadata: {
          refundId: data.refund?.refundId,
          receipt: data.refund?.receipt,
          amount: data.refund?.amount,
          status: data.refund?.status,
        },
      },
    }
  },

  outputs: {
    refund: {
      type: 'json',
      description: 'Refund object',
    },
    metadata: {
      type: 'json',
      description: 'Refund metadata',
    },
  },
}
