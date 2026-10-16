import { Outlet } from 'react-router-dom'
import AdminHeader from '../../componnents/admin/AdminHeader'
import AdminSidebar from '../../componnents/admin/AdminSidebar'

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f6f2] text-[#382716] lg:flex">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <div className="mx-auto w-full max-w-360">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-[#eee5d9] px-4 py-4 text-center text-[10px] text-[#a08c74] sm:px-7 lg:px-9">
          Oro Coffee Shop admin preview <span className="px-1">·</span> Demo only; admin routes are not access-controlled
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout
