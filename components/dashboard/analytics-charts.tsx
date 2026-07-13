"use client"

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { leadSources, pipelineStages } from "@/lib/dashboard-data"

const pieColors = ["var(--color-primary)", "var(--color-accent)", "#f59e0b", "#8b5cf6"]

export function PipelineValueChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pipelineStages} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="stage"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              fontSize: 13,
            }}
            formatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LeadSourceChart() {
  return (
    <div className="flex h-64 w-full items-center">
      <ResponsiveContainer width="60%" height="100%">
        <PieChart>
          <Pie data={leadSources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
            {leadSources.map((_, i) => (
              <Cell key={i} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              fontSize: 13,
            }}
            formatter={(v: number) => `${v}%`}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-2">
        {leadSources.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2 text-sm">
            <span className="size-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
            <span className="text-muted-foreground">{s.name}</span>
            <span className="ml-auto font-medium">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
