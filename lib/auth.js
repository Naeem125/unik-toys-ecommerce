import { cookies } from "next/headers"
import { createServerClient } from "@supabase/auth-helpers-nextjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to create a Supabase server client bound to Next.js cookies.
// We only need to READ cookies here, so setAll is a no-op.
function getServerClient() {
  const cookieStore = cookies()
  // The 3-argument createServerClient signature is marked deprecated in the
  // type definitions for older cookie APIs, but we're using the new getAll/setAll
  // cookie methods here, which is the recommended pattern and safe to use.
  // Suppress the misleading deprecation warning from TypeScript.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - using supported createServerClient overload with getAll/setAll cookies
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }))
      },
      // We don't modify cookies in route handlers that use this helper.
      // If you later need to sign-in/out on the server, wire this to NextResponse.
      setAll() {
        // no-op
      },
    },
  })
}

export async function getCurrentUser() {
  const supabase = getServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data?.user || null
}

export function requireAdmin(handler) {
  return async function wrapped(request, context) {
    const user = await getCurrentUser()
    const userRole = user?.user_metadata?.role

    // Allow both admin and superadmin roles
    if (!user || (userRole !== "admin" && userRole !== "superadmin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    }
    return handler(request, { ...context, user })
  }
}

export function requireAuth(handler) {
  return async function wrapped(request, context) {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }
    return handler(request, { ...context, user })
  }
}
