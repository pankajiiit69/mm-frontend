import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

export function CartPage() {
  const { cart, clearCart, removeItem, updateItemQuantity } = useCart()
  const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  if (cart.items.length === 0) {
    return (
      <section>
        <h1>Your Cart</h1>
        <p>Your cart is empty. Add juices from the home page.</p>
      </section>
    )
  }

  return (
    <section className="stack-wide">
      <h1>Your Cart</h1>
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
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    void updateItemQuantity(item.productId, Math.max(1, Number(event.target.value)))
                  }
                />
              </td>
              <td>₹{item.quantity * item.unitPrice}</td>
              <td>
                <button onClick={() => void removeItem(item.productId)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <strong>Subtotal:</strong> ₹{subtotal}
      </p>

      <div className="inline-actions cart-actions">
        <button className="cart-clear-action" onClick={() => void clearCart()}>Clear Cart</button>
        <Link className="cart-checkout-action" to="/checkout">Proceed to Checkout</Link>
      </div>
    </section>
  )
}
