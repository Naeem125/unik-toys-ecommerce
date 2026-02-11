"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import { Truck, XCircle, CheckCircle, Package, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const CANCELLABLE_STATUSES = ['pending', 'confirmed']

export default function OrderDetailsPage({ params }) {
  const { user, loading } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()
  const { orderId } = params || {}

  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [reordering, setReordering] = useState(false)

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
      setHistory(data.history || [])
    } catch (err) {
      console.error("Error fetching order:", err)
      setError(err.message || "Failed to fetch order")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    try {
      setCancelling(true)
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Order cancelled successfully")
        setShowCancelDialog(false)
        setCancelReason("")
        fetchOrder() // Refresh order data
      } else {
        toast.error(data.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = async () => {
    if (!order?.items || order.items.length === 0) {
      toast.error("No items to reorder")
      return
    }

    try {
      setReordering(true)
      let addedCount = 0
      let failedCount = 0

      // Add each item from the order to the cart
      for (const item of order.items) {
        try {
          // Construct product object from order item
          // Order items have: id, name, price, quantity, image
          const product = {
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.image ? [{ url: item.image }] : [],
            stock: item.stock || 999, // Default stock if not available
          }

          // Add to cart with the original quantity
          addToCart(product, item.quantity)
          addedCount++
        } catch (error) {
          console.error(`Error adding item ${item.name} to cart:`, error)
          failedCount++
        }
      }

      if (addedCount > 0) {
        toast.success(
          `${addedCount} item${addedCount > 1 ? 's' : ''} added to cart${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
        )
        // Redirect to cart page after a short delay
        setTimeout(() => {
          router.push("/cart")
        }, 1000)
      } else {
        toast.error("Failed to add items to cart")
      }
    } catch (error) {
      console.error("Error reordering:", error)
      toast.error("Failed to reorder items")
    } finally {
      setReordering(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "out_for_delivery":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "returned":
        return "bg-red-100 text-red-800 border-red-200"
      case "refunded":
        return "bg-gray-200 text-gray-800 border-gray-300"
      case "cancelled":
        return "bg-red-200 text-red-900 border-red-300"
      case "payment_failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "out_for_delivery":
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />
      case "processing":
      case "confirmed":
        return <Package className="h-5 w-5 text-purple-600" />
      case "cancelled":
      case "payment_failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "returned":
      case "refunded":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "on_hold":
        return <Package className="h-5 w-5 text-orange-600" />
      default:
        return <Package className="h-5 w-5 text-yellow-600" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const canCancel = order && CANCELLABLE_STATUSES.includes(order.status)

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
                  {order.tracking_number && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#b88a44]" />
                      <span className="font-mono font-semibold">{order.tracking_number}</span>
                    </div>
                  )}
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
                <Separator className="my-1" />
                <p className="text-lg font-bold text-gray-900 flex justify-between gap-8">
                  <span>Total</span>
                  <span className="text-[#b88a44]">{formatPrice(order.total || 0)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          {history.length > 0 && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Order Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === history.length - 1
                            ? 'bg-[#b88a44] text-white'
                            : 'bg-gray-200 text-gray-600'
                          }`}>
                          {getStatusIcon(entry.status)}
                        </div>
                        {index < history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-[40px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {entry.changed_by_type === 'superadmin'
                              ? 'Updated by superadmin'
                              : entry.changed_by_type === 'admin'
                                ? 'Updated by admin'
                                : entry.changed_by_type === 'user' && entry.status === 'cancelled'
                                  ? 'Cancelled by you'
                                  : entry.changed_by_type === 'user'
                                    ? 'Updated by you'
                                    : 'Updated'}
                          </span>
                        </div>
                        {entry.tracking_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1 bg-gray-50 p-2 rounded">
                            <Truck className="h-4 w-4 text-[#b88a44]" />
                            <span className="font-mono font-semibold">{entry.tracking_number}</span>
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mb-1">{entry.notes}</p>
                        )}
                        <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                  {canCancel && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Button
                      className="w-full bg-[#b88a44] hover:bg-orange-700"
                      onClick={handleReorder}
                      disabled={reordering}
                    >
                      {reordering ? "Adding to Cart..." : "Reorder Items"}
                    </Button>
                  )}
                  {(order.status === "cancelled" || order.status === "delivered") && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-900">Need a refund?</p>
                          <p className="text-amber-700 mt-1">
                            Please contact our support team for assistance with refunds.
                          </p>
                          <Button variant="link" className="p-0 h-auto text-amber-700 underline mt-1" asChild>
                            <Link href="/contact">Contact Support</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
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

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation</Label>
              <Textarea
                id="reason"
                placeholder="Please tell us why you're cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-700">
                  If you need a refund, please contact our support team after cancellation.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCancelDialog(false)
              setCancelReason("")
            }}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
