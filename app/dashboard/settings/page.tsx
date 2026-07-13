import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCountry, formatMoney } from "@/lib/billing"
import { CancelButton } from "./cancel-button"
import { User, Building2, Globe, CreditCard } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company, country")
    .eq("id", user.id)
    .single()

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const country = getCountry(profile?.country ?? "US")
  const isCanceled = subscription?.status === "canceled"

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and billing.</p>
      </div>

      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={<User className="h-4 w-4" />} label="Full name" value={profile?.full_name || "—"} />
          <Field icon={<Building2 className="h-4 w-4" />} label="Company" value={profile?.company || "—"} />
          <Field icon={<User className="h-4 w-4" />} label="Email" value={user.email || "—"} />
          <Field icon={<Globe className="h-4 w-4" />} label="Country" value={country.name} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Billing</h2>

        {subscription ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {subscription.plan} plan
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCanceled
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(Number(subscription.amount), country)} / {subscription.billing_cycle} · via{" "}
                    {subscription.payment_method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {isCanceled ? "Access until" : "Renews"}
                </p>
                <p className="text-sm font-medium text-foreground">{periodEnd}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {isCanceled
                  ? "Your subscription is canceled. You can resubscribe from the pricing page."
                  : "You can cancel anytime. You'll keep access until the end of the period."}
              </p>
              <CancelButton disabled={isCanceled} />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No active subscription found.</p>
        )}
      </section>
    </div>
  )
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
