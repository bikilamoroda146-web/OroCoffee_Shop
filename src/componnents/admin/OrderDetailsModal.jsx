import { useRef } from 'react'
import { FiMapPin, FiPhone, FiX } from 'react-icons/fi'
import OrderStatusBadge from './OrderStatusBadge'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const money = (value) => `$${value.toFixed(2)}`
const orderDate = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))

function OrderDetailsModal({ order, onClose }) {
  const dialogRef = useRef(null)
  useDialogAccessibility(dialogRef, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21170f]/45 p-0 sm:items-center sm:p-4">
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf9] p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#eee5d9] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a17b50]">Demo order details</p>
            <h2 id="order-detail-title" className="mt-1 text-xl font-bold text-[#493522]">{order.id}</h2>
            <p className="mt-1 text-xs text-[#927e67]">{orderDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button type="button" onClick={onClose} aria-label="Close order details" className="rounded-lg p-2 text-[#8c7963] hover:bg-[#f4ede4]"><FiX size={19} /></button>
          </div>
        </div>

        <div className="grid gap-5 py-5 sm:grid-cols-2">
          <section className="rounded-2xl border border-[#eee5d9] bg-white p-4">
            <h3 className="text-xs font-bold text-[#493522]">Customer</h3>
            <p className="mt-3 text-sm font-semibold text-[#493522]">{order.customer.name}</p>
            <a className="mt-1 block break-all text-xs text-[#8c6740]" href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
            <a className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#8c6740]" href={`tel:${order.customer.phone}`}><FiPhone size={12} />{order.customer.phone}</a>
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#796a58]"><FiMapPin className="mt-1 shrink-0" size={12} />{order.customer.address}</p>
          </section>
          <section className="rounded-2xl border border-[#eee5d9] bg-white p-4">
            <h3 className="text-xs font-bold text-[#493522]">Order summary</h3>
            <p className="mt-3 flex justify-between text-xs text-[#796a58]"><span>Subtotal</span><span>{money(order.subtotal)}</span></p>
            <p className="mt-2 flex justify-between text-xs text-[#796a58]"><span>Delivery fee</span><span>{money(order.deliveryFee)}</span></p>
            <p className="mt-2 flex justify-between text-xs text-[#796a58]"><span>Tax</span><span>{money(order.tax)}</span></p>
            <p className="mt-3 flex justify-between border-t border-[#eee5d9] pt-3 text-sm font-bold text-[#493522]"><span>Total</span><span>{money(order.total)}</span></p>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#eee5d9] bg-white">
          <div className="border-b border-[#f1ece5] px-4 py-3">
            <h3 className="text-xs font-bold text-[#493522]">Ordered products</h3>
          </div>
          <div className="divide-y divide-[#f3eee7]">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                {item.image ? <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-[#f6f0e8]" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#493522]">{item.name}</p>
                  <p className="mt-1 text-[10px] text-[#9b8a75]">{item.quantity} × {money(item.unitPrice)}</p>
                </div>
                <p className="text-xs font-bold text-[#493522]">{money(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-4 text-[10px] leading-5 text-[#a08c74]">Sample order information only. No live transaction or payment has taken place.</p>
      </section>
    </div>
  )
}

export default OrderDetailsModal
