import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { cartApi } from '../api/cartApi'
import type { CartItemInput, CartState } from '../types/cart'

interface CartContextValue {
  cart: CartState
  addItem: (item: CartItemInput) => Promise<void>
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const defaultCart = cartApi.emptyCart()

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const [cart, setCart] = useState<CartState>(defaultCart)

  useEffect(() => {
    let cancelled = false

    const loadCart = async () => {
      if (!auth.isAuthenticated) {
        if (!cancelled) {
          setCart(cartApi.emptyCart())
        }
        return
      }

      try {
        const response = await cartApi.getCart()
        if (!cancelled) {
          setCart(response.data)
        }
      } catch {
        if (!cancelled) {
          setCart(cartApi.emptyCart())
        }
      }
    }

    void loadCart()

    return () => {
      cancelled = true
    }
  }, [auth.isAuthenticated, auth.user?.id])

  const addItem = async (item: CartItemInput) => {
    if (auth.isAuthenticated) {
      try {
        const response = await cartApi.addItem({
          productId: item.productId,
          quantity: item.quantity,
        })
        setCart(response.data)
      } catch {
      }
      return
    }

    setCart((prev) => {
      const existing = prev.items.find((line) => line.productId === item.productId)
      if (existing) {
        const items = prev.items.map((line) =>
          line.productId === item.productId
            ? {
                ...line,
                quantity: line.quantity + item.quantity,
                lineTotal: (line.quantity + item.quantity) * line.unitPrice,
              }
            : line,
        )
        const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)
        return {
          ...prev,
          items,
          subtotal,
        }
      }

      const nextItem = {
        id: `local-${item.productId}`,
        productId: item.productId,
        name: item.name,
        bottleSizeMl: item.bottleSizeMl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
      }
      const items = [...prev.items, nextItem]
      const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)

      return {
        ...prev,
        items,
        subtotal,
      }
    })
  }

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (auth.isAuthenticated) {
      const target = cart.items.find((line) => line.productId === productId)
      if (!target) return

      if (quantity <= 0) {
        await removeItem(productId)
        return
      }

      try {
        const response = await cartApi.updateItemQuantity(target.id, { quantity })
        setCart(response.data)
      } catch {
      }
      return
    }

    if (quantity <= 0) {
      setCart((prev) => {
        const items = prev.items.filter((line) => line.productId !== productId)
        const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)
        return {
          ...prev,
          items,
          subtotal,
        }
      })
      return
    }

    setCart((prev) => {
      const items = prev.items.map((line) =>
        line.productId === productId
          ? { ...line, quantity, lineTotal: quantity * line.unitPrice }
          : line,
      )
      const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)

      return {
        ...prev,
        items,
        subtotal,
      }
    })
  }

  const removeItem = async (productId: string) => {
    if (auth.isAuthenticated) {
      const target = cart.items.find((line) => line.productId === productId)
      if (!target) return

      try {
        const response = await cartApi.removeItem(target.id)
        setCart(response.data)
      } catch {
      }
      return
    }

    setCart((prev) => {
      const items = prev.items.filter((line) => line.productId !== productId)
      const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)
      return {
        ...prev,
        items,
        subtotal,
      }
    })
  }

  const clearCart = async () => {
    if (auth.isAuthenticated) {
      try {
        const response = await cartApi.clearCart()
        setCart(response.data)
      } catch {
      }
      return
    }

    setCart(cartApi.emptyCart())
  }

  const value = useMemo(
    () => ({ cart, addItem, updateItemQuantity, removeItem, clearCart }),
    [cart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
