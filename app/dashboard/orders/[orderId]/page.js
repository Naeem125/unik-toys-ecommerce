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
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react"

export default function OrderDetails({ params }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard/orders")
      return
    }

    if (user) {
      fetchOrder()
    }
  }, [user, loading, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else if (response.status === 404) {
        router.push("/dashboard/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
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
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: Clock },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle },
      { key: "processing", label: "Processing", icon: Package },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle },
    ]

    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"]
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4">Loading order details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !order) {
    return null
  }

  const statusSteps = getStatusSteps(order.status)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge className={`${getStatusColor(order.status)} border-0`}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order.status !== "cancelled" && (
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              step.completed
                                ? "bg-green-100 text-green-600"
                                : step.active
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                step.completed || step.active ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                          {step.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                      )
                    })}
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                    <p className="text-blue-700">{order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg?height=64&width=64&query=toy"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{order.paymentInfo.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <Badge
                      variant={order.paymentInfo.status === "completed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {order.paymentInfo.status}
                    </Badge>
                  </div>
                  {order.paymentInfo.transactionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="text-xs font-mono">{order.paymentInfo.transactionId.slice(-8)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === "delivered" && (
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Reorder Items</Button>
              )}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/contact">Need Help?</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
