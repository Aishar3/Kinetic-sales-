import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCountry, getPlan, priceFor, PLANS } from "@/lib/billing"
import { CheckoutForm } from "./checkout-form"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string; country?: string }>
}) {
  const sp = await searchParams
  const planId = sp.plan ?? "growth"
  const cycle = sp.cycle === "yearly" ? "yearly" : "monthly"
  const countryCode = sp.country ?? "US"

  const plan = getPlan(planId) ?? PLANS[1]
  const country = getCountry(countryCode)
  const amount = priceFor(plan, country, cycle)

  // Require auth. If not logged in, send to login and return here afterwards.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const next = `/checkout?plan=${planId}&cycle=${cycle}&country=${countryCode}`
    redirect(`/auth/login?next=${encodeURIComponent(next)}`)
  }

  return (
    <CheckoutForm
      planName={plan.name}
      planId={plan.id}
      cycle={cycle}
      countryCode={country.code}
      countryName={country.name}
      currency={country.currency}
      symbol={country.symbol}
      amount={amount}
      features={plan.features}
    />
  )
}
