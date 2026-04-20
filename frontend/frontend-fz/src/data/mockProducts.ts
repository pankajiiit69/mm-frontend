import type { Product } from '../types/product'
import bottelOrange from '../assets/images/BottelOrange.png'
import bottelMosambi from '../assets/images/BottelMosambi.png'

export const mockProducts: Product[] = [
  {
    id: 'orange-500',
    name: 'Orange Fresh Juice',
    fruitType: 'Orange',
    description: 'Freshly squeezed citrus blend with no added sugar.',
    bottleSizeMl: 300,
    price: 120,
    availableQuantity: 42,
    isActive: true,
    imageUrl: bottelOrange,
    category: 'CITRUS',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'mosambi-300',
    name: 'Mosambi Light',
    fruitType: 'Mosambi',
    description: 'Refreshing sweet-lime juice for daily hydration.',
    bottleSizeMl: 300,
    price: 90,
    availableQuantity: 18,
    isActive: true,
    imageUrl: bottelMosambi,
    category: 'CITRUS',
    createdAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 'mixed-500',
    name: 'Mixed Fruit Punch',
    fruitType: 'Mixed Fruit',
    description: 'Blend of apple, orange, and pineapple in one bottle.',
    bottleSizeMl: 300,
    price: 150,
    availableQuantity: 0,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
    category: 'MIXED',
    createdAt: '2026-03-06T12:00:00Z',
  },
]
