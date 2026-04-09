import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { AsyncState } from '../components/AsyncState'
import { useCart } from '../hooks/useCart'
import { useAsyncData } from '../hooks/useAsyncData'

export function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const { data: product, loading, error } = useAsyncData(
    async () => {
      if (!id) {
        throw new Error('Invalid product id')
      }

      const response = await productApi.getById(id)
      return response.data
    },
    [id],
    Boolean(id),
  )

  if (!product && !loading && !error) {
    return <section className="info-text">Product not found.</section>
  }

  if (!product) {
    return <AsyncState loading={loading} error={error} />
  }

  const canAdd = product.availableQuantity > 0 && quantity > 0 && quantity <= product.availableQuantity

  return (
    <section className="stack-wide">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>
        {product.fruitType} • {product.category} • {product.bottleSizeMl}ml
      </p>
      <p>
        Price: ₹{product.price} • Available Quantity: {product.availableQuantity}
      </p>

      <div className="inline-actions">
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={Math.max(1, product.availableQuantity)}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>

        <button
          disabled={!canAdd}
          onClick={() =>
            void addItem({
              productId: product.id,
              name: product.name,
              bottleSizeMl: product.bottleSizeMl,
              quantity,
              unitPrice: product.price,
            })
          }
        >
          Add to Cart
        </button>
      </div>

      {!canAdd && <p className="error-text">Select a valid quantity within available stock.</p>}
    </section>
  )
}
