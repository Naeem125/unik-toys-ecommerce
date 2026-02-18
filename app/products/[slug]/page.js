"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/products/ProductCard"
import { useCart } from "@/contexts/CartContext"
import { Star, ShoppingCart, Truck, RotateCcw } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [adding, setAdding] = useState(false)
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 3000,
  })

  useEffect(() => {
    setLoading(true)
    fetchProduct()

    const loadShipping = async () => {
      try {
        const res = await fetch("/api/settings/shipping")
        if (!res.ok) return
        const data = await res.json()
        setShippingConfig({
          freeShippingThreshold: data.freeShippingThreshold ?? 3000,
        })
      } catch (err) {
        console.error("Failed to load shipping settings", err)
      }
    }
    loadShipping()

    // If admin updates product in another tab, refetch when the user returns
    const onFocus = () => {
      setLoading(true)
      fetchProduct()
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setLoading(true)
        fetchProduct()
      }
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [params.slug, searchParams])

  const fetchProduct = async () => {
    try {
      const id = searchParams.get("id")
      const url = id
        ? `/api/products/by-id/${id}?t=${Date.now()}`
        : `/api/products/${params.slug}?t=${Date.now()}`

      const response = await fetch(url, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        setSelectedImage(0)

        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0])
        }

        // Fetch related products - Supabase returns `categories` relation
        if (data.product.categories) {
          const relatedResponse = await fetch(
            `/api/products?category=${data.product.categories.slug}&limit=4&t=${Date.now()}`,
            { cache: "no-store" }
          )
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            setRelatedProducts(
              (relatedData.products || []).filter((p) => (p.id ?? p._id) !== (data.product.id ?? data.product._id))
            )
          }
        }
      } else if (response.status === 404) {
        router.push("/shop")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || product.stock === 0 || adding) return

    setAdding(true)
    const productWithColor = {
      ...product,
      selectedColor,
    }
    addToCart(productWithColor, quantity)
    toast.success(
      `Added "${product.name}"${selectedColor ? ` (${selectedColor})` : ""} to your cart`
    )

    setTimeout(() => {
      setAdding(false)
    }, 1200)
  }

  // Supabase uses snake_case fields; fall back to camelCase for any legacy data
  const comparePrice = product?.compare_price ?? product?.comparePrice
  const isFeatured = product?.is_featured ?? product?.isFeatured

  const discountPercentage = comparePrice
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
          <p className="mt-4">Loading product...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#b88a44]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#b88a44]">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-[#b88a44]">
            {product.categories.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images - Left Section with Background */}
          <div className="bg-gray-50 p-2 rounded-2xl">
            <div className="relative aspect-[4/3] max-h-[360px] mb-4 overflow-hidden rounded-xl bg-white shadow-md">
              <Image
                src={product.images?.[selectedImage]?.url || "/placeholder.svg?height=600&width=600&query=toy"}
                alt={product.images?.[selectedImage]?.alt || product.name}
                fill
                className="object-contain"
              />
              {isFeatured && <Badge className="absolute top-4 left-4 bg-[#b88a44]">Featured</Badge>}
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === index ? "border-[#b88a44] shadow-md scale-105" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Right Section with Background */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating */}
              {product.rating?.count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-[#b88a44]">{formatPrice(product.price)}</span>
                {comparePrice && (
                  <span className="text-xl text-gray-500 line-through">{formatPrice(comparePrice)}</span>
                )}
                {discountPercentage > 0 && <Badge variant="destructive">Save {discountPercentage}%</Badge>}
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-700 mr-2">Choose color:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.colors.map((color) => {
                      const isActive = selectedColor === color
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${isActive
                            ? "bg-[#b88a44] text-white border-[#b88a44]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#b88a44]"
                            }`}
                        >
                          {color}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">In Stock ({product.stock} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="flex-1 bg-[#b88a44] hover:bg-orange-700"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : adding ? "Added!" : "Add to Cart"}
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-[#b88a44]" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">
                    On orders over {formatPrice(shippingConfig.freeShippingThreshold)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-[#b88a44]" />
                <div>
                  <p className="font-medium text-sm">15-Day Returns</p>
                  <p className="text-xs text-gray-600">Easy 15-day returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {product.tags.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specifications - Only show if dimensions or weight exist */}
                {((product.dimensions?.length || product.dimensions?.width || product.dimensions?.height || product.weight)) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                    <div className="space-y-2 text-sm">
                      {product.dimensions?.length && (
                        <div className="border-b border-gray-100 pb-1">
                          <span className="text-gray-600 mr-2">Length:</span>
                          <span className="font-medium">{product.dimensions.length}"</span>
                        </div>
                      )}
                      {product.dimensions?.width && (
                        <div className="border-b border-gray-100 pb-1">
                          <span className="text-gray-600 mr-2">Width:</span>
                          <span className="font-medium">{product.dimensions.width}"</span>
                        </div>
                      )}
                      {product.dimensions?.height && (
                        <div className="border-b border-gray-100 pb-1">
                          <span className="text-gray-600 mr-2">Height:</span>
                          <span className="font-medium">{product.dimensions.height}"</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="border-b border-gray-100 pb-1">
                          <span className="text-gray-600 mr-2">Weight:</span>
                          <span className="font-medium">
                            {product.weight} {product.weight_unit || 'kg'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Button variant="outline" asChild>
                <Link href={`/shop?category=${product.categories.slug}`}>View All {product.categories.name}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id ?? relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
