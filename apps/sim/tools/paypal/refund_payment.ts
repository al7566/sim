import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface RefundPaymentParams {
  clientId: string
  secret: string
  captureId: string
  amount?: string
  currency?: string
  note?: string
}

export const paypalRefundPaymentTool: ToolConfig<RefundPaymentParams, PayPalResponse> = {
  id: 'paypal_refund_payment',
  name: 'PayPal Refund Payment',
  description: 'Refund a captured PayPal payment',
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
    captureId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Capture ID to refund',
    },
    amount: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Refund amount (leave empty for full refund)',
    },
    currency: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Currency code',
    },
    note: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Note to payer',
    },
  },

  request: {
    url: () => '/api/tools/paypal/refund-payment',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        captureId: params.captureId,
        amount: params.amount,
        currency: params.currency,
        note: params.note,
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
          refundId: data.refund?.id,
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
