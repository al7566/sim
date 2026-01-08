import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface CreateSubscriptionParams {
  clientId: string
  secret: string
  planId: string
  returnUrl?: string
  cancelUrl?: string
}

export const paypalCreateSubscriptionTool: ToolConfig<CreateSubscriptionParams, PayPalResponse> = {
  id: 'paypal_create_subscription',
  name: 'PayPal Create Subscription',
  description: 'Create a new PayPal subscription',
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
    planId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Billing plan ID',
    },
    returnUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Return URL after subscription approval',
    },
    cancelUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Cancel URL',
    },
  },

  request: {
    url: () => '/api/tools/paypal/create-subscription',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        planId: params.planId,
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
        subscription: data.subscription,
        metadata: {
          subscriptionId: data.subscription?.id,
          status: data.subscription?.status,
          approvalUrl: data.subscription?.links?.find((l: any) => l.rel === 'approve')?.href,
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
