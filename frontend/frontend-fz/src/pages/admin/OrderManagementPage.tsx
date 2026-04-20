import { useState } from 'react'
import { orderApi } from '../../api/orderApi'
import { AsyncState } from '../../components/AsyncState'
import { PaginationControls } from '../../components/PaginationControls'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { OrderStatus } from '../../types/order'

const orderStatusClassName: Record<OrderStatus, string> = {
  PLACED: 'status-placed',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  DISPATCHED: 'status-dispatched',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
}

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
    <section className="stack-wide admin-page">
      <div className="toolbar-grid">
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
      </div>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && pagedOrders.length === 0}
        emptyMessage="No orders found for selected status."
      >
        <div className="orders-table-wrap">
          <table className="table orders-table">
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
                  <td>
                    <span className={`order-status-chip ${orderStatusClassName[order.status]}`}>{order.status}</span>
                  </td>
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
        </div>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
