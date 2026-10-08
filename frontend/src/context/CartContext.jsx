import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get('/cart')
      setCart(data.data)
    } catch (_) {
      setCart(null)
    }
  }, [user])

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity })
    setCart(data.data)
    setDrawerOpen(true)
    return data.data
  }

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/items/${productId}?quantity=${quantity}`)
    setCart(data.data)
  }

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/items/${productId}`)
    setCart(data.data)
  }

  useEffect(() => {
    if (user) fetchCart()
    else setCart(null)
  }, [user, fetchCart])

  return (
    <CartContext.Provider value={{
      cart, fetchCart, addToCart, updateQuantity, removeFromCart,
      drawerOpen, setDrawerOpen, itemCount: cart?.itemCount || 0
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
