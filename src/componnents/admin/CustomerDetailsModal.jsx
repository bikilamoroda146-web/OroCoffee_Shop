import { useRef } from 'react'
import { FiMapPin, FiPhone, FiX } from 'react-icons/fi'
import OrderStatusBadge from './OrderStatusBadge'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const currency = (amount) => `$${amount.toFixed(2)}`
const date = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))

function CustomerDetailsModal({ customer, onClose }) {
  const dialogRef = useRef(null)
  useDialogAccessibility(dialogRef, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21170f]/45 p-0 sm:items-center sm:p-4">
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf9] p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#eee5d9] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a17b50]">Demo customer profile</p>
            <h2 id="customer-detail-title" className="mt-1 text-xl font-bold text-[#493522]">{customer.name}</h2>
            <p className="mt-1 text-xs text-[#927e67]">Customer since {date(customer.registeredAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close customer details" className="rounded-lg p-2 text-[#8c7963] hover:bg-[#f4ede4]"><FiX size={19} /></button>
        </div>

        <section className="mt-5 rounded-2xl border border-[#eee5d9] bg-white p-4">
          <h3 className="text-xs font-bold text-[#493522]">Contact information</h3>
          <a href={`mailto:${customer.email}`} className="mt-3 block break-all text-xs text-[#8c6740]">{customer.email}</a>
          <a href={`tel:${customer.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8c6740]"><FiPhone size={12} />{customer.phone}</a>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#796a58]"><FiMapPin className="mt-1 shrink-0" size={12} />{customer.address}</p>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f7f2eb] p-4"><p className="text-[10px] text-[#9b8a75]">Demo orders</p><p className="mt-1 text-lg font-bold text-[#493522]">{customer.orderCount}</p></div>
          <div className="rounded-xl bg-[#f7f2eb] p-4"><p className="text-[10px] text-[#9b8a75]">Demo order total</p><p className="mt-1 text-lg font-bold text-[#493522]">{currency(customer.totalSpent)}</p></div>
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#eee5d9] bg-white">
          <div className="border-b border-[#f1ece5] px-4 py-3">
            <h3 className="text-xs font-bold text-[#493522]">Order history</h3>
          </div>
          {customer.orders.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[#9b8a75]">No sample orders for this customer.</p>
          ) : (
            <div className="divide-y divide-[#f3eee7]">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-[#77512d]">{order.id}</p>
                    <p className="mt-1 text-[10px] text-[#9b8a75]">{date(order.createdAt)} · {order.items.reduce((count, item) => count + item.quantity, 0)} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs font-bold text-[#493522]">{currency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <p className="mt-4 text-[10px] leading-5 text-[#a08c74]">Customer names and order history are mock examples. No passwords or authentication information are displayed.</p>
      </section>
    </div>
  )
}

export default CustomerDetailsModal
