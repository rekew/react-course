import { Link } from 'react-router-dom'

export interface BreakdownItem {
  label: string
  value: number
  href?: string
}

interface BreakdownProps {
  title: string
  items: BreakdownItem[]
  total: number
  emptyMessage?: string
}

export default function Breakdown({
  title,
  items,
  total,
  emptyMessage = 'No data available.',
}: BreakdownProps) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="font-medium hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium">{item.label}</span>
                  )}
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
