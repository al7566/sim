import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface CancelSubscriptionParams {
  clientId: string
  secret: string
  subscriptionId: string
  reason?: string
}

export const paypalCancelSubscriptionTool: ToolConfig<CancelSubscriptionParams, PayPalResponse> = {
  id: 'paypal_cancel_subscription',
  name: 'PayPal Cancel Subscription',
  description: 'Cancel a PayPal subscription',
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
    subscriptionId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Subscription ID to cancel',
    },
    reason: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Cancellation reason',
    },
  },

  request: {
    url: () => '/api/tools/paypal/cancel-subscription',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        subscriptionId: params.subscriptionId,
        reason: params.reason,
      }),
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        metadata: {
          subscriptionId: data.subscriptionId,
          cancelled: true,
        },
      },
    }
  },

  outputs: {
    metadata: {
      type: 'json',
      description: 'Cancellation metadata',
    },
  },
}
