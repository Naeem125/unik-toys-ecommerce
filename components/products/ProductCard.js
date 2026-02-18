"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.stock === 0 || adding) return

    setAdding(true)
    addToCart(product)
    toast.success(`Added "${product.name}" to your cart`)

    setTimeout(() => {
      setAdding(false)
    }, 1200)
  }

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0]
  // Supabase uses snake_case (compare_price, is_featured)
  const comparePrice = product.compare_price ?? product.comparePrice
  const isFeatured = product.is_featured ?? product.isFeatured
  const discountPercentage = comparePrice
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0

  const productHref = product?.id
    ? `/products/${product.slug}?id=${product.id}`
    : `/products/${product.slug}`

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <Link href={productHref} className="flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
            <Image
              src={primaryImage?.url || "/placeholder.svg?height=100&width=100&query=toy"}
              alt={primaryImage?.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isFeatured && <Badge className="absolute top-2 left-2 bg-[#b88a44]">Featured</Badge>}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                -{discountPercentage}%
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>
          <div className="px-4 pb-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#b88a44] transition-colors">
              {product.name}
            </h3>
            {/* <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.shortDescription}</p> */}

            {/* Colors */}
            {/* {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-700"
                  >
                    {color}
                  </span>
                ))}
              </div>
            )} */}

            {/* Rating */}
            {product.rating?.count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.rating.count})</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto flex items-center gap-2">
              <span className="text-lg font-bold text-[#b88a44]">{formatPrice(product.price)}</span>
              {comparePrice && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(comparePrice)}</span>
              )}
            </div>

            {/* Age Range */}
            {/* {product.ageRange && (
              <div className="text-xs text-muted-foreground mb-2">
                Ages {product.ageRange.min}-{product.ageRange.max}
              </div>
            )} */}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className="w-full bg-[#b88a44] hover:bg-[#c68d37]"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : adding ? "Added!" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
