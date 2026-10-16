import { useEffect, useRef, useState } from 'react'
import { FiImage, FiX } from 'react-icons/fi'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  available: true,
  stock: '',
}

function ProductFormModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(emptyProduct)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dialogRef = useRef(null)
  useDialogAccessibility(dialogRef, () => {
    if (!saving) onClose()
  })

  useEffect(() => {
    if (!product) {
      setForm({ ...emptyProduct, category: categories[0] || '' })
      return
    }
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      category: product.category || categories[0] || '',
      image: product.image || '',
      available: product.available ?? true,
      stock: String(product.stock ?? ''),
    })
  }, [product, categories])

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  async function submit(event) {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (!form.name.trim() || !form.description.trim() || !form.category || !form.image.trim()) {
      setError('Complete all required fields before saving.')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a price greater than zero.')
      return
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of zero or more.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        image: form.image.trim(),
        available: form.available,
        stock,
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this demo product.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21170f]/45 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose()
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf9] p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a17b50]">Product catalog · demo</p>
            <h2 id="product-form-title" className="mt-1 text-xl font-bold text-[#493522]">{product ? 'Edit product' : 'Add product'}</h2>
            <p className="mt-1 text-xs text-[#927e67]">Changes are stored in this browser’s demo data only.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close product form" className="rounded-lg p-2 text-[#8c7963] hover:bg-[#f4ede4] disabled:opacity-50">
            <FiX size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-semibold text-[#634d35]">
            Product name <span className="text-[#b65f4e]">*</span>
            <input name="name" value={form.name} onChange={updateField} maxLength={80} required className="mt-1.5 w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b88751]" />
          </label>

          <label className="block text-xs font-semibold text-[#634d35]">
            Description <span className="text-[#b65f4e]">*</span>
            <textarea name="description" value={form.description} onChange={updateField} rows={3} maxLength={400} required className="mt-1.5 w-full resize-y rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b88751]" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#634d35]">
              Price ($) <span className="text-[#b65f4e]">*</span>
              <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={updateField} required className="mt-1.5 w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b88751]" />
            </label>
            <label className="block text-xs font-semibold text-[#634d35]">
              Category <span className="text-[#b65f4e]">*</span>
              <select name="category" value={form.category} onChange={updateField} required className="mt-1.5 w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b88751]">
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#634d35]">
              Image URL <span className="text-[#b65f4e]">*</span>
              <span className="relative mt-1.5 block">
                <FiImage className="absolute left-3 top-3 text-[#a08c74]" />
                <input name="image" type="url" value={form.image} onChange={updateField} required placeholder="https://example.com/coffee.jpg" className="w-full rounded-xl border border-[#e8ddcf] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#b88751]" />
              </span>
            </label>
            <label className="block text-xs font-semibold text-[#634d35]">
              Stock quantity <span className="text-[#b65f4e]">*</span>
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} required className="mt-1.5 w-full rounded-xl border border-[#e8ddcf] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b88751]" />
            </label>
          </div>

          {form.image && (
            <div className="flex items-center gap-3 rounded-xl bg-[#f7f2eb] p-2.5">
              <img src={form.image} alt="Product preview" className="h-12 w-12 rounded-lg object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />
              <span className="text-[11px] text-[#806d57]">Image preview</span>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#eee5d9] bg-white px-3 py-3">
            <input type="checkbox" name="available" checked={form.available} onChange={updateField} className="h-4 w-4 accent-[#70471f]" />
            <span>
              <span className="block text-xs font-semibold text-[#634d35]">Available for sale</span>
              <span className="mt-0.5 block text-[10px] text-[#9b8a75]">Control whether this demo item is listed as available.</span>
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-[#fbece8] px-3 py-2 text-xs font-medium text-[#a34f41]">{error}</p>}

          <div className="flex flex-col-reverse gap-2 border-t border-[#eee5d9] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-[#e8ddcf] px-4 py-2.5 text-xs font-bold text-[#806d57] hover:bg-[#f8f3ec] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#542f00] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#70471f] disabled:cursor-wait disabled:opacity-60">
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProductFormModal
