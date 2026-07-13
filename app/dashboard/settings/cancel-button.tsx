"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cancelSubscription } from "@/app/actions/subscription"

export function CancelButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSubscription()
      if (!result?.error) {
        router.refresh()
      }
      setConfirming(false)
    })
  }

  if (disabled) {
    return (
      <button
        disabled
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground"
      >
        Subscription canceled
      </button>
    )
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-destructive hover:text-destructive"
      >
        Cancel subscription
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Canceling..." : "Confirm cancel"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Keep plan
      </button>
    </div>
  )
}
