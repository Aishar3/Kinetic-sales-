import Link from "next/link"
import { MailCheck } from "lucide-react"
import { Logo } from "@/components/site/logo"

export default function SignUpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link href="/" className="mx-auto mb-8" aria-label="Kinetic home">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
            <MailCheck className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent you a confirmation link. Click it to verify your email, then log in to continue to
            checkout and activate your plan.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  )
}
