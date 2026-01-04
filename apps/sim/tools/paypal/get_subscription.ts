import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface GetSubscriptionParams {
  clientId: string
  secret: string
  subscriptionId: string
}

export const paypalGetSubscriptionTool: ToolConfig<GetSubscriptionParams, PayPalResponse> = {
  id: 'paypal_get_subscription',
  name: 'PayPal Get Subscription',
  description: 'Retrieve PayPal subscription details',
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
      description: 'Subscription ID',
    },
  },

  request: {
    url: (params) => `/api/tools/paypal/get-subscription?subscriptionId=${params.subscriptionId}`,
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
        subscription: data.subscription,
        metadata: {
          subscriptionId: data.subscription?.id,
          status: data.subscription?.status,
        },
      },
    }
  },

  outputs: {
    subscription: {
      type: 'json',
      description: 'Subscription object',
    },
    metadata: {
      type: 'json',
      description: 'Subscription metadata',
    },
  },
}
