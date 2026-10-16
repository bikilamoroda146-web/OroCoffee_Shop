import products from '../Data/products'

const STORAGE_KEY = 'oro-admin-demo-products'
const categories = ['Espresso', 'Brewed Coffee', 'Signature']
const initialProducts = products.map((product, index) => ({
  ...product,
  category: categories[index % categories.length],
  available: index !== 4,
  stock: [42, 28, 13, 35, 9, 22, 18][index],
}))

function readProducts() {
  const savedProducts = localStorage.getItem(STORAGE_KEY)
  if (!savedProducts) return initialProducts

  const parsedProducts = JSON.parse(savedProducts)
  if (!Array.isArray(parsedProducts)) {
    throw new Error('Demo product data is invalid. Clear the admin demo data to reset it.')
  }
  return parsedProducts
}

function saveProducts(nextProducts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts))
  return nextProducts
}

export const mockProductService = {
  async list() {
    return readProducts()
  },

  async create(product) {
    const currentProducts = readProducts()
    const newProduct = { ...product, id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
    saveProducts([newProduct, ...currentProducts])
    return newProduct
  },

  async update(id, changes) {
    const currentProducts = readProducts()
    const exists = currentProducts.some((product) => product.id === id)
    if (!exists) throw new Error('This product no longer exists. Refresh the list and try again.')

    const nextProducts = currentProducts.map((product) => (
      product.id === id ? { ...product, ...changes, id } : product
    ))
    saveProducts(nextProducts)
    return nextProducts.find((product) => product.id === id)
  },

  async remove(id) {
    const currentProducts = readProducts()
    const nextProducts = currentProducts.filter((product) => product.id !== id)
    if (nextProducts.length === currentProducts.length) {
      throw new Error('This product no longer exists. Refresh the list and try again.')
    }
    saveProducts(nextProducts)
  },
}
