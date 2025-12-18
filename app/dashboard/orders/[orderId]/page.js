"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { formatPrice } from "@/lib/utils"

export default function OrderDetailsPage({ params }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { orderId } = params || {}

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard/orders")
      return
    }

    if (user && orderId) {
      fetchOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to fetch order")
      }

      const data = await response.json()
      setOrder(data.order || null)
    } catch (err) {
      console.error("Error fetching order:", err)
      setError(err.message || "Failed to fetch order")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 w-full">
        <Header />
        <div className="flex-1 container mx-auto text-center flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 w-full">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Order not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{error}</p>
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-[#b88a44] hover:bg-orange-700">
                  <Link href="/dashboard/orders">Back to Orders</Link>
                </Button>
                <Button variant="outline" className="flex-1" onClick={fetchOrder}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">
                Order #{order.order_number} • Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">Back to Orders</Link>
            </Button>
          </div>

          {/* Status & Summary */}
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Order Status</span>
                  <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Order ID: {order.id}</p>
                  {order.tracking_number && <p>Tracking Number: {order.tracking_number}</p>}
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 space-y-2">
                <p className="text-sm text-gray-600 flex justify-between gap-8">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal || 0)}</span>
                </p>
                <p className="text-sm text-gray-600 flex justify-between gap-8">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost || 0)}
                  </span>
                </p>
                <p className="text-sm text-gray-600 flex justify-between gap-8">
                  <span>Tax</span>
                  <span className="font-medium">{formatPrice(order.tax || 0)}</span>
                </p>
                <Separator className="my-1" />
                <p className="text-lg font-bold text-gray-900 flex justify-between gap-8">
                  <span>Total</span>
                  <span className="text-[#b88a44]">{formatPrice(order.total || 0)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Items in this order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={item.image || "/placeholder.svg?height=80&width=80&query=toy"}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice((item.price || 0) * (item.quantity || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Shipping, Payment, Actions */}
            <div className="space-y-6">
              {/* Shipping Address */}
              {order.shipping_address && (
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state}{" "}
                        {order.shipping_address.zipCode}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                      {order.shipping_address.email && <p>Email: {order.shipping_address.email}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Info */}
              {order.payment_info && (
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize">{order.payment_info.method || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Payment Status:</span>
                        <Badge
                          variant={order.payment_info.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {order.payment_info.status || "pending"}
                        </Badge>
                      </div>
                      {order.payment_info.transactionId && (
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="text-xs font-mono">
                            {order.payment_info.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card className="border-none shadow-md">
                <CardContent className="space-y-3 pt-6">
                  {order.status === "delivered" && (
                    <Button className="w-full bg-[#b88a44] hover:bg-orange-700">
                      Reorder Items
                    </Button>
                  )}
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/contact">Need Help?</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
