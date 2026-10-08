import { Link, useNavigate } from 'react-router-dom'
import { FiStar, FiHeart, FiShare2, FiGitBranch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCompare } from '../context/CompareContext'
import { shareProduct } from '../utils/productActions'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isCompared, toggleCompare } = useCompare()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login first'); return }
    try {
      await addToCart(product.id, 1)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleBuyNow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login first'); return }
    try {
      await addToCart(product.id, 1)
      navigate('/checkout')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}
            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow"
            title="Add to Wishlist"
          >
            <FiHeart className={isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} size={16} />
          </button>
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-primary-600 font-medium mb-1">{product.categoryName}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 mb-2 hover:text-primary-600">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
          {product.stock <= 0 && <span className="text-xs text-red-500">Out of Stock</span>}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-1.5">
          <Link to={`/products/${product.id}`} className="btn-sm btn-outline text-center col-span-2">View Details</Link>
          <button onClick={handleAddToCart} disabled={product.stock <= 0} className="btn-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">Add to Cart</button>
          <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn-sm bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900">Buy Now</button>
          <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }} className="btn-sm btn-outline">
            {isInWishlist(product.id) ? '❤️ Saved' : 'Add to Wishlist ❤️'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleCompare(product) }} className={`btn-sm btn-outline flex items-center justify-center gap-1 ${isCompared(product.id) ? 'border-green-500 text-green-600' : ''}`}>
            <FiGitBranch size={12} /> Compare
          </button>
          <button onClick={(e) => { e.stopPropagation(); shareProduct(product) }} className="btn-sm btn-outline col-span-2 flex items-center justify-center gap-1">
            <FiShare2 size={12} /> Share Product
          </button>
        </div>
      </div>
    </div>
  )
}
