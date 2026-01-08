import type { ToolConfig } from '@/tools/types'
import type { PayPalResponse } from './types'

interface CreateProductParams {
  clientId: string
  secret: string
  name: string
  description?: string
  type: string
  category?: string
  imageUrl?: string
  homeUrl?: string
}

export const paypalCreateProductTool: ToolConfig<CreateProductParams, PayPalResponse> = {
  id: 'paypal_create_product',
  name: 'PayPal Create Product',
  description: 'Create a new PayPal product',
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
    name: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Product name',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Product description',
    },
    type: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Product type (PHYSICAL, DIGITAL, or SERVICE)',
    },
    category: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Product category',
    },
    imageUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Product image URL',
    },
    homeUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Product home URL',
    },
  },

  request: {
    url: () => '/api/tools/paypal/create-product',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      body: JSON.stringify({
        clientId: params.clientId,
        secret: params.secret,
        name: params.name,
        description: params.description,
        type: params.type,
        category: params.category,
        imageUrl: params.imageUrl,
        homeUrl: params.homeUrl,
      }),
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    return {
      success: true,
      output: {
        product: data.product,
        metadata: {
          productId: data.product?.id,
          name: data.product?.name,
        },
      },
    }
  },

  outputs: {
    product: {
      type: 'json',
      description: 'Product object',
    },
    metadata: {
      type: 'json',
      description: 'Product metadata',
    },
  },
}
