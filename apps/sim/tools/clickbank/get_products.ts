import type { ToolConfig } from '@/tools/types'
import type { ClickBankResponse } from './types'

interface GetProductsParams {
  apiKey: string
  vendorId: string
}

export const clickbankGetProductsTool: ToolConfig<GetProductsParams, ClickBankResponse> = {
  id: 'clickbank_get_products',
  name: 'ClickBank Get Products',
  description: 'List all ClickBank products',
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
  },

  request: {
    url: () => '/api/tools/clickbank/get-products',
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
        products: data.products || [],
        metadata: {
          count: data.products?.length || 0,
        },
      },
    }
  },

  outputs: {
    products: {
      type: 'json',
      description: 'Array of product objects',
    },
    metadata: {
      type: 'json',
      description: 'Products metadata',
    },
  },
}
