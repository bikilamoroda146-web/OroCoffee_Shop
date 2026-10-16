import { useCallback, useEffect, useState } from 'react'
import { FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockOrderService } from '../services/mockOrderService'

const money = (value) => `$${Number(value).toFixed(2)}`

function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const allOrders = await mockOrderService.list()
      setOrders(allOrders
        .filter((order) => order.customer?.email?.toLowerCase() === user?.email?.toLowerCase())
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => { loadOrders() }, [loadOrders])

  return (
    <main className="min-h-[65vh] bg-linear-to-b from-coffee-cream to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b7043]">Oro Coffee Shop</p>
        <h1 className="mt-2 text-3xl font-bold text-coffee-brown">My orders</h1>
        <p className="mt-2 text-sm text-gray-600">Your orders are saved in this browser for demonstration purposes.</p>

        {loading ? (
          <div role="status" className="mt-8 rounded-2xl border border-[#eadbc7] bg-white p-8 text-center text-sm text-gray-600">Loading your orders…</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p role="alert" className="text-sm font-semibold text-red-800">{error}</p>
            <button type="button" onClick={loadOrders} className="mt-4 min-h-10 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-800">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#eadbc7] bg-white px-6 py-12 text-center">
            <FiPackage size={40} className="mx-auto text-coffee-orange" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-coffee-brown">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-600">Your completed demo orders will appear here.</p>
            <Link to="/menu" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-coffee-orange px-5 py-3 font-bold text-white hover:bg-coffee-brown">Explore the menu</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#eadbc7] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-coffee-brown">Order {order.id}</h2>
                    <p className="mt-1 text-xs text-gray-500">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-coffee-brown">{money(order.total)}</p>
                    <p className="mt-1 text-xs font-semibold text-[#8b5f31]">{order.paymentStatus || 'Payment status not recorded'}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.productId} className="rounded-full bg-coffee-cream px-3 py-1.5 text-xs text-[#6c5438]">{item.name} × {item.quantity}</span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-600">
                  Payment method: <span className="font-semibold capitalize text-coffee-brown">{String(order.paymentMethod || 'Not recorded').replaceAll('-', ' ')}</span>
                </p>
                {order.isDemoPayment && <p className="mt-4 text-[10px] leading-5 text-gray-500">Demonstration order only. No real payment has been verified.</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Orders
