import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const moveToCart = async (product) => {
    if (!user) { toast.error('Please login'); return }
    try {
      await addToCart(product.id, 1)
      removeFromWishlist(product.id)
      toast.success('Moved to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const buyNow = async (product) => {
    if (!user) { toast.error('Please login'); return }
    try {
      await addToCart(product.id, 1)
      navigate('/checkout')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  if (!wishlist.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Wishlist ❤️</h1>
        <p className="text-gray-500 mb-6">Your wishlist is empty</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Wishlist ❤️ ({wishlist.length})</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((p) => (
          <div key={p.id} className="card p-4 flex gap-4">
            <img src={p.imageUrl} alt={p.name} className="w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <Link to={`/products/${p.id}`} className="font-medium hover:text-primary-600">{p.name}</Link>
              <p className="text-primary-600 font-bold mt-1">₹{p.price}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => moveToCart(p)} className="btn-sm bg-primary-600 text-white">Move to Cart</button>
                <button onClick={() => buyNow(p)} className="btn-sm btn-secondary">Buy Now</button>
                <button onClick={() => removeFromWishlist(p.id)} className="btn-sm text-red-500 border border-red-200 px-2 rounded">Remove from Wishlist</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
