import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)
const KEY = 'shophub_wishlist'

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const isInWishlist = (id) => wishlist.some((p) => p.id === id)

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id))
      toast.success('Removed from wishlist')
    } else {
      setWishlist((prev) => [...prev, product])
      toast.success('Added to wishlist ❤️')
    }
  }

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id))
    toast.success('Removed from wishlist')
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, removeFromWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
