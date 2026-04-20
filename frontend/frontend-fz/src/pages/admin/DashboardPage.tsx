import { useMemo, useState } from 'react'
import { orderApi } from '../../api/orderApi'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'
import { mockProducts } from '../../data/mockProducts'

export function DashboardPage() {
  const [fromDate, setFromDate] = useState('2026-03-01')
  const [toDate, setToDate] = useState('2026-03-31')

  const { data: ordersPage, loading, error } = useAsyncData(
    async () => {
      const response = await orderApi.listAllOrders({
        page: 1,
        size: 200,
        fromDate,
        toDate,
        sortBy: 'newest',
      })
      return response.data
    },
    [fromDate, toDate],
  )

  const summary = useMemo(() => {
    const rangeOrders = ordersPage?.items ?? []

    const revenue = rangeOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const deliveredCount = rangeOrders.filter((order) => order.status === 'DELIVERED').length

    const quantityByProduct: Record<string, number> = {}

    for (const order of rangeOrders) {
      for (const item of order.items) {
        quantityByProduct[item.productId] = (quantityByProduct[item.productId] ?? 0) + item.quantity
      }
    }

    const topProducts = Object.entries(quantityByProduct)
      .map(([productId, qty]) => ({
        productId,
        qty,
        name: mockProducts.find((product) => product.id === productId)?.name ?? productId,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3)

    const lowStock = mockProducts
      .filter((product) => product.availableQuantity <= 10)
      .sort((a, b) => a.availableQuantity - b.availableQuantity)

    return { rangeOrders, revenue, deliveredCount, topProducts, lowStock }
  }, [ordersPage?.items])

  return (
    <section className="stack-wide admin-page">
      <div className="toolbar-grid">
        <label>
          From
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
      </div>

      <AsyncState loading={loading} error={error}>
        <div className="stats-grid">
          <article className="stat-card">
            <h3>Total Orders</h3>
            <p>{summary.rangeOrders.length}</p>
          </article>
          <article className="stat-card">
            <h3>Total Revenue</h3>
            <p>₹{summary.revenue}</p>
          </article>
          <article className="stat-card">
            <h3>Delivered Orders</h3>
            <p>{summary.deliveredCount}</p>
          </article>
        </div>

        <h2>Top-Selling Juices</h2>
        <ul className="simple-list-card">
          {summary.topProducts.map((item) => (
            <li key={item.productId}>
              {item.name} - {item.qty} bottles sold
            </li>
          ))}
        </ul>

        <h2>Low Inventory Alerts</h2>
        <ul className="simple-list-card">
          {summary.lowStock.map((item) => (
            <li key={item.id}>
              {item.name} - only {item.availableQuantity} left
            </li>
          ))}
        </ul>
      </AsyncState>
    </section>
  )
}
