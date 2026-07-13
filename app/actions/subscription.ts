"use server"

import { createClient } from "@/lib/supabase/server"

export type CreateSubscriptionInput = {
  plan: string
  cycle: "monthly" | "yearly"
  currency: string
  amount: number
  paymentMethod: string
  country: string
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to complete checkout." }
  }

  // Mark any existing active subscription as replaced
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", user.id)
    .eq("status", "active")

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan: input.plan,
    status: "active",
    billing_cycle: input.cycle,
    currency: input.currency,
    amount: input.amount,
    payment_method: input.paymentMethod,
    country: input.country,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function cancelSubscription() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated." }
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", user.id)
    .eq("status", "active")

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
