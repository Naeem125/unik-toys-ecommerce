import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request) {
    const response = NextResponse.next()

    // Wire cookies so Supabase can refresh sessions and persist updated cookies.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }))
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Touch the auth layer; this triggers refresh when needed.
    await supabase.auth.getUser()

    return response
}

export const config = {
    matcher: [
        // Run on all routes except Next.js internals/static assets
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
    ],
}


