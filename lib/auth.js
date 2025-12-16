import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getAccessTokenFromRequest(request) {
  try {
    // Next 13 route handlers: request has cookies(). Otherwise fallback to next/headers
    const cookieStore = cookies()
    const token = cookieStore.get("supabase-access-token")?.value
    return token || null
  } catch (_) {
    return null
  }
}

export async function getUserFromRequest(request) {
  const accessToken = getAccessTokenFromRequest(request)
  if (!accessToken) return null

  const adminClient = createClient(supabaseUrl, serviceKey)
  const { data, error } = await adminClient.auth.getUser(accessToken)
  if (error) return null
  return data?.user || null
}

export function requireAdmin(handler) {
  return async function wrapped(request, context) {
    const user = await getUserFromRequest(request)
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
    const user = await getUserFromRequest(request)
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }
    return handler(request, { ...context, user })
  }
}

export async function getCurrentUser(request) {
  return await getUserFromRequest(request)
}


