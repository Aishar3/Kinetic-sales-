"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { COUNTRIES } from "@/lib/billing"
import { AuthShell, Field } from "../login/page"

export default function SignUpPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next")

  const [fullName, setFullName] = useState("")
  const [company, setCompany] = useState("")
  const [country, setCountry] = useState("US")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: fullName, company, country },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(`/auth/sign-up-success${next ? `?next=${encodeURIComponent(next)}` : ""}`)
  }

  return (
    <AuthShell title="Create your account" subtitle="Start your 14-day free trial. No card required.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" htmlFor="fullName">
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maya Shah"
            className="auth-input"
          />
        </Field>
        <Field label="Company" htmlFor="company">
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Northstar Inc."
            className="auth-input"
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="auth-input"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="auth-input"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="auth-input"
          />
        </Field>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
