import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiAlertTriangle,
  FiArrowRight,
  FiClock,
  FiCoffee,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi'
import { mockCustomerService } from '../../services/mockCustomerService'
import { mockOrderService } from '../../services/mockOrderService'
import { mockProductService } from '../../services/mockProductService'
import { calculateAnalytics } from '../../utils/analytics'
import OrderStatusBadge from '../../componnents/admin/OrderStatusBadge'

const statIcons = {
  revenue: FiDollarSign,
  orders: FiShoppingBag,
  customers: FiUsers,
  products: FiCoffee,
  pending: FiClock,
  inventory: FiAlertTriangle,
}

const toneClasses = {
  brown: 'bg-[#f3e9dc] text-[#744d27]',
  caramel: 'bg-[#fbefd9] text-[#a4742f]',
  sage: 'bg-[#e8eee6] text-[#5e8064]',
  rose: 'bg-[#f5e8e4] text-[#b16c5b]',
  amber: 'bg-[#fbf1d9] text-[#a98137]',
  red: 'bg-[#f8e8e4] text-[#b45d4d]',
}

const statusColors = {
  Pending: '#d9b15e',
  Confirmed: '#7d9bb3',
  Preparing: '#c38b52',
  'Ready for Pickup': '#9682b2',
  'Out for Delivery': '#5f8aa4',
  Delivered: '#5e8064',
  Cancelled: '#c87869',
}

const money = (amount) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const date = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))

function PanelHeading({ title, detail, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-[#493522] sm:text-base">{title}</h2>
        {detail && <p className="mt-1 text-[11px] text-[#a08c74]">{detail}</p>}
      </div>
      {action}
    </div>
  )
}

function StatCard({ stat }) {
  const Icon = statIcons[stat.icon]
  return (
    <article className="rounded-2xl border border-[#eee8df] bg-white p-4 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[stat.tone]}`}><Icon size={18} /></div>
      <p className="mt-4 text-[11px] font-medium text-[#9b8a75]">{stat.label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#3f2d1a]">{stat.value}</p>
      <p className="mt-1 text-[10px] text-[#a08c74]">{stat.detail}</p>
    </article>
  )
}

function SalesChart({ series }) {
  const maxValue = Math.max(...series.map((point) => point.value), 1)
  const points = series.map((point, index) => {
    const x = series.length < 2 ? 305 : 32 + (index / (series.length - 1)) * 528
    const y = 165 - (point.value / maxValue) * 125
    return { ...point, x, y }
  })
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const labels = points.length <= 7
    ? points
    : points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 5) === 0)

  return (
    <section className="rounded-2xl border border-[#eee8df] bg-white p-5 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-6">
      <PanelHeading title="Sales overview" detail="Delivered order totals by date · demo data" />
      {series.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-[#fcfaf7] text-xs text-[#9b8a75]">No completed sales in the available demo data.</div>
      ) : (
        <svg viewBox="0 0 610 200" className="h-48 w-full" role="img" aria-label="Delivered revenue by date from mock orders">
          {[40, 82, 124, 166].map((y) => <line key={y} x1="28" x2="594" y1={y} y2={y} stroke="#f0ebe4" strokeDasharray="3 5" />)}
          <polyline points={linePoints} fill="none" stroke="#a96d37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="4" fill="#a96d37" />)}
          {labels.map((point) => (
            <text key={point.date} x={point.x} y="190" fill="#a08c74" fontSize="9" textAnchor="middle">{point.date.slice(5)}</text>
          ))}
        </svg>
      )}
      {series.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#9b8a75]">
          <span className="h-2 w-2 rounded-full bg-[#a96d37]" />
          <span>Total completed revenue: {money(series.reduce((sum, point) => sum + point.value, 0))}</span>
        </div>
      )}
    </section>
  )
}

function OrderStatus({ orders }) {
  const counts = orders.reduce((accumulator, order) => {
    accumulator.set(order.status, (accumulator.get(order.status) || 0) + 1)
    return accumulator
  }, new Map())
  const statuses = [...counts.entries()].map(([label, count]) => ({ label, count, color: statusColors[label] || '#a08c74' }))
  const total = orders.length
  let offset = 0
  const gradient = statuses.map(({ count, color }) => {
    const start = offset
    offset += (count / (total || 1)) * 100
    return `${color} ${start}% ${offset}%`
  }).join(', ')

  return (
    <section className="rounded-2xl border border-[#eee8df] bg-white p-5 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-6">
      <PanelHeading title="Order status" detail="Current mock order mix" />
      <div className="flex items-center justify-center py-2">
        <div className={`relative flex h-40 w-40 items-center justify-center rounded-full ${total ? '' : 'bg-[#f3eee7]'}`} style={total ? { background: `conic-gradient(${gradient})` } : undefined}>
          <div className="flex h-29 w-29 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-2xl font-bold text-[#493522]">{total}</span>
            <span className="mt-1 text-[10px] text-[#a08c74]">demo orders</span>
          </div>
        </div>
      </div>
      {statuses.length === 0 ? (
        <p className="mt-3 text-center text-xs text-[#9b8a75]">No orders available.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {statuses.map(({ label, count, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#796a58]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>
              <span className="font-bold text-[#493522]">{count} ({((count / total) * 100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function RecentOrders({ orders }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <PanelHeading title="Recent orders" detail="Latest orders in demo data" action={<Link to="/admin/orders" className="flex items-center gap-1 text-[11px] font-bold text-[#8c5b2c] hover:text-[#542f00]">View all <FiArrowRight size={13} /></Link>} />
      </div>
      {orders.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-[#9b8a75]">No demo orders available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-165 text-left">
            <thead>
              <tr className="border-y border-[#f1ece5] bg-[#fcfaf7] text-[10px] font-semibold uppercase tracking-wider text-[#a08c74]">
                <th className="px-6 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map((order) => (
                <tr key={order.id} className="border-b border-[#f5f1eb] last:border-0">
                  <td className="px-6 py-3.5 text-xs font-bold text-[#77512d]">{order.id}</td>
                  <td className="px-4 py-3.5"><p className="text-xs font-semibold text-[#493522]">{order.customer.name}</p><p className="mt-0.5 text-[10px] text-[#a08c74]">{order.customer.email}</p></td>
                  <td className="px-4 py-3.5 text-[11px] text-[#8d7c67]">{date(order.createdAt)}</td>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#493522]">{money(Number(order.total) || 0)}</td>
                  <td className="px-6 py-3.5"><OrderStatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function BestSellers({ sales }) {
  return (
    <section className="rounded-2xl border border-[#eee8df] bg-white p-5 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-6">
      <PanelHeading title="Best-selling coffees" detail="Based on delivered demo orders" />
      {sales.length === 0 ? (
        <p className="py-8 text-center text-xs text-[#9b8a75]">No completed product sales available.</p>
      ) : (
        <div className="space-y-4">
          {sales.slice(0, 4).map((item, index) => (
              <div key={item.productId} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f6f0e8] text-[11px] font-bold text-[#8a6037]">0{index + 1}</span>
                {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#493522]">{item.name}</p>
                  <p className="mt-1 text-[10px] text-[#a08c74]">{item.quantity} sold</p>
                </div>
                <span className="text-xs font-bold text-[#604328]">{money(item.revenue)}</span>
              </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [orderData, productData, customerData] = await Promise.all([
        mockOrderService.list(),
        mockProductService.list(),
        mockCustomerService.list(),
      ])
      setOrders(orderData)
      setProducts(productData)
      setCustomers(customerData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard demo data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const analytics = useMemo(
    () => calculateAnalytics({ orders, products, customers }),
    [orders, products, customers],
  )
  const pendingCount = orders.filter((order) => order.status === 'Pending').length
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 5).length
  const today = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date())
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Completed revenue', value: money(analytics.revenue), detail: `${analytics.completedOrderCount} delivered orders`, icon: 'revenue', tone: 'brown' },
    { label: 'Total orders', value: orders.length.toLocaleString(), detail: 'All current statuses', icon: 'orders', tone: 'caramel' },
    { label: 'Customers', value: customers.length.toLocaleString(), detail: 'Available demo profiles', icon: 'customers', tone: 'sage' },
    { label: 'Products', value: products.length.toLocaleString(), detail: 'In the admin catalog', icon: 'products', tone: 'rose' },
    { label: 'Pending orders', value: pendingCount.toLocaleString(), detail: 'Require order review', icon: 'pending', tone: 'amber' },
    { label: 'Low-stock products', value: lowStockCount.toLocaleString(), detail: '1–5 units remaining', icon: 'inventory', tone: 'red' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">{today}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#493522] sm:text-2xl">{greeting}, Oro <span aria-hidden="true">☕</span></h2>
          <p className="mt-1 text-xs text-[#927e67]">A summary calculated from the current demo dataset.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" /> Previewing sample data
        </div>
      </div>

      {loading ? (
        <div role="status" className="space-y-4">
          <p className="text-xs text-[#927e67]">Loading dashboard demo data…</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#f0d8d2] bg-[#fbefec] p-6 text-center">
          <p role="alert" className="text-sm font-semibold text-[#a34f41]">{error}</p>
          <button type="button" onClick={loadDashboard} className="mt-3 rounded-lg border border-[#e8ddcf] bg-white px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
            <SalesChart series={analytics.revenueByDate} />
            <OrderStatus orders={orders} />
          </div>
          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
            <RecentOrders orders={[...orders].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))} />
            <BestSellers sales={analytics.bestSellers} />
          </div>
        </>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-[#eee5d9] bg-[#fffdf9] px-4 py-3 text-[10px] leading-5 text-[#9b8a75]">
        <FiPackage className="mt-0.5 shrink-0 text-[#a47c4f]" size={14} />
        Demo data only. Revenue counts delivered orders only; cards and reports are not connected to real business records.
      </div>
    </div>
  )
}

export default AdminDashboard
