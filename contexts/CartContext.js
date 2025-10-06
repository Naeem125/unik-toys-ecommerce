"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  getCartFromStorage,
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
    setCart(getCartFromStorage())
    setLoading(false)
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

  const cartTotal = getCartTotal(cart)
  const cartItemCount = getCartItemCount(cart)

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
