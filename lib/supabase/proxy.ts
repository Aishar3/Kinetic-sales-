import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase env vars")
      return supabaseResponse
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Protect the dashboard — must be logged in.
    if (path.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    // Signed-in users shouldn't see auth pages.
    if ((path === "/auth/login" || path === "/auth/sign-up") && user) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Proxy middleware error:", error)
    // Let request pass through on error instead of crashing
  }

  return supabaseResponse
}
