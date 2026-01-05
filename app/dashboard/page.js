"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { Package, User, MapPin, CreditCard, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function UserDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard")
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, loading, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        const userOrders = data.orders || []
        setOrders(userOrders.slice(0, 5)) // Show latest 5 orders

        // Calculate stats
        const totalOrders = userOrders.length
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)
        const pendingOrders = userOrders.filter((order) => order.status === "pending").length

        setStats({ totalOrders, totalSpent, pendingOrders })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "out_for_delivery":
        return "bg-cyan-100 text-cyan-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "on_hold":
        return "bg-orange-100 text-orange-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "returned":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-200 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "payment_failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your orders and account information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="pb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/60 to-emerald-50/80 border-b border-emerald-100/50 px-6 py-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="pb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-blue-50/80 border-b border-blue-100/50 px-6 py-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800">Total Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</div>
            </CardContent>
          </Card>

          <Card className="pb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50/80 via-rose-50/60 to-red-50/80 border-b border-red-100/50 px-6 py-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800">Pending Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-red-700" />
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="pb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-100/50 px-6 py-4">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-800">Recent Orders</CardTitle>
                  <Button variant="outline" asChild className="border-gray-200 hover:bg-white/50">
                    <Link href="/dashboard/orders">View All</Link>
                  </Button>
                </div>
              </div>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                        <div className="bg-gray-200 w-12 h-12 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Package className="h-6 w-6 text-[#b88a44]" />
                          </div>
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{order.items.length} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.total)}</p>
                          <Badge className={`${getStatusColor(order.status)} border-0`}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Button asChild>
                      <Link href="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="pb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-100/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
              </div>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/profile">
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Addresses
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Order History
                  </Link>
                </Button>
                <Button asChild className="w-full bg-[#b88a44] hover:bg-orange-700">
                  <Link href="/shop">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="pb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-100/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Account Information</CardTitle>
              </div>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
