import { useState } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { orderApi } from '../api/orderApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { useAsyncData } from '../hooks/useAsyncData'
import type { OrderStatus } from '../types/order'

export function MyOrdersPage() {
  const { auth } = useAuth()
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [sortBy, setSortBy] = useState<'newest' | 'amount'>('newest')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const enabled = auth.isAuthenticated
  const { data, loading, error } = useAsyncData(
    async () => {
      const response = await orderApi.listMyOrders({
        userId: auth.user?.id,
        page,
        size: pageSize,
        status,
        sortBy,
      })
      return response.data
    },
    [auth.isAuthenticated, auth.user?.id, page, status, sortBy],
    enabled,
  )

  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)
  const pagedOrders = data?.items ?? []

  return (
    <section className="stack-wide">
      <h1>My Orders</h1>

      <div className="toolbar-grid">
        <label>
          Filter Status
          <select
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value as 'ALL' | OrderStatus)
            }}
          >
            <option value="ALL">ALL</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>

        <label>
          Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'newest' | 'amount')}>
            <option value="newest">Newest First</option>
            <option value="amount">Amount High to Low</option>
          </select>
        </label>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && pagedOrders.length === 0}
        emptyMessage="No orders found for selected status."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.status}</td>
                <td>
                  {order.paymentMethod} ({order.paymentStatus})
                </td>
                <td>₹{order.totalAmount}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
