export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentMethod = 'COD' | 'CARD' | 'UPI'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
  productId: string
  name: string
  bottleSizeMl: number
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  totalAmount: number
  deliveryAddress: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: string
  items: OrderItem[]
}
