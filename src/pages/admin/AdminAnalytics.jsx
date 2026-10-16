import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiDownload, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi'
import { mockCustomerService } from '../../services/mockCustomerService'
import { mockOrderService } from '../../services/mockOrderService'
import { mockProductService } from '../../services/mockProductService'
import { calculateAnalytics, createAnalyticsCsv } from '../../utils/analytics'

function dateForRange(days) {
  const start = new Date()
  start.setDate(start.getDate() - days + 1)
  return localDate(start)
}

function localDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function Money({ value }) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function SummaryCard({ title, value, detail, Icon }) {
  return (
    <article className="rounded-2xl border border-[#eee8df] bg-white p-4 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3e9dc] text-[#744d27]"><Icon size={18} /></span>
      <p className="mt-4 text-[11px] font-medium text-[#9b8a75]">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#3f2d1a]">{value}</p>
      <p className="mt-1 text-[10px] text-[#a08c74]">{detail}</p>
    </article>
  )
}

function LineChart({ title, detail, series, formatValue }) {
  const width = 680
  const height = 220
  const left = 48
  const right = 12
  const top = 14
  const bottom = 36
  const maxValue = Math.max(...series.map((point) => point.value), 1)
  const points = series.map((point, index) => {
    const x = series.length === 1
      ? (width - left - right) / 2 + left
      : left + (index / (series.length - 1)) * (width - left - right)
    const y = top + (1 - point.value / maxValue) * (height - top - bottom)
    return { ...point, x, y }
  })
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = points.length ? `${left},${height - bottom} ${polyline} ${points.at(-1).x},${height - bottom}` : ''
  const labels = points.length <= 7
    ? points
    : points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 5) === 0)
  const gradientId = `analytics-fill-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section className="rounded-2xl border border-[#eee8df] bg-white p-5 shadow-[0_3px_14px_rgba(71,48,22,0.035)] sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#493522]">{title}</h3>
        <p className="mt-1 text-[11px] text-[#a08c74]">{detail}</p>
      </div>
      {series.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-xl bg-[#fcfaf7] text-xs text-[#9b8a75]">No data in this date range.</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img" aria-label={`${title} chart`}>
          {[0, 1, 2, 3].map((step) => {
            const y = top + step * ((height - top - bottom) / 3)
            const value = maxValue * (1 - step / 3)
            return (
              <g key={step}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="#f0ebe4" strokeDasharray="3 5" />
                <text x="0" y={y + 3} fill="#b2a38f" fontSize="9">{formatValue(value)}</text>
              </g>
            )
          })}
          <polygon points={area} fill={`url(#${gradientId})`} />
          <polyline points={polyline} fill="none" stroke="#a96d37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="#a96d37" />)}
          {labels.map((point) => (
            <text key={point.date} x={point.x} y={height - 10} fill="#a08c74" fontSize="9" textAnchor="middle">{point.date.slice(5)}</text>
          ))}
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c28a53" stopOpacity=".2" />
              <stop offset="100%" stopColor="#c28a53" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </section>
  )
}

function AnalyticsTable({ title, rows, columns, emptyText }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
      <div className="border-b border-[#f1ece5] p-5">
        <h3 className="text-sm font-bold text-[#493522]">{title}</h3>
        <p className="mt-1 text-[11px] text-[#a08c74]">Calculated from filtered demo data</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-[#9b8a75]">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-wider text-[#a08c74]">
              <tr>{columns.map((column) => <th key={column.key} className="px-5 py-3">{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-[#f3eee7]">
                  {columns.map((column) => <td key={column.key} className="px-5 py-3 text-xs text-[#705d47]">{column.render ? column.render(row) : row[column.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function downloadCsv(content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'oro-coffee-demo-analytics.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function AdminAnalytics() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const loadData = useCallback(async () => {
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
      setError(loadError instanceof Error ? loadError.message : 'Unable to load analytics demo data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const dates = useMemo(() => {
    if (range === 'all') return { startDate: '', endDate: '' }
    if (range === 'custom') return { startDate: customStart, endDate: customEnd }
    return { startDate: dateForRange(Number(range)), endDate: localDate(new Date()) }
  }, [range, customStart, customEnd])

  const analytics = useMemo(
    () => calculateAnalytics({ orders, products, customers, ...dates }),
    [orders, products, customers, dates],
  )

  function exportCsv() {
    downloadCsv(createAnalyticsCsv(analytics))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / Analytics</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">Analytics &amp; reports</h2>
          <p className="mt-1 text-sm text-[#927e67]">Explore sales and customer patterns in your sample dataset.</p>
        </div>
        <button type="button" onClick={exportCsv} disabled={loading || Boolean(error)} className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-[#e8ddcf] bg-white px-4 py-2.5 text-xs font-bold text-[#76552f] hover:bg-[#f8f3ec] disabled:cursor-not-allowed disabled:opacity-50">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#eee5d9] bg-[#fffaf1] p-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9b8a75]">Date range</p>
          <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Analytics date range" className="w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs text-[#6f5d47] sm:w-44">
            <option value="all">All available data</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        {range === 'custom' && (
          <>
            <label className="text-[10px] font-semibold text-[#806d57]">From<input type="date" value={customStart} max={customEnd || undefined} onChange={(event) => setCustomStart(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs sm:w-40" /></label>
            <label className="text-[10px] font-semibold text-[#806d57]">To<input type="date" value={customEnd} min={customStart || undefined} onChange={(event) => setCustomEnd(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs sm:w-40" /></label>
          </>
        )}
        <p className="text-[10px] leading-5 text-[#947d5c]">All figures are calculated from mock data. Revenue includes delivered orders only and excludes orders explicitly marked unpaid, failed, or refunded.</p>
      </div>

      {loading ? (
        <div role="status" className="space-y-4">
          <p className="text-xs text-[#927e67]">Loading demo analytics…</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#f0d8d2] bg-[#fbefec] p-6 text-center">
          <p role="alert" className="text-sm font-semibold text-[#a34f41]">{error}</p>
          <button type="button" onClick={loadData} className="mt-3 rounded-lg border border-[#e8ddcf] bg-white px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Completed revenue" value={<Money value={analytics.revenue} />} detail={`${analytics.completedOrderCount} delivered orders`} Icon={FiDollarSign} />
            <SummaryCard title="Orders placed" value={analytics.orderCount.toLocaleString()} detail="All statuses, including cancelled" Icon={FiShoppingBag} />
            <SummaryCard title="Average completed order" value={<Money value={analytics.averageOrderValue} />} detail="Delivered orders only" Icon={FiDollarSign} />
            <SummaryCard title="Customer registrations" value={analytics.customerCount.toLocaleString()} detail="Registration dates in selected range" Icon={FiUsers} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <LineChart title="Revenue over time" detail="Delivered order totals · demo data" series={analytics.revenueByDate} formatValue={(value) => `$${Math.round(value)}`} />
            <LineChart title="Orders over time" detail="Placed orders · includes all statuses" series={analytics.ordersByDate} formatValue={(value) => String(Math.round(value))} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <LineChart title="Customer growth" detail="Mock registrations by date" series={analytics.customerGrowth} formatValue={(value) => String(Math.round(value))} />
            <AnalyticsTable
              title="Order status distribution"
              rows={analytics.statusDistribution.map((item) => ({ ...item, key: item.status }))}
              columns={[
                { key: 'status', label: 'Status' },
                { key: 'count', label: 'Orders' },
                { key: 'share', label: 'Share', render: (row) => `${analytics.orderCount ? ((row.count / analytics.orderCount) * 100).toFixed(1) : '0.0'}%` },
              ]}
              emptyText="No orders in this date range."
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <AnalyticsTable
              title="Best-selling coffee products"
              rows={analytics.bestSellers.map((item) => ({ ...item, key: item.productId }))}
              columns={[
                { key: 'name', label: 'Product' },
                { key: 'category', label: 'Category' },
                { key: 'quantity', label: 'Units sold' },
                { key: 'revenue', label: 'Revenue', render: (row) => <Money value={row.revenue} /> },
              ]}
              emptyText="No completed product sales in this date range."
            />
            <AnalyticsTable
              title="Sales by product category"
              rows={analytics.categorySales.map((item) => ({ ...item, key: item.category }))}
              columns={[
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Completed sales', render: (row) => <Money value={row.amount} /> },
              ]}
              emptyText="No category sales in this date range."
            />
          </div>
        </>
      )}
      <p className="text-[10px] leading-5 text-[#a08c74]">Analytics are calculated from the admin demo orders, products, and customer registration dates. No live business data is connected.</p>
    </div>
  )
}

export default AdminAnalytics
