export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'
  return (
    <span
      className={`${dim} border-2 border-stone-200 border-t-blue-600 rounded-full animate-spin inline-block`}
    />
  )
}