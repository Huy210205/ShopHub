import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiGitBranch, FiFlag, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCompare } from '../context/CompareContext'
import { shareProduct, mockAction } from '../utils/productActions'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [editingReview, setEditingReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isCompared, toggleCompare } = useCompare()

  const loadReviews = () => api.get(`/products/${id}/reviews?size=20`).then(({ data }) => setReviews(data.data.content))

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data.data))
    loadReviews()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return }
    try {
      await addToCart(product.id, quantity)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleBuyNow = async () => {
    if (!user) { toast.error('Please login first'); return }
    try {
      await addToCart(product.id, quantity)
      navigate('/checkout')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to review'); return }
    try {
      if (editingReview) {
        await api.put(`/products/${id}/reviews/${editingReview}`, reviewForm)
        toast.success('Review updated!')
      } else {
        await api.post(`/products/${id}/reviews`, reviewForm)
        toast.success('Review submitted!')
      }
      loadReviews()
      const prod = await api.get(`/products/${id}`)
      setProduct(prod.data.data)
      setReviewForm({ rating: 5, comment: '' })
      setEditingReview(null)
      setShowReviewForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`)
      toast.success('Review deleted')
      loadReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const startEditReview = (r) => {
    setEditingReview(r.id)
    setReviewForm({ rating: r.rating, comment: r.comment })
    setShowReviewForm(true)
  }

  if (!product) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card overflow-hidden">
          <img src={product.imageUrl || 'https://via.placeholder.com/500'} alt={product.name} className="w-full aspect-square object-cover" />
        </div>
        <div className="space-y-4">
          <p className="text-primary-600 font-medium">{product.categoryName}</p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={i < Math.round(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>
          <p className="text-3xl font-bold text-primary-600">₹{product.price}</p>
          <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
          <p className="text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          <div className="flex items-center gap-2 border rounded-lg w-fit dark:border-gray-600">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">−</button>
            <span className="px-4">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2">+</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleAddToCart} disabled={product.stock <= 0} className="btn-primary flex items-center justify-center gap-2">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn-secondary">Buy Now</button>
            <button onClick={() => toggleWishlist(product)} className="btn-outline flex items-center justify-center gap-1">
              <FiHeart className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''} /> Add to Wishlist
            </button>
            <button onClick={() => toggleCompare(product)} className="btn-outline flex items-center justify-center gap-1">
              <FiGitBranch /> Compare
            </button>
            <button onClick={() => shareProduct(product)} className="btn-outline flex items-center justify-center gap-1">
              <FiShare2 /> Share
            </button>
            <button onClick={() => mockAction('View Seller')} className="btn-outline flex items-center justify-center gap-1">
              <FiUser /> View Seller
            </button>
            <button onClick={() => mockAction('Report Product')} className="btn-danger col-span-2 flex items-center justify-center gap-1 text-sm py-2">
              <FiFlag /> Report Product
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          {user && (
            <button onClick={() => { setShowReviewForm(!showReviewForm); setEditingReview(null); setReviewForm({ rating: 5, comment: '' }) }} className="btn-primary">
              Write Review
            </button>
          )}
        </div>

        {showReviewForm && user && (
          <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: +e.target.value })} className="input-field w-auto">
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
            </select>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Write your review..." className="input-field" rows={3} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editingReview ? 'Edit Review' : 'Submit Review'}</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="border-b dark:border-gray-700 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.userName}</span>
                  <div className="flex">{[...Array(r.rating)].map((_, i) => <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={14} />)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => mockAction('Like Review')} className="btn-sm btn-outline">Like Review</button>
                  <button onClick={() => mockAction('Report Review')} className="btn-sm btn-outline">Report Review</button>
                  {user?.id === r.userId && (
                    <>
                      <button onClick={() => startEditReview(r)} className="btn-sm btn-outline">Edit Review</button>
                      <button onClick={() => deleteReview(r.id)} className="btn-sm text-red-500 border border-red-300 px-2 py-1 rounded">Delete Review</button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
