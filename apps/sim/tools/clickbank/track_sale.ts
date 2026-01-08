import type { ToolConfig } from '@/tools/types'
import type { ClickBankResponse } from './types'

interface TrackSaleParams {
  apiKey: string
  vendorId: string
  receipt: string
  affiliateId?: string
  amount?: number
  metadata?: string
}

export const clickbankTrackSaleTool: ToolConfig<TrackSaleParams, ClickBankResponse> = {
  id: 'clickbank_track_sale',
  name: 'ClickBank Track Sale',
  description: 'Track affiliate sale for ClickBank order',
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
    affiliateId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Affiliate ID',
    },
    amount: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Sale amount in USD',
    },
    metadata: {
      type: 'json',
      required: false,
      visibility: 'user-or-llm',
      description: 'Additional tracking metadata (JSON)',
    },
  },

  request: {
    url: () => '/api/tools/clickbank/track-sale',
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
          receipt: params.receipt,
          affiliateId: params.affiliateId,
          amount: params.amount,
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
        metadata: {
          tracked: true,
          receipt: data.receipt,
          affiliateId: data.affiliateId,
          amount: data.amount,
        },
      },
    }
  },

  outputs: {
    metadata: {
      type: 'json',
      description: 'Tracking metadata',
    },
  },
}
