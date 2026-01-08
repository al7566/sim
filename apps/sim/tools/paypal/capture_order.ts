import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface CaptureOrderParams {
  clientId: string
  secret: string
  orderId: string
}

export const paypalCaptureOrderTool: ToolConfig<CaptureOrderParams, PayPalResponse> = {
  id: 'paypal_capture_order',
  name: 'PayPal Capture Order',
  description: 'Capture payment for an approved PayPal order',
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
      description: 'Order ID to capture',
    },
  },

  request: {
    url: () => '/api/tools/paypal/capture-order',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        orderId: params.orderId,
      }),
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        capture: data.capture,
        metadata: {
          captureId: data.capture?.id,
          status: data.capture?.status,
        },
      },
    }
  },

  outputs: {
    capture: {
      type: 'json',
      description: 'Capture object',
    },
    metadata: {
      type: 'json',
      description: 'Capture metadata',
    },
  },
}
