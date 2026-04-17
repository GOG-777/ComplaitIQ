import type { ComplaintStatus } from '../../types'

const styles: Record<ComplaintStatus, string> = {
  open: 'text-red-600',
  pending: 'text-amber-600',
  resolved: 'text-green-700',
}

export default function StatusDot({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${styles[status]}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-70" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}