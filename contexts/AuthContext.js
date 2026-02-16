"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Global 401 -> redirect to login (covers cases where the session is expired
    // but Supabase hasn't emitted an auth event yet)
    let originalFetch = null
    if (typeof window !== "undefined" && typeof window.fetch === "function") {
      originalFetch = window.fetch.bind(window)
      window.fetch = async (...args) => {
        const res = await originalFetch(...args)

        try {
          const url = typeof args[0] === "string" ? args[0] : args[0]?.url
          const isApiCall = typeof url === "string" && url.startsWith("/api/")
          const isAuthApi =
            typeof url === "string" &&
            (url.startsWith("/api/auth/login") || url.startsWith("/api/auth/register"))

          if (isApiCall && !isAuthApi && res?.status === 401) {
            const path = window.location.pathname
            if (path !== "/login") {
              const currentPath = window.location.pathname + window.location.search
              const redirect = encodeURIComponent(currentPath)
              router.push(`/login?redirect=${redirect}`)
            }
          }
        } catch (_) {
          // ignore
        }

        return res
      }
    }

    // Check for existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          role: session.user.user_metadata?.role || 'user'
        })
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          role: session.user.user_metadata?.role || 'user'
        })
      } else {
        // Session ended (signed out or refresh failed)
        setUser(null)

        // For real session expiry or explicit sign-out, redirect to login
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESH_FAILED") {
          // Preserve current path so we can redirect back after login
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname + window.location.search
            const redirect = encodeURIComponent(currentPath)
            router.push(`/login?redirect=${redirect}`)
          }
        }
      }
      setLoading(false)
    })


    return () => {
      subscription.unsubscribe()
      if (originalFetch) {
        window.fetch = originalFetch
      }
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Set the session in Supabase client storage so getSession() works after page refresh
        if (data.session?.access_token && data.session?.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
        }

        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
