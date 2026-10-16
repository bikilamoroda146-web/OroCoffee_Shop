import { useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiLoader, FiMapPin, FiMail, FiPhone, FiShield, FiSmartphone, FiTruck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDialogAccessibility } from '../hooks/useDialogAccessibility'
import { mockOrderService, PAYMENT_STATUSES } from '../services/mockOrderService'
import { calculateOrderTotals, validateCartItems } from '../utils/orderTotals'

const PAYMENT_METHODS = [
  { id: 'telebirr', label: 'Telebirr', description: 'Mobile wallet · demo only', icon: FiSmartphone, demoOnly: true },
  { id: 'cbe-birr', label: 'CBE Birr', description: 'Mobile wallet · demo only', icon: FiSmartphone, demoOnly: true },
  { id: 'bank-card', label: 'Bank card', description: 'Card payment · demo only', icon: FiCreditCard, demoOnly: true },
  { id: 'cash-on-delivery', label: 'Cash on delivery', description: 'Delivery option · demo flow only', icon: FiTruck, demoOnly: false },
]

const money = (value) => `$${value.toFixed(2)}`
const CHECKOUT_ORDER_KEY = 'oro-demo-checkout-order'

function Checkout() {
  const { cartCount, cartItems, clearCart, cartError } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [demoOutcome, setDemoOutcome] = useState('success')
  const [formData, setFormData] = useState({
    address: user?.address || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [activeOrder, setActiveOrder] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUSES.PENDING)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restoringOrder, setRestoringOrder] = useState(true)
  const [error, setError] = useState('')
  const timeoutRef = useRef(null)
  const resolveSimulationRef = useRef(null)
  const simulationInProgressRef = useRef(false)
  const confirmationDialogRef = useRef(null)

  useDialogAccessibility(confirmationDialogRef, () => setConfirmationOpen(false), confirmationOpen)

  const cartValidationError = validateCartItems(cartItems)
  const totals = cartValidationError ? null : calculateOrderTotals(cartItems)
  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod)

  useEffect(() => {
    let isMounted = true
    const savedOrderId = sessionStorage.getItem(CHECKOUT_ORDER_KEY)
    if (!savedOrderId) {
      setRestoringOrder(false)
      return () => { isMounted = false }
    }

    mockOrderService.get(savedOrderId)
      .then((order) => {
        if (!isMounted) return
        if (order?.isDemoPayment) {
          setActiveOrder(order)
          setPaymentStatus(order.paymentStatus || PAYMENT_STATUSES.PENDING)
          setPaymentMethod(order.paymentMethod || PAYMENT_METHODS[0].id)
          setFormData({
            address: order.customer.address || '',
            email: order.customer.email || '',
            phone: order.customer.phone || '',
          })
        } else {
          sessionStorage.removeItem(CHECKOUT_ORDER_KEY)
        }
      })
      .catch((loadError) => {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : 'Unable to restore your demo order.')
      })
      .finally(() => {
        if (isMounted) setRestoringOrder(false)
      })

    return () => {
      isMounted = false
      if (timeoutRef.current !== null && resolveSimulationRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
        resolveSimulationRef.current(false)
        resolveSimulationRef.current = null
      }
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (error) setError('')
  }

  function validateForm() {
    if (!formData.address.trim()) return 'Please enter your shipping address.'
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address.'
    if (!formData.phone.trim()) return 'Please enter your phone number.'
    if (!selectedMethod) return 'Please select a payment method.'
    if (cartValidationError && !activeOrder) return cartValidationError
    if (!activeOrder && (!totals || cartItems.length === 0)) return 'Your cart is empty. Add some coffee before checking out.'
    return ''
  }

  function requestPayment() {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setConfirmationOpen(true)
  }

  async function startSimulation() {
    if (simulationInProgressRef.current) return
    simulationInProgressRef.current = true
    setConfirmationOpen(false)
    setLoading(true)
    setPaymentStatus(PAYMENT_STATUSES.PENDING)
    setError('')

    try {
      let order = activeOrder
      if (order) {
        order = await mockOrderService.updatePaymentStatus(order.id, PAYMENT_STATUSES.PENDING, paymentMethod)
      } else {
        const customerName = user?.name?.trim() || formData.email.trim().split('@')[0]
        order = await mockOrderService.create({
          customer: {
            name: customerName,
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
          },
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            image: item.image || '',
          })),
          ...totals,
          paymentMethod,
          paymentStatus: PAYMENT_STATUSES.PENDING,
          isDemoPayment: true,
        })
        setActiveOrder(order)
        sessionStorage.setItem(CHECKOUT_ORDER_KEY, order.id)
      }

      const shouldContinue = await new Promise((resolve) => {
        resolveSimulationRef.current = resolve
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null
          resolveSimulationRef.current = null
          resolve(true)
        }, 1200)
      })
      if (!shouldContinue) return
      const finalStatus = demoOutcome === 'success'
        ? PAYMENT_STATUSES.SUCCESS
        : PAYMENT_STATUSES.FAILED
      const updatedOrder = await mockOrderService.updatePaymentStatus(order.id, finalStatus, paymentMethod)
      setActiveOrder(updatedOrder)
      setPaymentStatus(finalStatus)
      if (finalStatus === PAYMENT_STATUSES.SUCCESS) {
        clearCart()
        sessionStorage.removeItem(CHECKOUT_ORDER_KEY)
      }
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'The demo payment could not be completed.')
      setPaymentStatus(activeOrder?.paymentStatus || PAYMENT_STATUSES.FAILED)
    } finally {
      simulationInProgressRef.current = false
      setLoading(false)
    }
  }

  async function cancelPayment() {
    if (!activeOrder) {
      setConfirmationOpen(false)
      setPaymentStatus(PAYMENT_STATUSES.CANCELLED)
      return
    }
    if (timeoutRef.current !== null && resolveSimulationRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      resolveSimulationRef.current(false)
      resolveSimulationRef.current = null
    }
    setLoading(true)
    try {
      const updatedOrder = await mockOrderService.updatePaymentStatus(
        activeOrder.id,
        PAYMENT_STATUSES.CANCELLED,
        paymentMethod,
      )
      setActiveOrder(updatedOrder)
      setPaymentStatus(PAYMENT_STATUSES.CANCELLED)
      sessionStorage.removeItem(CHECKOUT_ORDER_KEY)
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Unable to cancel this demo payment.')
    } finally {
      setLoading(false)
    }
  }

  if (restoringOrder) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center" role="status">Restoring your checkout…</div>
  }

  if (!activeOrder && (cartItems.length === 0 || cartValidationError || cartError)) {
    const message = cartError || cartValidationError || 'Your cart is empty. Add some coffee before checking out.'
    return (
      <main className="min-h-[55vh] bg-linear-to-b from-coffee-cream to-white px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-coffee-caramel bg-white p-8 text-center shadow-sm sm:p-10">
          <FiAlertCircle className="mx-auto mb-4 text-coffee-orange" size={40} aria-hidden="true" />
          <h1 className="text-2xl font-bold text-coffee-brown">{cartItems.length ? 'Cart needs attention' : 'Your cart is empty'}</h1>
          <p role={cartItems.length ? 'alert' : undefined} className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
          <Link to="/menu" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-coffee-orange px-6 py-3 font-bold text-white transition hover:bg-coffee-brown">Continue shopping</Link>
        </div>
      </main>
    )
  }

  const orderItems = activeOrder?.items || cartItems.map((item) => ({
    ...item,
    productId: item.id,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
  }))
  const displayedTotals = activeOrder || totals
  const displayedItemCount = orderItems.reduce((count, item) => count + Number(item.quantity || 0), 0)

  return (
    <main className="min-h-screen bg-linear-to-b from-coffee-cream to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b7043]">Oro Coffee Shop · Secure checkout demo</p>
          <h1 className="mt-2 text-3xl font-bold text-coffee-brown sm:text-4xl">Checkout</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Choose a payment option and review your order. This frontend demonstration does not process or verify real payments.</p>
        </div>

        {cartError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{cartError}</p>}
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {paymentStatus === PAYMENT_STATUSES.SUCCESS && activeOrder ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-green-200 bg-white p-6 text-center shadow-sm sm:p-10" aria-labelledby="payment-success-title">
            <FiCheckCircle size={58} className="mx-auto text-green-600" aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-green-700">Demonstration only · no real payment</p>
            <h2 id="payment-success-title" className="mt-2 text-3xl font-bold text-coffee-brown">Demo payment successful</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">Your simulated payment completed. No transaction was sent to a bank or payment provider.</p>
            <dl className="mt-7 space-y-3 rounded-2xl bg-coffee-cream p-5 text-left text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Order reference</dt><dd className="font-bold text-coffee-brown">{activeOrder.id}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Total amount</dt><dd className="font-bold text-coffee-brown">{money(activeOrder.total)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Demo payment method</dt><dd className="font-bold text-coffee-brown">{PAYMENT_METHODS.find((method) => method.id === activeOrder.paymentMethod)?.label || activeOrder.paymentMethod}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-600">Payment status</dt><dd className="font-bold text-green-700">{activeOrder.paymentStatus}</dd></div>
            </dl>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/orders" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-coffee-orange px-6 py-3 font-bold text-white hover:bg-coffee-brown">View orders</Link>
              <Link to="/menu" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-coffee-orange px-6 py-3 font-bold text-coffee-brown hover:bg-coffee-cream">Return to shopping</Link>
            </div>
          </section>
        ) : paymentStatus === PAYMENT_STATUSES.FAILED && activeOrder ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-10" aria-labelledby="payment-failed-title">
            <FiAlertCircle size={46} className="mx-auto text-red-500" aria-hidden="true" />
            <h2 id="payment-failed-title" className="mt-3 text-center text-2xl font-bold text-coffee-brown">Demo payment failed</h2>
            <p role="alert" className="mt-3 text-center text-sm leading-6 text-gray-600">The demonstration was configured to fail. Your cart and order details are preserved; no payment was taken.</p>
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-800">Order {activeOrder.id} · {money(activeOrder.total)}</p>
            <label htmlFor="retry-outcome" className="mt-6 block text-sm font-semibold text-coffee-brown">Next demo result</label>
            <select id="retry-outcome" value={demoOutcome} onChange={(event) => setDemoOutcome(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-coffee-caramel bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-orange">
              <option value="success">Success (test successful flow)</option>
              <option value="failure">Failure (test failure flow)</option>
            </select>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={requestPayment} className="min-h-11 rounded-xl bg-coffee-orange px-6 py-3 font-bold text-white hover:bg-coffee-brown">Retry same order</button>
              <button type="button" onClick={cancelPayment} disabled={loading} className="min-h-11 rounded-xl border border-coffee-caramel px-6 py-3 font-bold text-coffee-brown hover:bg-coffee-cream disabled:opacity-60">Cancel payment</button>
            </div>
          </section>
        ) : paymentStatus === PAYMENT_STATUSES.CANCELLED && activeOrder ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-coffee-caramel bg-white p-8 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-coffee-brown">Demo payment cancelled</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">Order {activeOrder.id} was cancelled in the demo. Your cart remains available so you can start a new checkout.</p>
            <Link to="/cart" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-coffee-orange px-6 py-3 font-bold text-white hover:bg-coffee-brown">Return to cart</Link>
          </section>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#eadbc7] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="shipping-heading">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee-cream text-coffee-orange"><FiMapPin size={20} /></span>
                  <div><h2 id="shipping-heading" className="text-lg font-bold text-coffee-brown">Delivery details</h2><p className="text-xs text-gray-500">Where should we bring your coffee?</p></div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-semibold text-coffee-brown">Shipping address</label>
                    <textarea id="checkout-address" name="address" value={formData.address} onChange={handleChange} rows={3} autoComplete="street-address" placeholder="Street, area, city" className="w-full rounded-xl border border-[#e8ddcf] px-4 py-3 text-sm outline-none transition focus:border-coffee-orange focus:ring-2 focus:ring-orange-100" />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-coffee-brown"><FiMail aria-hidden="true" /> Email</label>
                    <input id="checkout-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="min-h-11 w-full rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-sm outline-none focus:border-coffee-orange focus:ring-2 focus:ring-orange-100" />
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-coffee-brown"><FiPhone aria-hidden="true" /> Phone number</label>
                    <input id="checkout-phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} placeholder="(+251) 912 345 678" className="min-h-11 w-full rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-sm outline-none focus:border-coffee-orange focus:ring-2 focus:ring-orange-100" />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#eadbc7] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="payment-heading">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee-cream text-coffee-orange"><FiShield size={20} /></span>
                  <div><h2 id="payment-heading" className="text-lg font-bold text-coffee-brown">Payment method</h2><p className="text-xs text-gray-500">All options below are demonstrations only.</p></div>
                </div>
                <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
                  <legend className="sr-only">Choose a payment method</legend>
                  {PAYMENT_METHODS.map(({ id, label, description, icon: Icon, demoOnly }) => (
                    <label key={id} className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${paymentMethod === id ? 'border-coffee-orange bg-[#fff8ee] ring-1 ring-coffee-orange' : 'border-[#eee5d9] hover:border-[#d6b68f]'}`}>
                      <input type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="h-4 w-4 accent-[#b96b28]" />
                      <Icon className="shrink-0 text-coffee-orange" size={20} aria-hidden="true" />
                      <span className="min-w-0 flex-1"><span className="block font-bold text-coffee-brown">{label}</span><span className="mt-0.5 block text-xs text-gray-500">{description}</span></span>
                      {demoOnly && <span className="rounded-full bg-[#f6ead9] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#8b5f31]">Demo</span>}
                    </label>
                  ))}
                </fieldset>

                <div className="mt-5 rounded-2xl border border-dashed border-[#dfc7a7] bg-[#fffaf1] p-4">
                  <p className="text-sm font-bold text-coffee-brown">Test the simulated result</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">Choose the outcome used for the next demo attempt. No card details, PINs, passwords, or OTPs are requested.</p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="inline-flex min-h-9 items-center gap-2 text-sm text-coffee-brown"><input type="radio" name="demoOutcome" value="success" checked={demoOutcome === 'success'} onChange={() => setDemoOutcome('success')} className="accent-[#b96b28]" /> Simulate success</label>
                    <label className="inline-flex min-h-9 items-center gap-2 text-sm text-coffee-brown"><input type="radio" name="demoOutcome" value="failure" checked={demoOutcome === 'failure'} onChange={() => setDemoOutcome('failure')} className="accent-[#b96b28]" /> Simulate failure</label>
                  </div>
                </div>
              </section>
            </div>

            <aside className="rounded-3xl border border-[#eadbc7] bg-white p-5 shadow-sm lg:sticky lg:top-6 sm:p-6" aria-labelledby="summary-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="summary-heading" className="text-lg font-bold text-coffee-brown">Order summary</h2>
                <span className="rounded-full bg-coffee-cream px-3 py-1 text-xs font-bold text-[#8b5f31]">{displayedItemCount} {displayedItemCount === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1">
                {orderItems.map((item) => (
                  <div key={item.productId ?? item.id} className="flex items-center gap-3">
                    {item.image ? <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-coffee-cream" aria-hidden="true" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-coffee-brown">{item.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.quantity} × {money(item.unitPrice ?? item.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-coffee-brown">{money(item.lineTotal ?? (item.quantity * (item.unitPrice ?? item.price)))}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-[#eee5d9] pt-4 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{money(displayedTotals.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span>{money(displayedTotals.deliveryFee)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>{money(displayedTotals.tax)}</span></div>
                <div className="flex justify-between border-t border-[#eee5d9] pt-3 text-base font-bold text-coffee-brown"><span>Total</span><span>{money(displayedTotals.total)}</span></div>
              </div>
              <div className="mt-4 rounded-xl bg-[#f7f2eb] px-3 py-2.5 text-xs text-gray-600">
                <span className="font-semibold text-coffee-brown">Payment status: </span>
                {loading ? 'Pending · simulation in progress' : activeOrder ? paymentStatus : 'Pending · awaiting confirmation'}
              </div>
              {loading ? (
                <div className="mt-4 space-y-3">
                  <p className="flex items-center justify-center gap-2 text-sm font-semibold text-coffee-brown" role="status"><FiLoader className="animate-spin" aria-hidden="true" /> Simulating demo payment…</p>
                  {activeOrder ? <button type="button" onClick={cancelPayment} className="min-h-11 w-full rounded-xl border border-[#e8ddcf] px-4 py-2 text-sm font-bold text-coffee-brown hover:bg-coffee-cream">Cancel demo payment</button> : <p className="text-center text-xs text-gray-500">Preparing your demo order…</p>}
                </div>
              ) : (
                <button type="button" onClick={requestPayment} disabled={restoringOrder} className="mt-4 min-h-12 w-full rounded-xl bg-coffee-orange px-4 py-3 font-bold text-white shadow-sm transition hover:bg-coffee-brown disabled:cursor-not-allowed disabled:opacity-60">
                  {activeOrder ? 'Retry demo payment' : 'Review & confirm demo payment'}
                </button>
              )}
              <Link to="/cart" className="mt-3 block min-h-11 rounded-xl px-4 py-3 text-center text-sm font-bold text-[#87613c] hover:bg-coffee-cream">Return to cart</Link>
              <p className="mt-3 text-center text-[10px] leading-4 text-gray-500">Demo only. No real payment or order fulfillment is verified.</p>
            </aside>
          </div>
        )}
      </div>

      {confirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21170f]/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false) }}>
          <section ref={confirmationDialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="payment-confirm-title" aria-describedby="payment-confirm-description" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 id="payment-confirm-title" className="text-xl font-bold text-coffee-brown">Confirm demo payment</h2>
            <p id="payment-confirm-description" className="mt-3 text-sm leading-6 text-gray-600">Start a simulated {selectedMethod?.label} attempt for {money(displayedTotals.total)}? This will not contact a payment provider or charge you.</p>
            <p className="mt-3 rounded-xl bg-[#fff8ee] p-3 text-xs leading-5 text-[#805b32]">Selected test result: <strong>{demoOutcome === 'success' ? 'Success' : 'Failure'}</strong>. You can retry the same order after a simulated failure.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmationOpen(false)} className="min-h-11 rounded-xl border border-[#e8ddcf] px-5 py-2.5 text-sm font-bold text-coffee-brown hover:bg-coffee-cream">Go back</button>
              <button type="button" onClick={startSimulation} className="min-h-11 rounded-xl bg-coffee-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-coffee-brown">Confirm & simulate</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default Checkout
