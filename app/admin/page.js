"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const productsRes = await fetch("/api/products")
      const productsData = await productsRes.json()
      const totalProducts = productsData.products?.length || 0

      // Fetch orders
      const ordersRes = await fetch("/api/admin/orders")
      const ordersData = await ordersRes.json()
      const orders = ordersData.orders || []

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const pendingOrders = orders.filter(o => o.status === "pending").length
      const completedOrders = orders.filter(o => o.status === "delivered").length
      const recentOrders = orders.slice(0, 5)

      // Fetch users count
      const usersRes = await fetch("/api/admin/users")
      const usersData = await usersRes.json()
      const totalUsers = usersData.users?.length || 0

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        pendingOrders,
        completedOrders,
        recentOrders
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="py-2 bg-gradient-to-br from-orange-50 to-white border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                From {stats.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="py-2 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="py-2 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Products</CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalProducts}</div>
              <p className="text-xs text-gray-600 mt-2">Active listings</p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="py-2 bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
              <p className="text-xs text-gray-600 mt-2">Registered accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="py-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-sm text-gray-600 mt-2">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.completedOrders}</div>
              <p className="text-sm text-gray-600 mt-2">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {stats.totalOrders > 0
                  ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600 mt-2">Order success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="py-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{order.order_number}</td>
                        <td className="py-3 px-4">{order.user_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#b88a44]">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="py-2 bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/admin/products"
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#b88a44] hover:shadow-md transition-all"
              >
                <Package className="h-8 w-8 text-[#b88a44] mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Products</span>
              </a>
              <a
                href="/admin/orders"
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#b88a44] hover:shadow-md transition-all"
              >
                <ShoppingCart className="h-8 w-8 text-[#b88a44] mb-2" />
                <span className="text-sm font-medium text-gray-700">View Orders</span>
              </a>
              <a
                href="/admin/users"
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#b88a44] hover:shadow-md transition-all"
              >
                <Users className="h-8 w-8 text-[#b88a44] mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </a>
              <a
                href="/admin/settings"
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[#b88a44] hover:shadow-md transition-all"
              >
                <DollarSign className="h-8 w-8 text-[#b88a44] mb-2" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}