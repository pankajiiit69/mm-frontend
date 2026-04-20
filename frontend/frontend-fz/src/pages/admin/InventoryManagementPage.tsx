import { useMemo, useState } from 'react'
import { mockProducts } from '../../data/mockProducts'

export function InventoryManagementPage() {
  const [products, setProducts] = useState(mockProducts)
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const visibleProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => a.availableQuantity - b.availableQuantity)
    return showLowStockOnly ? sorted.filter((item) => item.availableQuantity <= 10) : sorted
  }, [products, showLowStockOnly])

  const updateQuantity = (id: string, value: number) => {
    if (!Number.isFinite(value)) return
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, availableQuantity: Math.max(0, value) } : item)),
    )
  }

  return (
    <section className="stack-wide admin-page">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showLowStockOnly}
          onChange={(event) => setShowLowStockOnly(event.target.checked)}
        />
        Show low stock only (≤ 10)
      </label>

      <div className="orders-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Quantity</th>
              <th>Update Quantity</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.availableQuantity}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={product.availableQuantity}
                    onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
