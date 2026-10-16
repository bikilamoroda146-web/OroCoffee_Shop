export function validateCartItems(items) {
  if (!Array.isArray(items)) return 'Cart data is invalid. Please return to your cart and review it.'
  if (items.length === 0) return 'Your cart is empty. Add some coffee before checking out.'
  const hasInvalidItem = items.some((item) => (
    !item
    || (typeof item.id !== 'string' && typeof item.id !== 'number')
    || typeof item.name !== 'string'
    || !item.name.trim()
    || !Number.isFinite(Number(item.price))
    || Number(item.price) < 0
    || !Number.isInteger(Number(item.quantity))
    || Number(item.quantity) <= 0
  ))
  return hasInvalidItem ? 'One or more cart items are invalid. Please update your cart before checkout.' : ''
}

export function calculateOrderTotals(items) {
  const validationError = validateCartItems(items)
  if (validationError) throw new Error(validationError)

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  const deliveryFee = 8
  const tax = subtotal * 0.1
  return {
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee,
    tax: Number(tax.toFixed(2)),
    total: Number((subtotal + deliveryFee + tax).toFixed(2)),
  }
}
