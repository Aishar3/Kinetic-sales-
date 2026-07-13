import { DollarSign, Clock, Percent, TrendingUp } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PipelineValueChart, LeadSourceChart } from "@/components/dashboard/analytics-charts"

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track performance across your entire funnel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total revenue" value="$518,800" change="18.2%" icon={DollarSign} />
        <MetricCard label="Avg. deal size" value="$32,400" change="4.1%" icon={TrendingUp} />
        <MetricCard label="Win rate" value="47%" change="6.2%" icon={Percent} />
        <MetricCard label="Avg. sales cycle" value="21 days" change="9.0%" positive={false} icon={Clock} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Revenue trend</h2>
        <p className="text-sm text-muted-foreground">Revenue vs target over time</p>
        <div className="mt-4">
          <RevenueChart />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Pipeline value by stage</h2>
          <p className="text-sm text-muted-foreground">Where your revenue sits today</p>
          <div className="mt-4">
            <PipelineValueChart />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Lead sources</h2>
          <p className="text-sm text-muted-foreground">Where your leads come from</p>
          <div className="mt-4">
            <LeadSourceChart />
          </div>
        </div>
      </div>
    </div>
  )
}
