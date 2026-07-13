"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Globe } from "lucide-react"
import { COUNTRIES, PLANS, formatMoney, getCountry, priceFor } from "@/lib/billing"

export function Pricing() {
  const router = useRouter()
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly")
  const [countryCode, setCountryCode] = useState("US")
  const country = getCountry(countryCode)

  function choosePlan(planId: string) {
    router.push(`/checkout?plan=${planId}&cycle=${cycle}&country=${countryCode}`)
  }

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Start with a 14-day free trial. Cancel anytime. Prices shown in your local currency.
          </p>
        </div>

        {/* controls */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-1.5 rounded bg-accent/15 px-1.5 py-0.5 text-xs font-semibold text-accent">-20%</span>
            </button>
          </div>

          <div className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
            <Globe className="size-4 text-muted-foreground" />
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label="Select your country"
              className="bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* plans */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = priceFor(plan, country, cycle)
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm ${
                  plan.featured ? "border-primary ring-1 ring-primary" : "border-border"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{plan.tagline}</p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">{formatMoney(price, country)}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/{cycle === "yearly" ? "yr" : "mo"}</span>
                </div>

                <button
                  onClick={() => choosePlan(plan.id)}
                  className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                    plan.featured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Start free trial
                </button>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
