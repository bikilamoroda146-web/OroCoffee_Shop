const excludedPayments = new Set(['unpaid', 'pending', 'failed', 'refunded', 'cancelled', 'canceled'])

export function localDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isInRange(value, startDate, endDate) {
  const date = localDateKey(value)
  if (!date) return false
  return (!startDate || date >= startDate) && (!endDate || date <= endDate)
}

export function isCompletedRevenueOrder(order) {
  return order.status === 'Delivered'
    && !excludedPayments.has(String(order.paymentStatus || '').toLowerCase())
    && Number.isFinite(Number(order.total))
    && Number(order.total) >= 0
}

export function completedOrderRevenue(order) {
  return isCompletedRevenueOrder(order) ? Number(order.total) : 0
}

function getProductId(item) {
  return item.productId ?? item.id
}

function buildDailySeries(values, getDate, getAmount) {
  const byDate = new Map()
  values.forEach((value) => {
    const date = localDateKey(getDate(value))
    if (!date) return
    const amount = Number(getAmount(value))
    if (!Number.isFinite(amount)) return
    byDate.set(date, (byDate.get(date) || 0) + amount)
  })
  return [...byDate.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, value]) => ({ date, value }))
}

export function calculateAnalytics({ orders = [], products = [], customers = [], startDate = '', endDate = '' }) {
  const rangedOrders = orders.filter((order) => isInRange(order.createdAt, startDate, endDate))
  const rangedCustomers = customers.filter((customer) => isInRange(customer.registeredAt, startDate, endDate))
  const revenueOrders = rangedOrders.filter(isCompletedRevenueOrder)
  const revenue = revenueOrders.reduce((total, order) => total + completedOrderRevenue(order), 0)
  const revenueByDate = buildDailySeries(revenueOrders, (order) => order.createdAt, (order) => Number(order.total || 0))
  const ordersByDate = buildDailySeries(rangedOrders, (order) => order.createdAt, () => 1)
  const customerGrowth = buildDailySeries(rangedCustomers, (customer) => customer.registeredAt, () => 1)

  const productById = new Map(products.map((product) => [String(product.id), product]))
  const productSales = new Map()
  const categorySales = new Map()
  revenueOrders.forEach((order) => {
    ;(Array.isArray(order.items) ? order.items : []).forEach((item) => {
      const product = productById.get(String(getProductId(item)))
      const name = product?.name || item.name || 'Unlisted product'
      const category = product?.category || 'Uncategorized'
      const quantity = Number(item.quantity || 0)
      const rawLineRevenue = item.lineTotal ?? Number(item.unitPrice) * quantity
      const lineRevenue = Number(rawLineRevenue)
      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(lineRevenue) || lineRevenue < 0) return
      const productKey = String(getProductId(item) ?? name)
      const current = productSales.get(productKey) || {
        productId: productKey,
        name,
        category,
        quantity: 0,
        revenue: 0,
        image: product?.image || item.image || '',
      }
      current.quantity += quantity
      current.revenue += lineRevenue
      productSales.set(productKey, current)
      categorySales.set(category, (categorySales.get(category) || 0) + lineRevenue)
    })
  })

  const statusCounts = new Map()
  rangedOrders.forEach((order) => statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1))

  return {
    revenue,
    orderCount: rangedOrders.length,
    completedOrderCount: revenueOrders.length,
    averageOrderValue: revenueOrders.length ? revenue / revenueOrders.length : 0,
    customerCount: rangedCustomers.length,
    revenueByDate,
    ordersByDate,
    customerGrowth,
    bestSellers: [...productSales.values()].sort((first, second) => second.quantity - first.quantity),
    categorySales: [...categorySales.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((first, second) => second.amount - first.amount),
    statusDistribution: [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((first, second) => second.count - first.count),
  }
}

function escapeCsv(value) {
  const rawText = String(value ?? '')
  const text = /^[\s]*[=+\-@]/.test(rawText) ? `'${rawText}` : rawText
  return `"${text.replaceAll('"', '""')}"`
}

export function createAnalyticsCsv(analytics) {
  const rows = [
    ['Section', 'Date / name', 'Category / status', 'Count / quantity', 'Revenue'],
    ...analytics.revenueByDate.map((item) => ['Revenue by date', item.date, '', '', item.value.toFixed(2)]),
    ...analytics.ordersByDate.map((item) => ['Orders by date', item.date, '', item.value, '']),
    ...analytics.customerGrowth.map((item) => ['Customer registrations', item.date, '', item.value, '']),
    ...analytics.bestSellers.map((item) => ['Best-selling product', item.name, item.category, item.quantity, item.revenue.toFixed(2)]),
    ...analytics.categorySales.map((item) => ['Sales by category', item.category, '', '', item.amount.toFixed(2)]),
    ...analytics.statusDistribution.map((item) => ['Order status', item.status, '', item.count, '']),
  ]
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
}
