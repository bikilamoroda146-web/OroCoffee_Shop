import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiEye, FiSearch, FiUsers } from 'react-icons/fi'
import CustomerDetailsModal from '../../componnents/admin/CustomerDetailsModal'
import { mockCustomerService } from '../../services/mockCustomerService'

const currency = (amount) => `$${amount.toFixed(2)}`
const date = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setCustomers(await mockCustomerService.list())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load demo customers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customers
      .filter((customer) => customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query))
      .sort((first, second) => first.name.localeCompare(second.name))
  }, [customers, search])

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / Customers</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">Customers</h2>
          <p className="mt-1 text-sm text-[#927e67]">Browse mock customer profiles and sample order history.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" /> Demo data only
        </span>
      </div>
      <div className="rounded-2xl border border-[#eee5d9] bg-[#fffaf1] px-4 py-3 text-xs leading-5 text-[#8f754f]">
        Customer profiles and order totals are examples connected to the local demo orders. No authentication credentials are read or shown.
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#eee8df] bg-white shadow-[0_3px_14px_rgba(71,48,22,0.035)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#f1ece5] p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-[#493522]">Customer directory</h3>
            <p className="mt-1 text-[11px] text-[#a08c74]">{filteredCustomers.length} demo {filteredCustomers.length === 1 ? 'customer' : 'customers'}</p>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08c74]" size={15} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search customers by name or email" className="w-full rounded-xl border border-[#e8ddcf] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b88751]" />
          </label>
        </div>

        {loading ? (
          <div role="status" className="space-y-3 p-5">
            <p className="text-xs text-[#927e67]">Loading demo customers…</p>
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f7f2eb]" />)}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p role="alert" className="text-sm font-semibold text-[#a34f41]">{loadError}</p>
            <button type="button" onClick={loadCustomers} className="mt-3 rounded-lg border border-[#e8ddcf] px-4 py-2 text-xs font-bold text-[#70471f]">Try again</button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6f0e8] text-[#8f653a]"><FiUsers size={20} /></div>
            <p className="mt-3 text-sm font-bold text-[#493522]">No matching customers</p>
            <p className="mt-1 text-xs text-[#9b8a75]">Try another name or email address.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190 text-left">
                <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-wider text-[#a08c74]">
                  <tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Demo spend</th><th className="px-5 py-3 text-right">Details</th></tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-[#f3eee7]">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-[#493522]">{customer.name}</p>
                        <p className="mt-1 text-[10px] text-[#a08c74]">{customer.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{date(customer.registeredAt)}</td>
                      <td className="px-4 py-3.5 text-xs text-[#796a58]">{customer.orderCount}</td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#493522]">{currency(customer.totalSpent)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" onClick={() => setSelectedCustomer(customer)} aria-label={`View ${customer.name} details`} className="rounded-lg p-2 text-[#8c6740] hover:bg-[#f6f0e8]"><FiEye size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {filteredCustomers.map((customer) => (
                <article key={customer.id} className="rounded-xl border border-[#f0e9df] p-4">
                  <p className="text-xs font-bold text-[#493522]">{customer.name}</p>
                  <p className="mt-1 break-all text-[10px] text-[#a08c74]">{customer.email}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[#796a58]">
                    <span>{customer.orderCount} orders · {currency(customer.totalSpent)}</span>
                    <button type="button" onClick={() => setSelectedCustomer(customer)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-bold text-[#8c6740] hover:bg-[#f6f0e8]"><FiEye size={13} /> Details</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      {selectedCustomer && <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  )
}

export default AdminCustomers
