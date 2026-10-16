import { mockOrderService } from './mockOrderService'
import { completedOrderRevenue } from '../utils/analytics'

const customers = [
  { id: 'customer-amara', name: 'Amara Bekele', email: 'amara.b@example.com', phone: '+251 911 234 567', address: 'Bole Road, Addis Ababa', registeredAt: '2026-07-09T10:00:00.000Z' },
  { id: 'customer-noah', name: 'Noah Williams', email: 'noah.w@example.com', phone: '+251 922 410 381', address: 'Kazanchis, Addis Ababa', registeredAt: '2026-08-14T10:00:00.000Z' },
  { id: 'customer-liya', name: 'Liya Tesfaye', email: 'liya.t@example.com', phone: '+251 933 618 240', address: 'Old Airport, Addis Ababa', registeredAt: '2026-08-22T10:00:00.000Z' },
  { id: 'customer-ethan', name: 'Ethan Chen', email: 'ethan.c@example.com', phone: '+251 944 205 713', address: 'Megenagna, Addis Ababa', registeredAt: '2026-09-03T10:00:00.000Z' },
  { id: 'customer-sofia', name: 'Sofia Martin', email: 'sofia.m@example.com', phone: '+251 955 721 096', address: 'CMC, Addis Ababa', registeredAt: '2026-09-18T10:00:00.000Z' },
  { id: 'customer-dawit', name: 'Dawit Alemu', email: 'dawit.a@example.com', phone: '+251 966 303 728', address: 'Piassa, Addis Ababa', registeredAt: '2026-10-02T10:00:00.000Z' },
]

export const mockCustomerService = {
  async list() {
    const orders = await mockOrderService.list()
    return customers.map((customer) => {
      const customerOrders = orders
        .filter((order) => order.customer.email.toLowerCase() === customer.email.toLowerCase())
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      return {
        ...customer,
        orders: customerOrders,
        orderCount: customerOrders.length,
        totalSpent: customerOrders.reduce((total, order) => total + completedOrderRevenue(order), 0),
      }
    })
  },
}
