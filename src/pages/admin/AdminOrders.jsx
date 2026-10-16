import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiCalendar, FiEye, FiSearch } from 'react-icons/fi'
import { mockOrderService, ORDER_STATUSES } from '../../services/mockOrderService'
import OrderDetailsModal from '../../componnents/admin/OrderDetailsModal'
import OrderStatusBadge from '../../componnents/admin/OrderStatusBadge'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const formatMoney = (value) => `$${value.toFixed(2)}`
const localDateKey = (value) => {
  const date = new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pendingCancellation, setPendingCancellation] = useState(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const cancelDialogRef = useRef(null)
  useDialogAccessibility(cancelDialogRef, () => setPendingCancellation(null), Boolean(pendingCancellation))

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setOrders(await mockOrderService.list())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load demo orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const filteredOrders = useMemo(() => orders
    .filter((order) => order.id.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .filter((order) => !dateFilter || localDateKey(order.createdAt) === dateFilter)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
  [orders, search, statusFilter, dateFilter])

  async function updateStatus(order, status) {
    try {
      const updated = await mockOrderService.updateStatus(order.id, status)
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelectedOrder((current) => current?.id === updated.id ? updated : current)
      setMessage(`${updated.id} status updated to ${updated.status} in demo data.`)
      setActionError('')
      setPendingCancellation(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this demo order.')
      setPendingCancellation(null)
    }
  }

  function requestStatusChange(order, status) {
    setMessage('')
    setActionError('')
    if (status === 'Cancelled') {
      setPendingCancellation(order)
      return
    }
    updateStatus(order, status)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / Orders</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">Orders</h2>
          <p className="mt-1 text-sm text-[#927e67]">Review sample orders and update their demo status.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" /> Frontend demo · no payments
        </span>
      </div>

      <div className="rounded-2xl border border-[#eee5d9] bg-[#fffaf1] px-4 py-3 text-xs leading-5 text-[#8f754f]">
        Orders, customer contact details, product quantities, and status changes are mock data saved in this browser. No real orders or transactions are processed.
      </div>
      {message && <p role="status" className="rounded-xl border border-[#dce9d9] bg-[#eef5ed] px-4 py-3 text-xs font-semibold text-[#54765a]">{message}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-[#f0d8d2] bg-[#fbefec] px-4 py-3 text-xs font-semibold text-[#a34f41]">{actionError}</p>}

      <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
        <div className="grid gap-3 border-b border-[#f1ece5] p-4 sm:grid-cols-[minmax(200px,1fr)_210px_190px]">
          <label className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08c74]" size={15} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order ID" aria-label="Search order ID" className="w-full rounded-xl border border-[#e8ddcf] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b88751]" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter orders by status" className="rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs text-[#6f5d47] outline-none focus:border-[#b88751]">
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <label className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a08c74]" size={14} />
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter orders by date" className="w-full rounded-xl border border-[#e8ddcf] bg-white py-2.5 pl-9 pr-3 text-xs text-[#6f5d47] outline-none focus:border-[#b88751]" />
          </label>
        </div>

        {loading ? (
          <div role="status" className="space-y-3 p-5">
            <p className="text-xs text-[#927e67]">Loading demo orders…</p>
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f7f2eb]" />)}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p role="alert" className="text-sm font-semibold text-[#a34f41]">{loadError}</p>
            <button type="button" onClick={loadOrders} className="mt-3 rounded-lg border border-[#e8ddcf] px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-bold text-[#493522]">No matching orders</p>
            <p className="mt-1 text-xs text-[#9b8a75]">Try a different order ID, status, or date.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-230 text-left">
                <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-wider text-[#a08c74]">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-[#f3eee7]">
                      <td className="px-5 py-3.5 text-xs font-bold text-[#77512d]">{order.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-[#493522]">{order.customer.name}</p>
                        <p className="mt-1 text-[10px] text-[#a08c74]">{order.customer.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{order.items.reduce((count, item) => count + item.quantity, 0)} items</td>
                      <td className="px-4 py-3.5 text-[11px] text-[#8d7c67]">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#493522]">{formatMoney(order.total)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1.5">
                          <OrderStatusBadge status={order.status} />
                          <label className="sr-only" htmlFor={`status-${order.id}`}>Update status for {order.id}</label>
                          <select id={`status-${order.id}`} value={order.status} disabled={order.status === 'Cancelled'} onChange={(event) => requestStatusChange(order, event.target.value)} className="max-w-40 rounded-lg border border-[#eee5d9] bg-white px-2 py-1.5 text-[10px] font-semibold text-[#705c43] outline-none focus:border-[#b88751] disabled:opacity-65">
                            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.id} details`} className="rounded-lg p-2 text-[#8c6740] hover:bg-[#f6f0e8]"><FiEye size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {filteredOrders.map((order) => (
                <article key={order.id} className="rounded-xl border border-[#f0e9df] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#77512d]">{order.id}</p>
                      <p className="mt-1 text-xs font-semibold text-[#493522]">{order.customer.name}</p>
                      <p className="mt-1 text-[10px] text-[#a08c74]">{order.customer.email}</p>
                    </div>
                    <p className="text-xs font-bold text-[#493522]">{formatMoney(order.total)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="sr-only" htmlFor={`mobile-status-${order.id}`}>Update status for {order.id}</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <label className="sr-only" htmlFor={`mobile-status-${order.id}`}>Update status for {order.id}</label>
                      <select id={`mobile-status-${order.id}`} value={order.status} disabled={order.status === 'Cancelled'} onChange={(event) => requestStatusChange(order, event.target.value)} className="max-w-44 rounded-lg border border-[#eee5d9] bg-white px-2 py-1.5 text-[10px] font-semibold text-[#705c43]">
                        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => setSelectedOrder(order)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#8c6740] hover:bg-[#f6f0e8]"><FiEye size={14} /> Details</button>
                  </div>
                  <p className="mt-3 text-[10px] text-[#9b8a75]">{formatDate(order.createdAt)} · {order.items.reduce((count, item) => count + item.quantity, 0)} items</p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {pendingCancellation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21170f]/45 p-4">
          <section ref={cancelDialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="cancel-order-title" className="w-full max-w-sm rounded-2xl bg-[#fffdf9] p-6 shadow-2xl">
            <h2 id="cancel-order-title" className="text-base font-bold text-[#493522]">Cancel order {pendingCancellation.id}?</h2>
            <p className="mt-2 text-xs leading-5 text-[#927e67]">This will mark this mock order as cancelled in this browser’s demo data. No transaction or customer order is affected.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingCancellation(null)} className="rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-xs font-bold text-[#806d57]">Keep order</button>
              <button type="button" onClick={() => updateStatus(pendingCancellation, 'Cancelled')} className="rounded-xl bg-[#a95445] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#91483c]">Confirm cancellation</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
