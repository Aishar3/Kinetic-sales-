"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Inbox, Users, Workflow, BarChart3, Settings } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox, badge: 2 },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/automations", label: "Automations", icon: Workflow },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-ink px-4 py-5 text-ink-muted">
      <div className="px-2">
        <Logo className="text-[color:var(--color-background)]" />
      </div>

      <nav className="mt-8 flex-1 space-y-1" aria-label="Dashboard">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted/70">Workspace</p>
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[color:var(--color-ink-soft)] text-[color:var(--color-background)]"
                  : "text-ink-muted hover:bg-[color:var(--color-ink-soft)]/60 hover:text-[color:var(--color-background)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="size-[18px]" />
              {item.label}
              {item.badge && (
                <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="rounded-xl border border-ink-border bg-ink-soft p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[color:var(--color-background)]">AI conversations</span>
          <span className="text-ink-muted">68%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-border">
          <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
        </div>
        <p className="mt-2 text-xs text-ink-muted">1,382 of 2,000 this month</p>
      </div>
    </div>
  )
}
