import type { ComplaintCategory } from '../../types'
import { categoryLabel } from '../../utils'

const styles: Record<ComplaintCategory, string> = {
  billing: 'bg-amber-50 text-amber-700',
  technical: 'bg-blue-50 text-blue-700',
  service: 'bg-red-50 text-red-700',
  delivery: 'bg-green-50 text-green-700',
  other: 'bg-stone-100 text-stone-500',
}

const icons: Record<ComplaintCategory, string> = {
  billing: '💳',
  technical: '🔧',
  service: '🙍',
  delivery: '📦',
  other: '📋',
}

export default function CategoryTag({ category }: { category: ComplaintCategory }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles[category]}`}>
      {icons[category]} {categoryLabel[category]}
    </span>
  )
}