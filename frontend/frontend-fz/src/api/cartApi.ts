import type { ApiSuccessResponse } from '../types/api'
import type { CartState } from '../types/cart'
import type { AddCartItemRequest, UpdateCartItemRequest } from '../types/contracts'
import { mockProducts } from '../data/mockProducts'
import { apiConfig } from './config'
import { withMockLatency } from './mockApi'
import { privateApi } from './httpClient'

interface ApiCartItem {
  id: string
  productId: string
  name: string
  bottleSizeMl: number
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface ApiCart {
  id: string
  userId: string
  items: ApiCartItem[]
  subtotal: number
}

const EMPTY_CART: CartState = {
  id: 'cart-local',
  userId: 'guest',
  items: [],
  subtotal: 0,
}

let mockCart: ApiCart = {
  id: 'cart-mock',
  userId: 'user-1',
  items: [],
  subtotal: 0,
}

function recalculateMockCart() {
  mockCart = {
    ...mockCart,
    items: mockCart.items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    })),
  }

  mockCart.subtotal = mockCart.items.reduce((sum, item) => sum + item.lineTotal, 0)
}

function toCartState(cart: ApiCart): CartState {
  return {
    id: cart.id,
    userId: cart.userId,
    subtotal: cart.subtotal,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      bottleSizeMl: item.bottleSizeMl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  }
}

export const cartApi = {
  emptyCart(): CartState {
    return {
      ...EMPTY_CART,
      items: [],
    }
  },

  async getCart(): Promise<ApiSuccessResponse<CartState>> {
    if (apiConfig.useMockApi) {
      recalculateMockCart()
      return withMockLatency(toCartState(mockCart))
    }

    const response = await privateApi.get<ApiSuccessResponse<ApiCart>>('/api/cart')
    return {
      ...response.data,
      data: toCartState(response.data.data),
    }
  },

  async clearCart(): Promise<ApiSuccessResponse<CartState>> {
    if (apiConfig.useMockApi) {
      mockCart = {
        ...mockCart,
        items: [],
        subtotal: 0,
      }
      return withMockLatency(toCartState(mockCart))
    }

    const response = await privateApi.delete<ApiSuccessResponse<ApiCart>>('/api/cart')
    return {
      ...response.data,
      data: toCartState(response.data.data),
    }
  },

  async addItem(payload: AddCartItemRequest): Promise<ApiSuccessResponse<CartState>> {
    if (apiConfig.useMockApi) {
      const product = mockProducts.find((item) => item.id === payload.productId)
      if (!product) {
        throw new Error('Product not found')
      }

      const existing = mockCart.items.find((item) => item.productId === payload.productId)
      if (existing) {
        existing.quantity += payload.quantity
      } else {
        mockCart.items.push({
          id: `cart-item-${payload.productId}`,
          productId: product.id,
          name: product.name,
          bottleSizeMl: product.bottleSizeMl,
          quantity: payload.quantity,
          unitPrice: product.price,
          lineTotal: payload.quantity * product.price,
        })
      }

      recalculateMockCart()
      return withMockLatency(toCartState(mockCart))
    }

    const response = await privateApi.post<ApiSuccessResponse<ApiCart>>('/api/cart/items', payload)
    return {
      ...response.data,
      data: toCartState(response.data.data),
    }
  },

  async updateItemQuantity(
    cartItemId: string,
    payload: UpdateCartItemRequest,
  ): Promise<ApiSuccessResponse<CartState>> {
    if (apiConfig.useMockApi) {
      mockCart.items = mockCart.items
        .map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity: payload.quantity,
              }
            : item,
        )
        .filter((item) => item.quantity > 0)

      recalculateMockCart()
      return withMockLatency(toCartState(mockCart))
    }

    const response = await privateApi.patch<ApiSuccessResponse<ApiCart>>(
      `/api/cart/items/${cartItemId}`,
      payload,
    )
    return {
      ...response.data,
      data: toCartState(response.data.data),
    }
  },

  async removeItem(cartItemId: string): Promise<ApiSuccessResponse<CartState>> {
    if (apiConfig.useMockApi) {
      mockCart.items = mockCart.items.filter((item) => item.id !== cartItemId)
      recalculateMockCart()
      return withMockLatency(toCartState(mockCart))
    }

    const response = await privateApi.delete<ApiSuccessResponse<ApiCart>>(`/api/cart/items/${cartItemId}`)
    return {
      ...response.data,
      data: toCartState(response.data.data),
    }
  },
}
