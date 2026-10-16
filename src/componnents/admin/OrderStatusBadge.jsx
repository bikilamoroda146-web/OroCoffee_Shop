const statusStyles = {
  Pending: 'bg-[#fbf1d9] text-[#9e7838]',
  Confirmed: 'bg-[#eaf0f6] text-[#5d7895]',
  Preparing: 'bg-[#f5ebdc] text-[#986a35]',
  'Ready for Pickup': 'bg-[#eee9f5] text-[#756294]',
  'Out for Delivery': 'bg-[#e9f0f5] text-[#597b94]',
  Delivered: 'bg-[#eaf2e9] text-[#5f8064]',
  Cancelled: 'bg-[#f8e9e5] text-[#aa6153]',
}

function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[status] || 'bg-[#f1eee9] text-[#786b5b]'}`}>
      {status}
    </span>
  )
}

export default OrderStatusBadge
