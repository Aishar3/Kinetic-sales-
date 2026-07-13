"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { leads, type Lead } from "@/lib/dashboard-data"
import { StageBadge, ScoreBar } from "@/components/dashboard/lead-badges"

const stages: (Lead["stage"] | "All")[] = ["All", "New", "Qualified", "Proposal", "Negotiation", "Won"]

export default function LeadsPage() {
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<Lead["stage"] | "All">("All")

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesQuery =
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.company.toLowerCase().includes(query.toLowerCase())
      const matchesStage = stage === "All" || l.stage === stage
      return matchesQuery && matchesStage
    })
  }, [query, stage])

  const totalValue = filtered.reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} leads · ${totalValue.toLocaleString()} in pipeline
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                stage === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Lead</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium">Stage</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                  <td className="px-6 py-3.5">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.company}</div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{l.email}</td>
                  <td className="px-6 py-3.5">
                    <ScoreBar score={l.score} />
                  </td>
                  <td className="px-6 py-3.5">
                    <StageBadge stage={l.stage} />
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{l.owner}</td>
                  <td className="px-6 py-3.5 text-right font-medium tabular-nums">${l.value.toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No leads match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
