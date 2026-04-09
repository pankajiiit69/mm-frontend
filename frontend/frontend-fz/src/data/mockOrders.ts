import type { Order } from '../types/order'

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'FRZ-202603-001',
    userId: 'user-1',
    status: 'DELIVERED',
    totalAmount: 360,
    deliveryAddress: 'Sector 21, Noida, Uttar Pradesh',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    createdAt: '2026-03-08T08:00:00Z',
    items: [
      { productId: 'orange-500', name: 'Orange Fresh Juice', bottleSizeMl: 500, quantity: 2, unitPrice: 120 },
      { productId: 'mosambi-300', name: 'Mosambi Light', bottleSizeMl: 300, quantity: 1, unitPrice: 120 },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'FRZ-202603-002',
    userId: 'user-1',
    status: 'DISPATCHED',
    totalAmount: 280,
    deliveryAddress: 'Sector 21, Noida, Uttar Pradesh',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    createdAt: '2026-03-10T09:30:00Z',
    items: [
      { productId: 'apple-500', name: 'Apple Active', bottleSizeMl: 500, quantity: 1, unitPrice: 130 },
      { productId: 'detox-green-300', name: 'Green Detox', bottleSizeMl: 300, quantity: 1, unitPrice: 150 },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'FRZ-202603-003',
    userId: 'user-2',
    status: 'PLACED',
    totalAmount: 170,
    deliveryAddress: 'Indiranagar, Bengaluru, Karnataka',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    createdAt: '2026-03-11T11:30:00Z',
    items: [
      { productId: 'pineapple-750', name: 'Pineapple Power', bottleSizeMl: 750, quantity: 1, unitPrice: 170 },
    ],
  },
]
