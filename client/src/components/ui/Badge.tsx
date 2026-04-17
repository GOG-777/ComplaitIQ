interface BadgeProps {
  variant: 'low' | 'medium' | 'high'
  selected?: boolean
  onClick?: () => void
}

const styles = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export default function Badge({ variant, selected, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold
        transition-all duration-150
        ${styles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-current' : ''}
      `}
    >
      {variant.charAt(0).toUpperCase() + variant.slice(1)}
    </span>
  )
}