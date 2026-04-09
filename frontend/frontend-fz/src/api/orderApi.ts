import type { ApiSuccessResponse, PaginatedResult } from '../types/api'
import type { Order, OrderStatus } from '../types/order'
import type { CheckoutRequest, MyOrdersQuery } from '../types/contracts'
import { mockOrders } from '../data/mockOrders'
import { apiConfig } from './config'
import { withMockLatency } from './mockApi'
import { privateApi } from './httpClient'

type OrderSortByApi = 'NEWEST' | 'AMOUNT'
type AdminOrderSortByApi = 'NEWEST' | 'AMOUNT' | 'STATUS'

type AdminOrdersQuery = {
  page: number
  size: number
  status?: 'ALL' | OrderStatus
  userId?: string
  fromDate?: string
  toDate?: string
  sortBy?: 'newest' | 'amount' | 'status'
}

const mockOrderStore: Order[] = mockOrders.map((order) => ({
  ...order,
  items: order.items.map((item) => ({ ...item })),
}))

interface MyOrdersApiQuery {
  page: number
  size: number
  status?: OrderStatus
  sortBy?: OrderSortByApi
}

interface AdminOrdersApiQuery {
  page: number
  size: number
  status?: OrderStatus
  userId?: string
  fromDate?: string
  toDate?: string
  sortBy?: AdminOrderSortByApi
}

interface PlaceOrderMockContext {
  userId: string
  items: Order['items']
  totalAmount: number
}

function toMyOrdersApiQuery(query: MyOrdersQuery): MyOrdersApiQuery {
  const sortByMap: Record<NonNullable<MyOrdersQuery['sortBy']>, OrderSortByApi> = {
    newest: 'NEWEST',
    amount: 'AMOUNT',
  }

  return {
    page: query.page,
    size: query.size,
    status: query.status && query.status !== 'ALL' ? query.status : undefined,
    sortBy: query.sortBy ? sortByMap[query.sortBy] : undefined,
  }
}

function toAdminOrdersApiQuery(query: AdminOrdersQuery): AdminOrdersApiQuery {
  const sortByMap: Record<NonNullable<AdminOrdersQuery['sortBy']>, AdminOrderSortByApi> = {
    newest: 'NEWEST',
    amount: 'AMOUNT',
    status: 'STATUS',
  }

  return {
    page: query.page,
    size: query.size,
    status: query.status && query.status !== 'ALL' ? query.status : undefined,
    userId: query.userId,
    fromDate: query.fromDate,
    toDate: query.toDate,
    sortBy: query.sortBy ? sortByMap[query.sortBy] : undefined,
  }
}

function applyOrderQuery(
  orders: Order[],
  userId: string | undefined,
  query: MyOrdersApiQuery,
): PaginatedResult<Order> {
  let filtered = userId ? orders.filter((order) => order.userId === userId) : [...orders]

  if (query.status) {
    filtered = filtered.filter((order) => order.status === query.status)
  }

  if (query.sortBy === 'AMOUNT') {
    filtered = filtered.sort((a, b) => b.totalAmount - a.totalAmount)
  } else {
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const page = Math.max(query.page, 1)
  const size = Math.max(query.size, 1)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (page - 1) * size

  return {
    items: filtered.slice(start, start + size),
    total,
    page,
    size,
    totalPages,
  }
}

function applyAdminOrderQuery(orders: Order[], query: AdminOrdersApiQuery): PaginatedResult<Order> {
  let filtered = [...orders]

  if (query.status) {
    filtered = filtered.filter((order) => order.status === query.status)
  }

  if (query.userId?.trim()) {
    filtered = filtered.filter((order) => order.userId === query.userId)
  }

  if (query.fromDate) {
    const from = new Date(`${query.fromDate}T00:00:00`).getTime()
    filtered = filtered.filter((order) => new Date(order.createdAt).getTime() >= from)
  }

  if (query.toDate) {
    const to = new Date(`${query.toDate}T23:59:59`).getTime()
    filtered = filtered.filter((order) => new Date(order.createdAt).getTime() <= to)
  }

  switch (query.sortBy) {
    case 'AMOUNT':
      filtered = filtered.sort((a, b) => b.totalAmount - a.totalAmount)
      break
    case 'STATUS':
      filtered = filtered.sort((a, b) => a.status.localeCompare(b.status))
      break
    case 'NEWEST':
    default:
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  const page = Math.max(query.page, 1)
  const size = Math.max(query.size, 1)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (page - 1) * size

  return {
    items: filtered.slice(start, start + size),
    total,
    page,
    size,
    totalPages,
  }
}

export const orderApi = {
  async placeOrder(
    payload: CheckoutRequest,
    mockContext?: PlaceOrderMockContext,
  ): Promise<ApiSuccessResponse<Order>> {
    if (apiConfig.useMockApi) {
      const now = new Date().toISOString()
      const sequence = String(mockOrderStore.length + 1).padStart(3, '0')
      const monthKey = new Date().toISOString().slice(0, 7).replace('-', '')

      const order: Order = {
        id: `ord-${mockOrderStore.length + 1}`,
        orderNumber: `FRZ-${monthKey}-${sequence}`,
        userId: mockContext?.userId ?? 'user-1',
        status: 'PLACED',
        totalAmount: mockContext?.totalAmount ?? 0,
        deliveryAddress: payload.deliveryAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        createdAt: now,
        items: mockContext?.items ?? [],
      }

      mockOrderStore.unshift(order)
      return withMockLatency(order, 'Order placed successfully')
    }

    const response = await privateApi.post<ApiSuccessResponse<Order>>('/api/orders', payload)
    return response.data
  },

  async listMyOrders(query: MyOrdersQuery): Promise<ApiSuccessResponse<PaginatedResult<Order>>> {
    const apiQuery = toMyOrdersApiQuery(query)

    if (apiConfig.useMockApi) {
      return withMockLatency(applyOrderQuery([...mockOrderStore], query.userId, apiQuery))
    }

    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<Order>>>('/api/orders', {
      params: apiQuery,
    })
    return response.data
  },

  async listAllOrders(query: AdminOrdersQuery): Promise<ApiSuccessResponse<PaginatedResult<Order>>> {
    const apiQuery = toAdminOrdersApiQuery(query)

    if (apiConfig.useMockApi) {
      return withMockLatency(applyAdminOrderQuery([...mockOrderStore], apiQuery))
    }

    const response = await privateApi.get<ApiSuccessResponse<PaginatedResult<Order>>>('/api/admin/orders', {
      params: apiQuery,
    })
    return response.data
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiSuccessResponse<Order>> {
    if (apiConfig.useMockApi) {
      const index = mockOrderStore.findIndex((order) => order.id === orderId)
      if (index === -1) {
        throw new Error('Order not found')
      }

      mockOrderStore[index] = {
        ...mockOrderStore[index],
        status,
      }

      return withMockLatency(mockOrderStore[index], 'Order status updated')
    }

    const response = await privateApi.patch<ApiSuccessResponse<Order>>(`/api/admin/orders/${orderId}/status`, {
      status,
    })
    return response.data
  },
}
