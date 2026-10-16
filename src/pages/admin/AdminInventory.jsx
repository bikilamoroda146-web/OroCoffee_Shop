import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertTriangle, FiCheck, FiSearch, FiX } from 'react-icons/fi'
import { mockProductService } from '../../services/mockProductService'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const LOW_STOCK_THRESHOLD = 5

function stockState(stock) {
  if (stock === 0) return { label: 'Out of stock', style: 'bg-[#f8e9e5] text-[#aa6153]' }
  if (stock <= LOW_STOCK_THRESHOLD) return { label: 'Low stock', style: 'bg-[#fbf1d9] text-[#9e7838]' }
  return { label: 'In stock', style: 'bg-[#eaf2e9] text-[#5f8064]' }
}

function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [stockValue, setStockValue] = useState('')
  const [pendingStock, setPendingStock] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const stockDialogRef = useRef(null)
  useDialogAccessibility(stockDialogRef, () => setPendingStock(null), Boolean(pendingStock))

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setProducts(await mockProductService.list())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load demo inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products
      .filter((product) => product.name.toLowerCase().includes(query))
      .filter((product) => {
        if (stockFilter === 'out') return product.stock === 0
        if (stockFilter === 'low') return product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
        if (stockFilter === 'available') return product.stock > LOW_STOCK_THRESHOLD
        return true
      })
      .sort((first, second) => first.name.localeCompare(second.name))
  }, [products, search, stockFilter])

  function beginEdit(product) {
    setEditingId(product.id)
    setStockValue(String(product.stock))
    setActionError('')
    setMessage('')
  }

  function requestSave(product) {
    const quantity = Number(stockValue)
    if (!Number.isInteger(quantity) || quantity < 0) {
      setActionError('Enter a whole-number stock quantity of zero or more.')
      return
    }
    setActionError('')
    setPendingStock({ product, quantity })
  }

  async function confirmStockChange() {
    if (!pendingStock) return
    setSaving(true)
    try {
      const updated = await mockProductService.update(pendingStock.product.id, { stock: pendingStock.quantity })
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setMessage(`${updated.name} stock updated to ${updated.stock} in demo data.`)
      setActionError('')
      setEditingId(null)
      setPendingStock(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update demo stock.')
      setPendingStock(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / Inventory</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">Inventory</h2>
          <p className="mt-1 text-sm text-[#927e67]">Review and adjust product stock quantities in the demo catalog.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" /> Demo data only
        </span>
      </div>
      <div className="rounded-2xl border border-[#eee5d9] bg-[#fffaf1] px-4 py-3 text-xs leading-5 text-[#8f754f]">
        Inventory quantities are shared with the admin product demo and saved in this browser only. They do not affect customer orders or a live database.
      </div>

      {message && <p role="status" className="rounded-xl border border-[#dce9d9] bg-[#eef5ed] px-4 py-3 text-xs font-semibold text-[#54765a]">{message}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-[#f0d8d2] bg-[#fbefec] px-4 py-3 text-xs font-semibold text-[#a34f41]">{actionError}</p>}

      <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#f1ece5] p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-[#493522]">Stock overview</h3>
            <p className="mt-1 text-[11px] text-[#a08c74]">{filteredProducts.length} demo {filteredProducts.length === 1 ? 'product' : 'products'}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(190px,1fr)_170px]">
            <label className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08c74]" size={15} />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search inventory products" className="w-full rounded-xl border border-[#e8ddcf] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b88751]" />
            </label>
            <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} aria-label="Filter stock status" className="rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs text-[#6f5d47] outline-none focus:border-[#b88751]">
              <option value="all">All stock statuses</option>
              <option value="available">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div role="status" className="space-y-3 p-5">
            <p className="text-xs text-[#927e67]">Loading demo inventory…</p>
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f7f2eb]" />)}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p role="alert" className="text-sm font-semibold text-[#a34f41]">{loadError}</p>
            <button type="button" onClick={loadProducts} className="mt-3 rounded-lg border border-[#e8ddcf] px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-bold text-[#493522]">No inventory matches</p>
            <p className="mt-1 text-xs text-[#9b8a75]">Try changing the search or stock filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-wider text-[#a08c74]">
                <tr><th className="px-5 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Current stock</th><th className="px-4 py-3">Stock status</th><th className="px-5 py-3 text-right">Adjust quantity</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const state = stockState(product.stock)
                  const isEditing = editingId === product.id
                  return (
                    <tr key={product.id} className="border-t border-[#f3eee7]">
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-48 items-center gap-3">
                          <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#493522]">{product.name}</p>
                            <p className="mt-1 text-[10px] text-[#a08c74]">{product.available ? 'Available for sale' : 'Unavailable for sale'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{product.category}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-[#493522]">{product.stock}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${state.style}`}>
                          {product.stock <= LOW_STOCK_THRESHOLD && <FiAlertTriangle size={11} />}
                          {state.label}
                        </span>
                        {product.stock === 0 && <p className="mt-1 text-[10px] font-semibold text-[#aa6153]">Unavailable — restock required</p>}
                        {product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && <p className="mt-1 text-[10px] text-[#9e7838]">Restock soon</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <form onSubmit={(event) => { event.preventDefault(); requestSave(product) }} className="flex items-center justify-end gap-1.5">
                            <label className="sr-only" htmlFor={`stock-${product.id}`}>New stock quantity for {product.name}</label>
                            <input id={`stock-${product.id}`} type="number" min="0" step="1" value={stockValue} onChange={(event) => setStockValue(event.target.value)} className="w-20 rounded-lg border border-[#e8ddcf] px-2 py-1.5 text-xs outline-none focus:border-[#b88751]" />
                            <button type="submit" aria-label={`Save stock for ${product.name}`} className="rounded-lg p-2 text-[#5f8064] hover:bg-[#eaf2e9]"><FiCheck size={15} /></button>
                            <button type="button" onClick={() => setEditingId(null)} aria-label={`Cancel stock edit for ${product.name}`} className="rounded-lg p-2 text-[#8c7963] hover:bg-[#f4ede4]"><FiX size={15} /></button>
                          </form>
                        ) : (
                          <div className="flex justify-end">
                            <button type="button" onClick={() => beginEdit(product)} className="rounded-lg border border-[#e8ddcf] px-3 py-1.5 text-[10px] font-bold text-[#805b35] hover:bg-[#f8f3ec]">Edit stock</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21170f]/45 p-4">
          <section ref={stockDialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="stock-confirm-title" className="w-full max-w-sm rounded-2xl bg-[#fffdf9] p-6 shadow-2xl">
            <h2 id="stock-confirm-title" className="text-base font-bold text-[#493522]">Confirm stock update</h2>
            <p className="mt-2 text-xs leading-5 text-[#927e67]">
              Set <strong>{pendingStock.product.name}</strong> stock to <strong>{pendingStock.quantity}</strong>?
              {pendingStock.quantity === 0 ? ' This marks the item out of stock.' : pendingStock.quantity <= LOW_STOCK_THRESHOLD ? ' This quantity triggers a low-stock warning.' : ''}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setPendingStock(null)} className="rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-xs font-bold text-[#806d57]">Keep current</button>
              <button type="button" disabled={saving} onClick={confirmStockChange} className="rounded-xl bg-[#542f00] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{saving ? 'Updating…' : 'Confirm update'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminInventory
