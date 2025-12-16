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

// ...

<p className="text-sm text-gray-600">
  {formatPrice(item.price)} × {item.quantity}
</p>
                      </div >
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>

// ...

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent >
            </Card >

  {/* Shipping Address */ }
  < Card >
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
            </Card >

  {/* Payment Info */ }
  < Card >
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
            </Card >

  {/* Actions */ }
  < div className = "space-y-3" >
  {
    order.status === "delivered" && (
      <Button className="w-full bg-[#b88a44] hover:bg-orange-700">Reorder Items</Button>
    )
  }
    < Button variant = "outline" className = "w-full bg-transparent" asChild >
      <Link href="/contact">Need Help?</Link>
              </Button >
            </div >
          </div >
        </div >
      </div >

  <Footer />
    </div >
  )
}
