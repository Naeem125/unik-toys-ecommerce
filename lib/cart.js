export function getCartFromStorage() {
  if (typeof window === "undefined") return []

  try {
    const cart = localStorage.getItem("cart")
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    return []
  }
}

export function saveCartToStorage(cart) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("cart", JSON.stringify(cart))
  } catch (error) {
    console.error("Failed to save cart:", error)
  }
}

export function addToCart(product, quantity = 1) {
  const cart = getCartFromStorage()
  const color = product.selectedColor || null
  const existingItem = cart.find(
    (item) => item.id === product.id && item.color === color
  )

  const primaryImage =
    product.images?.find?.((img) => img?.isPrimary) || product.images?.[0]

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url || "",
      quantity,
      stock: product.stock,
      color,
    })
  }

  saveCartToStorage(cart)
  return cart
}

export function removeFromCart(productId) {
  const cart = getCartFromStorage()
  const updatedCart = cart.filter((item) => item.id !== productId)
  saveCartToStorage(updatedCart)
  return updatedCart
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCartFromStorage()
  const item = cart.find((item) => item.id === productId)

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId)
    }
    item.quantity = quantity
    saveCartToStorage(cart)
  }

  return cart
}

export function clearCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cart")
  }
  return []
}

export function getCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function getCartItemCount(cart) {
  return cart.reduce((count, item) => count + item.quantity, 0)
}
