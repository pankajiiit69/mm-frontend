import { useMemo, useState, type FormEvent } from 'react'
import { FieldError } from '../../components/FieldError'
import { PaginationControls } from '../../components/PaginationControls'
import { mockProducts } from '../../data/mockProducts'
import { isPositiveNumber, minLength } from '../../utils/validation'
import type { Product, ProductCategory } from '../../types/product'

export function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'ALL' | ProductCategory>('ALL')
  const [page, setPage] = useState(1)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '',
    fruitType: '',
    category: 'CITRUS' as ProductCategory,
    bottleSizeMl: 300,
    price: 100,
    availableQuantity: 10,
    description: '',
  })

  const filteredProducts = useMemo(() => {
    let next = [...products]
    if (query.trim()) {
      const q = query.toLowerCase()
      next = next.filter(
        (item) => item.name.toLowerCase().includes(q) || item.fruitType.toLowerCase().includes(q),
      )
    }
    if (category !== 'ALL') {
      next = next.filter((item) => item.category === category)
    }
    return next.sort((a, b) => a.name.localeCompare(b.name))
  }, [products, query, category])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item)),
    )
  }

  const addProduct = (event: FormEvent) => {
    event.preventDefault()

    if (!minLength(form.name, 3) || !minLength(form.fruitType, 2) || !minLength(form.description, 10)) {
      setFormError('Name, fruit type, and description must meet minimum length requirements.')
      return
    }

    if (!isPositiveNumber(form.bottleSizeMl) || !isPositiveNumber(form.price)) {
      setFormError('Bottle size and price must be positive values.')
      return
    }

    setFormError('')
    const id = `${form.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    setProducts((prev) => [
      {
        id,
        name: form.name,
        fruitType: form.fruitType,
        description: form.description,
        bottleSizeMl: Number(form.bottleSizeMl),
        price: Number(form.price),
        availableQuantity: Number(form.availableQuantity),
        isActive: true,
        imageUrl: '',
        category: form.category,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setForm({
      name: '',
      fruitType: '',
      category: 'CITRUS',
      bottleSizeMl: 300,
      price: 100,
      availableQuantity: 10,
      description: '',
    })
  }

  return (
    <section className="stack-wide admin-page">
      <div className="toolbar-grid">
        <label>
          Search Products
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
            <option value="ALL">ALL</option>
            <option value="CITRUS">CITRUS</option>
            <option value="TROPICAL">TROPICAL</option>
            <option value="MIXED">MIXED</option>
            <option value="DETOX">DETOX</option>
            <option value="SEASONAL">SEASONAL</option>
          </select>
        </label>
      </div>

      <div className="orders-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Size</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.bottleSizeMl}ml</td>
                <td>₹{product.price}</td>
                <td>{product.availableQuantity}</td>
                <td>{product.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => toggleActive(product.id)}>
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />

      <h2>Add Product</h2>
      <form className="stack" onSubmit={addProduct}>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </label>
        <label>
          Fruit Type
          <input
            value={form.fruitType}
            onChange={(event) => setForm((prev) => ({ ...prev, fruitType: event.target.value }))}
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value as ProductCategory }))
            }
          >
            <option value="CITRUS">CITRUS</option>
            <option value="TROPICAL">TROPICAL</option>
            <option value="MIXED">MIXED</option>
            <option value="DETOX">DETOX</option>
            <option value="SEASONAL">SEASONAL</option>
          </select>
        </label>
        <label>
          Bottle Size (ml)
          <input
            type="number"
            min={1}
            value={form.bottleSizeMl}
            onChange={(event) => setForm((prev) => ({ ...prev, bottleSizeMl: Number(event.target.value) }))}
          />
        </label>
        <label>
          Price
          <input
            type="number"
            min={1}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
          />
        </label>
        <label>
          Available Quantity
          <input
            type="number"
            min={0}
            value={form.availableQuantity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, availableQuantity: Number(event.target.value) }))
            }
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
        <button type="submit">Add Product</button>
        <FieldError message={formError} />
      </form>
    </section>
  )
}
