import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import { mockProductService } from '../../services/mockProductService'
import ProductFormModal from '../../componnents/admin/ProductFormModal'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const PAGE_SIZE = 6

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const deleteDialogRef = useRef(null)
  useDialogAccessibility(deleteDialogRef, () => setDeletingProduct(null), Boolean(deletingProduct))

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setProducts(await mockProductService.list())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load demo products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const categories = useMemo(
    () => [...new Set([...products.map((product) => product.category).filter(Boolean), 'Espresso', 'Brewed Coffee', 'Signature'])].sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products
      .filter((product) => product.name.toLowerCase().includes(query))
      .filter((product) => category === 'all' || product.category === category)
      .sort((first, second) => {
        if (sort === 'name-asc') return first.name.localeCompare(second.name)
        if (sort === 'name-desc') return second.name.localeCompare(first.name)
        if (sort === 'price-asc') return first.price - second.price
        return second.price - first.price
      })
  }, [products, search, category, sort])

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, category, sort])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  async function saveProduct(productData) {
    try {
      if (editingProduct) {
        const updated = await mockProductService.update(editingProduct.id, productData)
        setProducts((current) => current.map((product) => product.id === updated.id ? updated : product))
        setMessage(`${updated.name} updated in demo data.`)
      } else {
        const created = await mockProductService.create(productData)
        setProducts((current) => [created, ...current])
        setMessage(`${created.name} added to demo data.`)
      }
      setActionError('')
      setFormOpen(false)
      setEditingProduct(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save this demo product.')
      throw error
    }
  }

  async function confirmDelete() {
    if (!deletingProduct) return
    try {
      await mockProductService.remove(deletingProduct.id)
      setProducts((current) => current.filter((product) => product.id !== deletingProduct.id))
      setMessage(`${deletingProduct.name} removed from demo data.`)
      setActionError('')
      setDeletingProduct(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete this demo product.')
      setDeletingProduct(null)
    }
  }

  async function toggleAvailability(product) {
    try {
      const updated = await mockProductService.update(product.id, { available: !product.available })
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setMessage(`${updated.name} marked ${updated.available ? 'available' : 'unavailable'} in demo data.`)
      setActionError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update availability.')
    }
  }

  function startEdit(product) {
    setEditingProduct(product)
    setFormOpen(true)
    setActionError('')
    setMessage('')
  }

  function startAdd() {
    setEditingProduct(null)
    setFormOpen(true)
    setActionError('')
    setMessage('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / Products</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">Products</h2>
          <p className="mt-1 text-sm text-[#927e67]">Manage the coffee catalog shown in this admin demo.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" /> Demo data only
        </span>
      </div>

      <div className="rounded-2xl border border-[#eee5d9] bg-[#fffaf1] px-4 py-3 text-xs leading-5 text-[#8f754f]">
        Product edits are stored in this browser for demonstration and do not change the customer-facing menu or a live database.
      </div>

      {message && <p role="status" className="rounded-xl border border-[#dce9d9] bg-[#eef5ed] px-4 py-3 text-xs font-semibold text-[#54765a]">{message}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-[#f0d8d2] bg-[#fbefec] px-4 py-3 text-xs font-semibold text-[#a34f41]">{actionError}</p>}

      <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#f1ece5] p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-[#493522]">Coffee catalog</h3>
            <p className="mt-1 text-[11px] text-[#a08c74]">{filteredProducts.length} demo {filteredProducts.length === 1 ? 'product' : 'products'}</p>
          </div>
          <button type="button" onClick={startAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#542f00] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#70471f]">
            <FiPlus size={15} /> Add product
          </button>
        </div>

        <div className="grid gap-3 border-b border-[#f1ece5] p-4 sm:grid-cols-[minmax(200px,1fr)_180px_180px]">
          <label className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08c74]" size={15} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product name" aria-label="Search product name" className="w-full rounded-xl border border-[#e8ddcf] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b88751]" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" className="rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs text-[#6f5d47] outline-none focus:border-[#b88751]">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" className="rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-xs text-[#6f5d47] outline-none focus:border-[#b88751]">
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {loading ? (
          <div role="status" className="space-y-3 p-5">
            <p className="text-xs text-[#927e67]">Loading demo products…</p>
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f7f2eb]" />)}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p role="alert" className="text-sm font-semibold text-[#a34f41]">{loadError}</p>
            <button type="button" onClick={loadProducts} className="mt-3 rounded-lg border border-[#e8ddcf] px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-bold text-[#493522]">{products.length ? 'No matching products' : 'No demo products yet'}</p>
            <p className="mt-1 text-xs text-[#9b8a75]">{products.length ? 'Try a different search or category filter.' : 'Add a coffee product to get started.'}</p>
            {products.length === 0 && <button type="button" onClick={startAdd} className="mt-4 rounded-xl bg-[#542f00] px-4 py-2.5 text-xs font-bold text-white">Add product</button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left">
                <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-wider text-[#a08c74]">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
                    <tr key={product.id} className="border-t border-[#f3eee7]">
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-52 items-center gap-3">
                          <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#493522]">{product.name}</p>
                            <p className="mt-1 max-w-xs truncate text-[10px] text-[#a08c74]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{product.category}</td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#493522]">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{product.stock}</td>
                      <td className="px-4 py-3.5">
                        <button type="button" role="switch" aria-checked={product.available} aria-label={`${product.available ? 'Disable' : 'Enable'} ${product.name}`} onClick={() => toggleAvailability(product)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${product.available ? 'bg-[#66836a]' : 'bg-[#c6b9a8]'}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${product.available ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`ml-2 text-[10px] font-semibold ${product.available ? 'text-[#608067]' : 'text-[#9b8a75]'}`}>{product.available ? 'Available' : 'Unavailable'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-[#8c6740] hover:bg-[#f6f0e8]"><FiEdit2 size={15} /></button>
                          <button type="button" onClick={() => { setDeletingProduct(product); setMessage(''); setActionError('') }} aria-label={`Delete ${product.name}`} className="rounded-lg p-2 text-[#ac6558] hover:bg-[#fbefec]"><FiTrash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#f1ece5] px-4 py-3 sm:flex-row">
              <p className="text-[10px] text-[#9b8a75]">Showing {filteredProducts.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} products</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page" className="rounded-lg border border-[#e8ddcf] p-2 text-[#806d57] hover:bg-[#f8f3ec] disabled:opacity-40"><FiChevronLeft size={15} /></button>
                <span className="min-w-16 text-center text-[10px] font-semibold text-[#806d57]">Page {page} of {pageCount}</span>
                <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Next page" className="rounded-lg border border-[#e8ddcf] p-2 text-[#806d57] hover:bg-[#f8f3ec] disabled:opacity-40"><FiChevronRight size={15} /></button>
              </div>
            </div>
          </>
        )}
      </section>

      {formOpen && <ProductFormModal product={editingProduct} categories={categories} onClose={() => { setFormOpen(false); setEditingProduct(null) }} onSave={saveProduct} />}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21170f]/45 p-4">
          <section ref={deleteDialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-sm rounded-2xl bg-[#fffdf9] p-6 shadow-2xl">
            <h2 id="delete-product-title" className="text-base font-bold text-[#493522]">Delete {deletingProduct.name}?</h2>
            <p className="mt-2 text-xs leading-5 text-[#927e67]">This removes the product from this browser’s demo catalog. It does not affect the customer menu or a database.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingProduct(null)} className="rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-xs font-bold text-[#806d57]">Cancel</button>
              <button type="button" onClick={confirmDelete} className="rounded-xl bg-[#a95445] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#91483c]">Delete product</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
