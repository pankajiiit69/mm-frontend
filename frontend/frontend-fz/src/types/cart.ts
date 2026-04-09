export interface CartItem {
  id: string
  productId: string
  name: string
  bottleSizeMl: number
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CartItemInput {
  productId: string
  name: string
  bottleSizeMl: number
  quantity: number
  unitPrice: number
}

export interface CartState {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
}
