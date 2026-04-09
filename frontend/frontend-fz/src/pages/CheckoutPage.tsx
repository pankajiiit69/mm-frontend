import { useState, type FormEvent } from 'react'
import { orderApi } from '../api/orderApi'
import { FieldError } from '../components/FieldError'
import { useCart } from '../hooks/useCart'
import { isAddressValid } from '../utils/validation'
import type { PaymentMethod } from '../types/order'

export function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = cart.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    if (cart.items.length === 0) {
      setError('Your cart is empty. Add items before checkout.')
      setSuccessMessage('')
      return
    }

    if (!isAddressValid(deliveryAddress)) {
      setError('Delivery address must be at least 10 characters long.')
      setSuccessMessage('')
      return
    }

    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await orderApi.placeOrder(
        {
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
        },
        {
          userId: cart.userId,
          totalAmount,
          items: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            bottleSizeMl: item.bottleSizeMl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      )

      await clearCart()
      setSuccessMessage(
        `Order ${response.data.orderNumber} placed successfully with ${paymentMethod}. Total billed amount: ₹${totalAmount}.`,
      )
      setDeliveryAddress('')
    } catch {
      setError('Unable to place order right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="stack-wide">
      <h1>Checkout</h1>
      <p>Review your order and place it with COD, CARD, or UPI payment method.</p>

      <form className="stack" onSubmit={submit}>
        <label>
          Delivery Address
          <textarea
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="Enter full address"
            rows={3}
          />
        </label>

        <label>
          Payment Method
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          >
            <option value="COD">COD</option>
            <option value="CARD">CARD</option>
            <option value="UPI">UPI</option>
          </select>
        </label>

        <p>
          <strong>Order Total:</strong> ₹{totalAmount}
        </p>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>

      <FieldError message={error} />
      {successMessage && <p className="success-text">{successMessage}</p>}
    </section>
  )
}
