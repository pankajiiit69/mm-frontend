import { useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { useCart } from '../hooks/useCart'
import { useAsyncData } from '../hooks/useAsyncData'
import type { ProductCategory } from '../types/product'

export function HomePage() {
  const { addItem } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'ALL' | ProductCategory>('ALL')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc' | 'newest'>('newest')
  const [page, setPage] = useState(1)

  const pageSize = 3

  const { data, loading, error } = useAsyncData(
    async () => {
      const response = await productApi.list({
        page,
        size: pageSize,
        query,
        category,
        availabilityOnly,
        sortBy,
      })
      return response.data
    },
    [page, query, category, availabilityOnly, sortBy],
  )

  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = data?.items ?? []

  const categories: Array<'ALL' | ProductCategory> = [
    'ALL',
    'CITRUS',
    'TROPICAL',
    'MIXED',
    'DETOX',
    'SEASONAL',
  ]

  const handleAdd = (productId: string) => {
    const product = pagedProducts.find((item) => item.id === productId)
    if (!product || product.availableQuantity <= 0) return

    void addItem({
      productId: product.id,
      name: product.name,
      bottleSizeMl: product.bottleSizeMl,
      quantity: 1,
      unitPrice: product.price,
    })
  }

  return (
    <section className="stack-wide">
      <div>
        <h1>Fresh Juice Catalog</h1>
        <p>Browse by category, filter by availability, and sort by price or newest.</p>
      </div>

      <div className="toolbar-grid">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => {
              setPage(1)
              setQuery(event.target.value)
            }}
            placeholder="Search by name or fruit type"
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => {
              setPage(1)
              setCategory(event.target.value as 'ALL' | ProductCategory)
            }}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort By
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={availabilityOnly}
            onChange={(event) => {
              setPage(1)
              setAvailabilityOnly(event.target.checked)
            }}
          />
          In stock only
        </label>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && pagedProducts.length === 0}
        emptyMessage="No products found for current filters."
      >
        <div className="card-grid">
          {pagedProducts.map((product) => (
            <article key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>
                {product.bottleSizeMl}ml • ₹{product.price}
              </p>
              <p>Stock: {product.availableQuantity}</p>
              <div className="inline-actions">
                <Link to={`/products/${product.id}`}>Details</Link>
                <button
                  disabled={product.availableQuantity <= 0}
                  onClick={() => handleAdd(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
