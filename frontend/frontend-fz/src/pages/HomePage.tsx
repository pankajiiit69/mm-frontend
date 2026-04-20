import { useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { useCart } from '../hooks/useCart'
import { useAsyncData } from '../hooks/useAsyncData'
import type { ProductCategory } from '../types/product'
import bottelOrange from '../assets/images/BottelOrange.png'
import bottelMosambi from '../assets/images/BottelMosambi.png'

const categoryAccent: Record<ProductCategory, { label: string; icon: string; toneClass: string }> = {
  CITRUS: { label: 'Citrus Boost', icon: 'CT', toneClass: 'citrus' },
  TROPICAL: { label: 'Tropical Splash', icon: 'TR', toneClass: 'tropical' },
  MIXED: { label: 'Fruit Mix', icon: 'MX', toneClass: 'mixed' },
  DETOX: { label: 'Detox Blend', icon: 'DX', toneClass: 'detox' },
  SEASONAL: { label: 'Seasonal Pick', icon: 'SN', toneClass: 'seasonal' },
}

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
      <div className="home-hero">
        <div className="home-hero-content">
          <p className="hero-kicker">Cold Pressed. Same Day Fresh.</p>
          <h1 className="hero-title">Fresh Juice Catalog</h1>
          <p className="hero-subtitle">
            Discover vitamin-rich blends made from real fruits, with no artificial flavors and no
            added sugar.
          </p>
          <div className="hero-badges" aria-label="service highlights">
            <span className="hero-badge">Farm Fresh Fruits</span>
            <span className="hero-badge">Freshly Pressed Daily</span>
            <span className="hero-badge">Quick Local Delivery</span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img src={bottelOrange} alt="" className="hero-fruit hero-fruit-one" />
          <img src={bottelMosambi} alt="" className="hero-fruit hero-fruit-two" />
          <img src={bottelOrange} alt="" className="hero-fruit hero-fruit-three" />
        </div>
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
            <article key={product.id} className={`card product-card product-card-${categoryAccent[product.category].toneClass}`}>
              <div className="product-card-media">
                <img src={product.imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
                <span className={`product-category-chip product-category-chip-${categoryAccent[product.category].toneClass}`}>
                  <span aria-hidden="true">{categoryAccent[product.category].icon}</span>{' '}
                  {categoryAccent[product.category].label}
                </span>
              </div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>
                {product.bottleSizeMl}ml • ₹{product.price}
              </p>
              <p className={product.availableQuantity > 0 ? 'product-stock-chip product-stock-chip-in' : 'product-stock-chip product-stock-chip-out'}>
                Stock: {product.availableQuantity > 0 ? `${product.availableQuantity} available` : 'Out of stock'}
              </p>
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
