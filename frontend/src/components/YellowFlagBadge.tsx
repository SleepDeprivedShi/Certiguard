interface YellowFlagBadgeProps {
  count: number
}

export default function YellowFlagBadge({ count }: YellowFlagBadgeProps) {
  return (
    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
      {count} Yellow Flag{count > 1 ? 's' : ''}
    </span>
  )
}