import { Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { useCart } from '../hooks/useCart'

export function CartPage() {
  const { auth } = useAuth()
  const { cart, clearCart, removeItem, updateItemQuantity } = useCart()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  if (auth.isAuthenticated && auth.user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (cart.items.length === 0) {
    return (
      <section className="stack-wide cart-page">
        <div className="stack cart-empty-card">
          <p>Your cart is empty. Go to the <Link to="/">home page</Link> to continue exploring.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="stack-wide cart-page">
      <div className="orders-table-wrap">
        <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Size</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{item.bottleSizeMl}ml</td>
              <td>₹{item.unitPrice}</td>
              <td>
                <div className="cart-qty-control" role="group" aria-label={`Quantity controls for ${item.name}`}>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => void updateItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span className="cart-qty-value" aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => void updateItemQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>₹{item.quantity * item.unitPrice}</td>
              <td>
                <button
                  type="button"
                  className="cart-remove-icon-btn"
                  aria-label={`Remove ${item.name} from cart`}
                  data-tooltip="Remove item"
                  onClick={() => void removeItem(item.productId)}
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                    <path d="M4 7h16" />
                    <path d="M9 3h6l1 2H8l1-2z" />
                    <path d="M7 7l1 12h8l1-12" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <p>
        <strong>Subtotal:</strong> ₹{subtotal}
      </p>

      <div className="inline-actions cart-actions">
        <button className="cart-clear-action" onClick={() => setIsConfirmOpen(true)}>Clear Cart</button>
        <Link className="cart-checkout-action" to="/checkout">Proceed to Checkout</Link>
      </div>

      {isConfirmOpen ? (
        <div className="confirm-backdrop" role="presentation" onClick={() => setIsConfirmOpen(false)}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
            aria-describedby="clear-cart-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="clear-cart-title">Clear all cart items?</h3>
            <p id="clear-cart-description">
              This will remove every item from your cart and cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setIsConfirmOpen(false)}
              >
                Keep Cart
              </button>
              <button
                type="button"
                className="confirm-danger"
                onClick={() => {
                  void clearCart()
                  setIsConfirmOpen(false)
                }}
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
