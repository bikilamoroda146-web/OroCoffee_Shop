import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiBell, FiChevronDown, FiChevronRight, FiSearch, FiUser } from 'react-icons/fi'
import { adminNavigation } from '../../Data/adminDemoData'

const sectionTitles = Object.fromEntries(
  adminNavigation.map(({ path, label }) => [path.split('/').at(-1), label]),
)

function AdminHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const section = location.pathname.split('/').filter(Boolean).at(-1) || 'dashboard'
  const title = sectionTitles[section] || 'Dashboard'
  const isOverview = section === 'dashboard'

  function handleSearch(event) {
    event.preventDefault()
    const query = search.trim().toLowerCase()
    if (!query) return
    const destination = adminNavigation.find(({ label }) => label.toLowerCase().includes(query))
    if (destination) navigate(destination.path)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#eee5d9] bg-[#fffdf9]/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 hidden items-center gap-1.5 text-[11px] text-[#a08c74] sm:flex">
            <Link to="/admin/dashboard" className="hover:text-[#542f00]">Admin</Link>
            {!isOverview && (
              <>
                <FiChevronRight size={12} />
                <span className="text-[#755432]">{title}</span>
              </>
            )}
          </div>
          <h1 className="truncate text-lg font-bold tracking-tight text-[#382716] sm:text-xl">{title}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <form onSubmit={handleSearch} className="hidden h-10 w-52 items-center gap-2 rounded-xl border border-[#eee5d9] bg-white px-3 focus-within:border-[#bc8b55] md:flex xl:w-64">
            <FiSearch className="shrink-0 text-[#a38f78]" size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dashboard"
              aria-label="Search dashboard navigation"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#4f4030] outline-none placeholder:text-[#b4a794]"
            />
            <kbd className="rounded border border-[#eee5d9] px-1.5 py-0.5 text-[9px] text-[#aa9a87]">⌕</kbd>
          </form>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((visible) => !visible)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee5d9] bg-white text-[#756552] hover:bg-[#f8f3ec]"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <FiBell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c77857]" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-[#eee5d9] bg-white p-4 shadow-xl">
                <p className="text-sm font-bold text-[#493522]">You’re all caught up</p>
                <p className="mt-1 text-xs leading-5 text-[#927e67]">Notifications are examples in this demo workspace.</p>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-[#f6f0e8]"
              aria-label="Open admin profile menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8d5bd] text-sm font-bold text-[#542f00]">O</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-[#493522]">Oro Admin</span>
                <span className="block text-[10px] text-[#a08c74]">Store manager</span>
              </span>
              <FiChevronDown className="hidden text-[#9c8a75] sm:block" size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl border border-[#eee5d9] bg-white p-2 shadow-xl">
                <div className="flex items-center gap-2 border-b border-[#f1e9df] px-2 py-2.5">
                  <FiUser className="text-[#8c6945]" />
                  <div>
                    <p className="text-xs font-bold text-[#493522]">Oro Admin</p>
                    <p className="text-[10px] text-[#a08c74]">Demo administrator</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-1 w-full rounded-lg px-2 py-2 text-left text-xs font-semibold text-[#8c6758] hover:bg-[#fbefeb]"
                >
                  Exit admin demo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
