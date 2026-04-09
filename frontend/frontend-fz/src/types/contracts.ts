import type { Order, PaymentMethod } from './order'
import type { Product, ProductCategory } from './product'
import type { PaginatedResult } from './api'
export type {
  LoginRequest,
  MessagePayload,
  PasswordResetOtpRequest,
  PasswordResetRequest,
  PasswordResetTokenPayload,
  PasswordResetVerifyOtpRequest,
  RefreshTokenRequest,
  RegisterRequest,
  SocialLoginRequest,
  SocialProvider,
} from '@fruzoos/auth-core'

export interface UserProfile {
  id: string
  displayName: string
  email: string
  role: 'ADMIN' | 'USER'
  phone?: string | null
}

export interface UpdateUserProfileRequest {
  displayName?: string
  phone?: string
}

export interface AddCartItemRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface ProductListQuery {
  page: number
  size: number
  query?: string
  category?: 'ALL' | ProductCategory
  availabilityOnly?: boolean
  sortBy?: 'name' | 'priceAsc' | 'priceDesc' | 'newest'
}

export type ProductListResponse = PaginatedResult<Product>

export interface MyOrdersQuery {
  userId?: string
  page: number
  size: number
  status?: 'ALL' | Order['status']
  sortBy?: 'newest' | 'amount'
}

export type MyOrdersResponse = PaginatedResult<Order>

export interface CheckoutRequest {
  deliveryAddress: string
  paymentMethod: PaymentMethod
}
