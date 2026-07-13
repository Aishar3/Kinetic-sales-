import Link from "next/link"
import { DollarSign, Target, Users, Zap, ArrowRight } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StageBadge, ScoreBar } from "@/components/dashboard/lead-badges"
import { activity, leads, pipelineStages } from "@/lib/dashboard-data"

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const { welcome } = await searchParams
  const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 5)
  const maxStage = Math.max(...pipelineStages.map((s) => s.count))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {welcome && (
        <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
          <Zap className="size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium text-foreground">
            Your subscription is active. Welcome to Kinetic — your workspace is ready.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s how your pipeline is performing today.</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
          View all leads
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Revenue (MTD)" value="$91,500" change="20.4%" icon={DollarSign} />
        <MetricCard label="Win rate" value="47%" change="6.2%" icon={Target} />
        <MetricCard label="Active leads" value="282" change="12.8%" icon={Users} />
        <MetricCard label="AI replies sent" value="1,382" change="31.0%" icon={Zap} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Revenue vs target</h2>
              <p className="text-sm text-muted-foreground">Last 8 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" /> Target
              </span>
            </div>
          </div>
          <div className="mt-4">
            <RevenueChart />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Pipeline</h2>
          <p className="text-sm text-muted-foreground">Deals by stage</p>
          <div className="mt-5 space-y-4">
            {pipelineStages.map((s) => (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.stage}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(s.count / maxStage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Priority leads</h2>
            <Link href="/dashboard/leads" className="text-sm font-medium text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Lead</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.company}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <ScoreBar score={l.score} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StageBadge stage={l.stage} />
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium tabular-nums">
                      ${l.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Recent activity</h2>
          <ul className="mt-5 space-y-4">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
