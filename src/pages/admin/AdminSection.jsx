import { Link } from 'react-router-dom'
import { FiArrowRight, FiPackage } from 'react-icons/fi'
import { adminNavigation } from '../../Data/adminDemoData'

const descriptions = {
  customers: 'See a sample view of your Oro customer directory.',
  inventory: 'Keep an eye on stock levels and items that need a restock.',
  reviews: 'A home for customer feedback and product ratings.',
  analytics: 'Explore example sales and store performance insights.',
  settings: 'Manage store preferences and administrator settings.',
}

function AdminSection({ section }) {
  const current = adminNavigation.find((item) => item.path.endsWith(`/${section}`))
  const title = current?.label || 'Admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#9b8a75]">Admin workspace / {title}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#493522]">{title}</h2>
          <p className="mt-1 text-sm text-[#927e67]">{descriptions[section] || 'Admin workspace section.'}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadbc7] bg-[#fbf4e9] px-3 py-2 text-[10px] font-semibold text-[#88663e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bb8b4c]" />
          Demo workspace
        </span>
      </div>

      <section className="flex min-h-85 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e6d7c4] bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5eee5] text-[#8f653a]"><FiPackage size={23} /></div>
        <h3 className="mt-4 text-sm font-bold text-[#493522]">{title} preview</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-[#9b8a75]">
          This section is ready for its frontend workflow. It will remain a demo until connected to a backend.
        </p>
        <Link to="/admin/dashboard" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#8c5b2c] hover:text-[#542f00]">
          Back to overview <FiArrowRight size={14} />
        </Link>
      </section>

      <p className="text-[10px] leading-5 text-[#a08c74]">Values and content on this page are mock data for layout preview only; no live store operations are available.</p>
    </div>
  )
}

export default AdminSection
