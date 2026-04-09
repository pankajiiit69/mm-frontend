import { useState } from 'react'
import { orderApi } from '../../api/orderApi'
import { AsyncState } from '../../components/AsyncState'
import { PaginationControls } from '../../components/PaginationControls'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { OrderStatus } from '../../types/order'

export function OrderManagementPage() {
  const [filterStatus, setFilterStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await orderApi.listAllOrders({
        page,
        size: pageSize,
        status: filterStatus,
        sortBy: 'newest',
      })
      return response.data
    },
    [page, filterStatus],
  )

  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)
  const pagedOrders = data?.items ?? []

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await orderApi.updateOrderStatus(orderId, nextStatus)
    await reload()
  }

  return (
    <section className="stack-wide">
      <h1>Order Management</h1>

      <label>
        Filter by Status
        <select
          value={filterStatus}
          onChange={(event) => {
            setPage(1)
            setFilterStatus(event.target.value as 'ALL' | OrderStatus)
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

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && pagedOrders.length === 0}
        emptyMessage="No orders found for selected status."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.userId}</td>
                <td>₹{order.totalAmount}</td>
                <td>{order.status}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(event) => void updateStatus(order.id, event.target.value as OrderStatus)}
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
