import type { ApiSuccessResponse, PaginatedResult } from '../types/api'
import type { Product } from '../types/product'
import type { ProductListQuery } from '../types/contracts'
import { mockProducts } from '../data/mockProducts'
import { apiConfig } from './config'
import { withMockLatency } from './mockApi'
import { publicApi } from './httpClient'

type ProductSortByApi = 'NEWEST' | 'NAME' | 'PRICE_ASC' | 'PRICE_DESC'

interface ProductListApiQuery {
  page: number
  size: number
  query?: string
  category?: ProductListQuery['category'] extends infer T ? Exclude<T, 'ALL'> : never
  availabilityOnly?: boolean
  sortBy?: ProductSortByApi
}

function toProductListApiQuery(query: ProductListQuery): ProductListApiQuery {
  const sortByMap: Record<NonNullable<ProductListQuery['sortBy']>, ProductSortByApi> = {
    newest: 'NEWEST',
    name: 'NAME',
    priceAsc: 'PRICE_ASC',
    priceDesc: 'PRICE_DESC',
  }

  return {
    page: query.page,
    size: query.size,
    query: query.query,
    category: query.category && query.category !== 'ALL' ? query.category : undefined,
    availabilityOnly: query.availabilityOnly,
    sortBy: query.sortBy ? sortByMap[query.sortBy] : undefined,
  }
}

function applyProductQuery(products: Product[], query: ProductListApiQuery): PaginatedResult<Product> {
  let filtered = products.filter((product) => product.isActive)

  if (query.query?.trim()) {
    const normalized = query.query.toLowerCase()
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.fruitType.toLowerCase().includes(normalized),
    )
  }

  if (query.category) {
    filtered = filtered.filter((product) => product.category === query.category)
  }

  if (query.availabilityOnly) {
    filtered = filtered.filter((product) => product.availableQuantity > 0)
  }

  const sortBy = query.sortBy ?? 'NEWEST'
  switch (sortBy) {
    case 'NAME':
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'PRICE_ASC':
      filtered = filtered.sort((a, b) => a.price - b.price)
      break
    case 'PRICE_DESC':
      filtered = filtered.sort((a, b) => b.price - a.price)
      break
    case 'NEWEST':
    default:
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      break
  }

  const page = Math.max(query.page, 1)
  const size = Math.max(query.size, 1)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (page - 1) * size
  const items = filtered.slice(start, start + size)

  return {
    items,
    total,
    page,
    size,
    totalPages,
  }
}

export const productApi = {
  async list(query: ProductListQuery): Promise<ApiSuccessResponse<PaginatedResult<Product>>> {
    const apiQuery = toProductListApiQuery(query)

    if (apiConfig.useMockApi) {
      const data = applyProductQuery([...mockProducts], apiQuery)
      return withMockLatency(data)
    }

    const response = await publicApi.get<ApiSuccessResponse<PaginatedResult<Product>>>('/api/products', {
      params: apiQuery,
    })
    return response.data
  },

  async getById(productId: string): Promise<ApiSuccessResponse<Product>> {
    if (apiConfig.useMockApi) {
      const product = mockProducts.find((item) => item.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      return withMockLatency(product)
    }

    const response = await publicApi.get<ApiSuccessResponse<Product>>(`/api/products/${productId}`)
    return response.data
  },
}
