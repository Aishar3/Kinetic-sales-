import { Suspense } from "react"
import SignUpFormClient from "./signup-client"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignUpFormClient />
    </Suspense>
  )
}
