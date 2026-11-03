interface StatCardProps {
  label: string
  value: string
  hint?: string
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
