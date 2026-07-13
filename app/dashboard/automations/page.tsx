"use client"

import { useState } from "react"
import { Workflow, Zap } from "lucide-react"
import { automations as seed } from "@/lib/dashboard-data"

export default function AutomationsPage() {
  const [items, setItems] = useState(seed)

  function toggle(id: string) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
  }

  const activeCount = items.filter((a) => a.active).length

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount} of {items.length} automations active
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                a.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <Workflow className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{a.name}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {a.trigger}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="size-3 text-accent" />
                {a.runs.toLocaleString()} runs this month
              </p>
            </div>
            <button
              role="switch"
              aria-checked={a.active}
              aria-label={`Toggle ${a.name}`}
              onClick={() => toggle(a.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                a.active ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  a.active ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
