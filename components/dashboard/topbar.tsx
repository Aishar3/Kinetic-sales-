"use client"

import { useState } from "react"
import { Search, Menu, X, LogOut, ChevronDown } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { Sidebar } from "./sidebar"

export function Topbar({ name, email, plan }: { name: string; email: string; plan: string }) {
  const [drawer, setDrawer] = useState(false)
  const [menu, setMenu] = useState(false)
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <button
          className="grid size-9 place-items-center rounded-lg border border-border lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search leads, deals, conversations…"
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
          />
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">{name}</span>
              <span className="block text-xs capitalize leading-tight text-muted-foreground">{plan} plan</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72">
            <button
              className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-ink-muted"
              onClick={() => setDrawer(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
    </>
  )
}
