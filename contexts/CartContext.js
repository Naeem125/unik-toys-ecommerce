"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import {
  getCartFromStorage,
  saveCartToStorage,
  addToCart as addToCartUtil,
  removeFromCart as removeFromCartUtil,
  updateCartQuantity as updateCartQuantityUtil,
  clearCart as clearCartUtil,
  getCartTotal,
  getCartItemCount,
} from "@/lib/cart"

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialCart = getCartFromStorage()
    setCart(initialCart)
    setLoading(false)

    // Sync cart items with latest product info (name/price/stock/image)
    const syncCart = async () => {
      try {
        const ids = [...new Set((initialCart || []).map((i) => i.id).filter(Boolean))]
        if (!ids.length) return

        const res = await fetch("/api/products/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) return
        const data = await res.json()
        const products = Array.isArray(data?.products) ? data.products : []
        const byId = new Map(products.map((p) => [p.id, p]))

        const updatedCart = (initialCart || []).map((item) => {
          const p = byId.get(item.id)
          if (!p) return item
          return {
            ...item,
            name: p.name ?? item.name,
            price: p.price ?? item.price,
            stock: p.stock ?? item.stock,
            image: p.image ?? item.image,
          }
        })

        saveCartToStorage(updatedCart)
        setCart(updatedCart)
      } catch {
        // best-effort
      }
    }

    syncCart()
  }, [])

  const addToCart = (product, quantity = 1) => {
    const updatedCart = addToCartUtil(product, quantity)
    setCart(updatedCart)
    return updatedCart
  }

  const removeFromCart = (productId) => {
    const updatedCart = removeFromCartUtil(productId)
    setCart(updatedCart)
    return updatedCart
  }

  const updateQuantity = (productId, quantity) => {
    const updatedCart = updateCartQuantityUtil(productId, quantity)
    setCart(updatedCart)
    return updatedCart
  }

  const clearCart = () => {
    const updatedCart = clearCartUtil()
    setCart(updatedCart)
    return updatedCart
  }

  // Memoize cart calculations to ensure they update when cart changes
  const cartTotal = useMemo(() => getCartTotal(cart), [cart])
  const cartItemCount = useMemo(() => getCartItemCount(cart), [cart])

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
