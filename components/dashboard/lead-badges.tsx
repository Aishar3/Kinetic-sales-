import type { Lead } from "@/lib/dashboard-data"

const stageStyles: Record<Lead["stage"], string> = {
  New: "bg-muted text-muted-foreground",
  Qualified: "bg-sky-100 text-sky-700",
  Proposal: "bg-amber-100 text-amber-700",
  Negotiation: "bg-violet-100 text-violet-700",
  Won: "bg-emerald-100 text-emerald-700",
}

export function StageBadge({ stage }: { stage: Lead["stage"] }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stageStyles[stage]}`}>
      {stage}
    </span>
  )
}

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "var(--color-accent)" : score >= 70 ? "var(--color-warning)" : "var(--color-muted-foreground)"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-medium tabular-nums">{score}</span>
    </div>
  )
}
