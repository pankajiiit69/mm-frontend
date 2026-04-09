export type ProductCategory = 'CITRUS' | 'TROPICAL' | 'MIXED' | 'DETOX' | 'SEASONAL'

export interface Product {
  id: string
  name: string
  fruitType: string
  description: string
  bottleSizeMl: number
  price: number
  availableQuantity: number
  isActive: boolean
  imageUrl: string
  category: ProductCategory
  createdAt: string
}
