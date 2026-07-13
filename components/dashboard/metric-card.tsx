import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function MetricCard({
  label,
  value,
  change,
  positive = true,
  icon: Icon,
}: {
  label: string
  value: string
  change: string
  positive?: boolean
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <div
        className={cn(
          "mt-1.5 inline-flex items-center gap-1 text-sm font-medium",
          positive ? "text-accent" : "text-destructive",
        )}
      >
        {positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        {change}
        <span className="font-normal text-muted-foreground">vs last month</span>
      </div>
    </div>
  )
}
