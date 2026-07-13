"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, Check, CreditCard, Loader2, Lock, Smartphone, ShieldCheck } from "lucide-react"
import { createSubscription } from "@/app/actions/subscription"
import { methodsForCountry } from "@/lib/billing"
import { Logo } from "@/components/site/logo"

type Props = {
  planName: string
  planId: string
  cycle: "monthly" | "yearly"
  countryCode: string
  countryName: string
  currency: string
  symbol: string
  amount: number
  features: string[]
}

export function CheckoutForm(props: Props) {
  const router = useRouter()
  const methods = useMemo(() => methodsForCountry(props.countryCode), [props.countryCode])
  const [method, setMethod] = useState(methods[0]?.id ?? "card")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // field state
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" })
  const [upiId, setUpiId] = useState("")
  const [phone, setPhone] = useState("")

  const priceLabel = `${props.symbol}${props.amount.toLocaleString()}`
  const activeMethod = methods.find((m) => m.id === method)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setProcessing(true)

    // Simulate a realistic payment gateway round-trip (demo only, no real charge)
    await new Promise((r) => setTimeout(r, 1800))

    const res = await createSubscription({
      plan: props.planId,
      cycle: props.cycle,
      currency: props.currency,
      amount: props.amount,
      paymentMethod: method,
      country: props.countryCode,
    })

    if (res?.error) {
      setError(res.error)
      setProcessing(false)
      return
    }

    router.push("/dashboard?welcome=1")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Kinetic home">
            <Logo />
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-4" />
            Secure checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/#pricing"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to pricing
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Payment form */}
          <form onSubmit={handlePay} className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h1 className="text-xl font-bold tracking-tight">Payment method</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Paying in {props.currency} · {props.countryName}
              </p>

              {/* Method selector */}
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {methods.map((m) => {
                  const selected = method === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:border-muted-foreground/40"
                      }`}
                    >
                      <span
                        className={`grid size-9 place-items-center rounded-lg ${
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.kind === "card" ? <CreditCard className="size-4" /> : <Smartphone className="size-4" />}
                      </span>
                      <span className="text-sm font-medium">{m.label}</span>
                      {selected && <Check className="ml-auto size-4 text-primary" />}
                    </button>
                  )
                })}
              </div>

              {/* Conditional fields */}
              <div className="mt-6 space-y-4">
                {activeMethod?.kind === "card" && (
                  <>
                    <div>
                      <label htmlFor="cardName" className="mb-1.5 block text-sm font-medium">
                        Name on card
                      </label>
                      <input
                        id="cardName"
                        required
                        value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                        placeholder="Maya Shah"
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="cardNumber" className="mb-1.5 block text-sm font-medium">
                        Card number
                      </label>
                      <input
                        id="cardNumber"
                        required
                        inputMode="numeric"
                        maxLength={19}
                        value={card.number}
                        onChange={(e) =>
                          setCard({
                            ...card,
                            number: e.target.value
                              .replace(/\D/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          })
                        }
                        placeholder="4242 4242 4242 4242"
                        className="field-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="mb-1.5 block text-sm font-medium">
                          Expiry
                        </label>
                        <input
                          id="expiry"
                          required
                          maxLength={5}
                          value={card.expiry}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").replace(/(.{2})/, "$1/").slice(0, 5)
                            setCard({ ...card, expiry: v })
                          }}
                          placeholder="MM/YY"
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvc" className="mb-1.5 block text-sm font-medium">
                          CVC
                        </label>
                        <input
                          id="cvc"
                          required
                          inputMode="numeric"
                          maxLength={4}
                          value={card.cvc}
                          onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })}
                          placeholder="123"
                          className="field-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeMethod?.kind === "upi" && (
                  <div>
                    <label htmlFor="upi" className="mb-1.5 block text-sm font-medium">
                      UPI ID
                    </label>
                    <input
                      id="upi"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okhdfcbank"
                      className="field-input"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      You&apos;ll get a collect request in your UPI app to approve the payment.
                    </p>
                  </div>
                )}

                {activeMethod?.kind === "wallet" && (
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                      Mobile number linked to {activeMethod.label}
                    </label>
                    <input
                      id="phone"
                      required
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="field-input"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      We&apos;ll send a payment request to your {activeMethod.label} app.
                    </p>
                  </div>
                )}

                {activeMethod?.kind === "netbanking" && (
                  <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                    You&apos;ll be redirected to your bank&apos;s secure page to complete the payment.
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={processing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing payment…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    Pay {priceLabel}
                  </>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-accent" />
                Demo checkout — no real payment is processed.
              </p>
            </div>
          </form>

          {/* Order summary */}
          <aside className="order-1 lg:order-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Order summary
              </h2>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-semibold">Kinetic {props.planName}</div>
                  <div className="text-sm text-muted-foreground">
                    Billed {props.cycle === "yearly" ? "annually" : "monthly"}
                  </div>
                </div>
                <div className="text-lg font-bold">{priceLabel}</div>
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <ul className="space-y-2.5">
                  {props.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <span className="text-sm font-medium">Total due today</span>
                <span className="text-xl font-bold">{priceLabel}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                14-day free trial included. Cancel anytime before it ends and you won&apos;t be charged.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
