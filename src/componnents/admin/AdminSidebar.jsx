import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiBarChart2,
  FiCoffee,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiStar,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { adminNavigation } from '../../Data/adminDemoData'
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility'

const icons = {
  overview: FiGrid,
  products: FiCoffee,
  orders: FiShoppingBag,
  customers: FiUsers,
  inventory: FiPackage,
  reviews: FiStar,
  analytics: FiBarChart2,
  settings: FiSettings,
}

function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const sidebarRef = useRef(null)
  useDialogAccessibility(sidebarRef, () => setMobileOpen(false), mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  function leavePreview() {
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#eee5d9] bg-[#fffdf9] px-5 py-4 lg:hidden">
        <Link to="/admin/dashboard" className="flex items-center gap-3" aria-label="Oro admin overview">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#542f00] text-xl text-[#fff8ed]">
            <FiCoffee />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide text-[#542f00]">ORO COFFEE</span>
            <span className="text-xs text-[#927e67]">Admin workspace</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-[#542f00] hover:bg-[#f5eee5]"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={21} /> : <FiMenu size={21} />}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-[#25190f]/35 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? 'true' : undefined}
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-67.5 shrink-0 flex-col border-r border-[#eee5d9] bg-[#fffdf9] px-4 py-5 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/admin/dashboard" className="mb-10 hidden items-center gap-3 px-2 lg:flex" aria-label="Oro admin overview">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#542f00] text-2xl text-[#fff8ed]">
            <FiCoffee />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[0.12em] text-[#542f00]">ORO COFFEE</span>
            <span className="text-xs text-[#927e67]">Admin workspace</span>
          </span>
        </Link>

        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ad9b84]">Workspace</div>
        <nav className="flex-1 space-y-1" aria-label="Admin navigation">
          {adminNavigation.map(({ label, path, icon }) => {
            const Icon = icons[icon]
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-[#542f00] text-white shadow-sm'
                      : 'text-[#746657] hover:bg-[#f6f0e8] hover:text-[#542f00]'
                  }`
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mb-4 rounded-2xl border border-[#efe3d2] bg-[#faf5ee] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#754b23]">
            <FiActivity size={15} />
            <span className="text-xs font-bold">Demo workspace</span>
          </div>
          <p className="text-[11px] leading-5 text-[#907e68]">Dashboard values are sample data and are not connected to a live store.</p>
        </div>

        <div className="border-t border-[#eee5d9] pt-4">
          <button
            type="button"
            onClick={leavePreview}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#8c6758] transition hover:bg-[#fbefeb] hover:text-[#9e4d3d]"
          >
            <FiLogOut size={17} />
            Exit admin demo
          </button>
          <p className="px-3 pt-2 text-[10px] text-[#ad9b84]">Oro Coffee Shop · Demo</p>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
