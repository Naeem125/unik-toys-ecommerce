"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product)
  }

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0]
  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.slug}`}>
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={primaryImage?.url || "/placeholder.svg?height=300&width=300&query=toy"}
              alt={primaryImage?.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.isFeatured && <Badge className="absolute top-2 left-2 bg-[#b88a44]">Featured</Badge>}
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
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#b88a44] transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.shortDescription}</p>

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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-[#b88a44]">${product.price}</span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">${product.comparePrice}</span>
              )}
            </div>

            {/* Age Range */}
            {product.ageRange && (
              <div className="text-xs text-muted-foreground mb-2">
                Ages {product.ageRange.min}-{product.ageRange.max}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-[#b88a44] hover:bg-[#c68d37]"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
