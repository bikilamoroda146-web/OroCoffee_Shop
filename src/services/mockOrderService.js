import products from '../Data/products'

const STORAGE_KEY = 'oro-admin-demo-orders'

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]

const demoOrders = [
  {
    id: 'ORO-1048',
    createdAt: '2026-10-15T09:32:00.000Z',
    status: 'Preparing',
    customer: { name: 'Amara Bekele', email: 'amara.b@example.com', phone: '+251 911 234 567', address: 'Bole Road, Addis Ababa' },
    items: [
      { productId: 1, name: 'Cappuccino', quantity: 2, unitPrice: 3.5 },
      { productId: 4, name: 'Caramel With Mocha', quantity: 4, unitPrice: 4.2 },
    ],
    subtotal: 23.8,
    deliveryFee: 2.5,
    tax: 2.2,
    total: 28.5,
  },
  {
    id: 'ORO-1047',
    createdAt: '2026-10-15T08:14:00.000Z',
    status: 'Out for Delivery',
    customer: { name: 'Noah Williams', email: 'noah.w@example.com', phone: '+251 922 410 381', address: 'Kazanchis, Addis Ababa' },
    items: [
      { productId: 2, name: 'Americano', quantity: 2, unitPrice: 4.2 },
      { productId: 7, name: 'Mocha', quantity: 1, unitPrice: 4 },
    ],
    subtotal: 12.4,
    deliveryFee: 2.5,
    tax: 1.5,
    total: 16.4,
  },
  {
    id: 'ORO-1046',
    createdAt: '2026-10-14T15:40:00.000Z',
    status: 'Delivered',
    customer: { name: 'Liya Tesfaye', email: 'liya.t@example.com', phone: '+251 933 618 240', address: 'Old Airport, Addis Ababa' },
    items: [
      { productId: 6, name: 'Latte', quantity: 4, unitPrice: 4 },
      { productId: 5, name: 'Coffee Chocolate', quantity: 4, unitPrice: 3.2 },
    ],
    subtotal: 28.8,
    deliveryFee: 4,
    tax: 4,
    total: 36.8,
  },
  {
    id: 'ORO-1045',
    createdAt: '2026-10-14T11:05:00.000Z',
    status: 'Pending',
    customer: { name: 'Ethan Chen', email: 'ethan.c@example.com', phone: '+251 944 205 713', address: 'Megenagna, Addis Ababa' },
    items: [{ productId: 3, name: 'Black Coffee', quantity: 1, unitPrice: 4 }],
    subtotal: 4,
    deliveryFee: 3.5,
    tax: 1,
    total: 8.5,
  },
  {
    id: 'ORO-1044',
    createdAt: '2026-10-13T17:25:00.000Z',
    status: 'Confirmed',
    customer: { name: 'Sofia Martin', email: 'sofia.m@example.com', phone: '+251 955 721 096', address: 'CMC, Addis Ababa' },
    items: [
      { productId: 4, name: 'Caramel With Mocha', quantity: 2, unitPrice: 4.2 },
      { productId: 1, name: 'Cappuccino', quantity: 2, unitPrice: 3.5 },
    ],
    subtotal: 15.4,
    deliveryFee: 3.5,
    tax: 2.3,
    total: 21.2,
  },
].map((order) => ({
  ...order,
  items: order.items.map((item) => ({
    ...item,
    image: products.find((product) => product.id === item.productId)?.image || '',
    lineTotal: item.quantity * item.unitPrice,
  })),
}))

function readOrders() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return demoOrders

  const parsed = JSON.parse(stored)
  if (!Array.isArray(parsed)) {
    throw new Error('Demo order data is invalid. Clear the admin demo data to reset it.')
  }
  return parsed
}

function writeOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  return orders
}

export const mockOrderService = {
  async list() {
    return readOrders()
  },

  async updateStatus(orderId, status) {
    if (!ORDER_STATUSES.includes(status)) throw new Error('Choose a valid order status.')
    const orders = readOrders()
    const order = orders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order no longer exists. Refresh the list and try again.')
    if (order.status === 'Cancelled') throw new Error('Cancelled demo orders cannot be changed.')

    const updated = { ...order, status }
    writeOrders(orders.map((item) => item.id === orderId ? updated : item))
    return updated
  },
}
