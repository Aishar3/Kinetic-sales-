export type Country = {
  code: string
  name: string
  currency: string
  symbol: string
  // conversion multiplier applied to the USD base price
  rate: number
}

// Supported countries with their currency + a simple display rate applied to the USD base price.
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", rate: 1 },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", rate: 83 },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", rate: 0.79 },
  { code: "EU", name: "Eurozone", currency: "EUR", symbol: "€", rate: 0.92 },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "AED ", rate: 3.67 },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", rate: 1.52 },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", rate: 1.36 },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", rate: 1.35 },
]

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]
}

export type Plan = {
  id: string
  name: string
  tagline: string
  // monthly base price in USD
  monthlyUsd: number
  featured?: boolean
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo reps getting started with AI selling.",
    monthlyUsd: 29,
    features: [
      "1 sales workspace",
      "Up to 500 AI conversations / mo",
      "Lead scoring & inbox",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams that live in their pipeline.",
    monthlyUsd: 79,
    featured: true,
    features: [
      "Up to 5 workspaces",
      "Up to 5,000 AI conversations / mo",
      "Advanced lead scoring & automations",
      "Full analytics suite",
      "Priority support",
      "CRM integrations",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For sales orgs that need power and control.",
    monthlyUsd: 199,
    features: [
      "Unlimited workspaces",
      "Unlimited AI conversations",
      "Custom automations & workflows",
      "Team analytics & forecasting",
      "Dedicated success manager",
      "SSO & advanced security",
    ],
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function priceFor(plan: Plan, country: Country, cycle: "monthly" | "yearly") {
  const base = plan.monthlyUsd * (cycle === "yearly" ? 12 * 0.8 : 1) // 20% off yearly
  const converted = base * country.rate
  // Round to a clean number
  const rounded = country.currency === "INR" ? Math.round(converted / 10) * 10 : Math.round(converted)
  return rounded
}

export function formatMoney(amount: number, country: Country) {
  return `${country.symbol}${amount.toLocaleString()}`
}

export type PaymentMethod = {
  id: string
  label: string
  // which country codes this method is available in; "*" means everywhere
  countries: string[]
  kind: "card" | "upi" | "wallet" | "netbanking"
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "card", label: "Credit / Debit Card", countries: ["*"], kind: "card" },
  { id: "upi", label: "UPI", countries: ["IN"], kind: "upi" },
  { id: "gpay", label: "Google Pay", countries: ["IN", "US", "SG", "AE"], kind: "wallet" },
  { id: "phonepe", label: "PhonePe", countries: ["IN"], kind: "wallet" },
  { id: "paytm", label: "Paytm", countries: ["IN"], kind: "wallet" },
  { id: "netbanking", label: "Net Banking", countries: ["IN"], kind: "netbanking" },
]

export function methodsForCountry(code: string): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.countries.includes("*") || m.countries.includes(code))
}
