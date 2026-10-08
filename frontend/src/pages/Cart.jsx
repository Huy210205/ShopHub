import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiBookmark } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSavedForLater } from '../context/SavedForLaterContext'

export default function Cart() {
  const { cart, fetchCart, updateQuantity, removeFromCart } = useCart()
  const { savedItems, saveForLater, removeSaved } = useSavedForLater()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => { fetchCart() }, [fetchCart])

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'SAVE10') {
      setDiscount(10)
      toast.success('Coupon applied! 10% off')
    } else if (coupon) {
      toast.error('Invalid coupon code')
    }
  }

  const handleSaveForLater = (item) => {
    saveForLater(item)
    removeFromCart(item.productId)
  }

  const subtotal = cart?.total || 0
  const discountAmt = subtotal * (discount / 100)
  const total = subtotal - discountAmt

  if (!cart?.items?.length && !savedItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart?.items?.map((item) => (
            <div key={item.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <img src={item.imageUrl} alt={item.productName} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-primary-600 font-semibold">₹{item.price}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded" title="Decrease Quantity"><FiMinus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded" title="Increase Quantity"><FiPlus size={14} /></button>
                  <button onClick={() => removeFromCart(item.productId)} className="btn-sm text-red-500 border border-red-200 px-2 flex items-center gap-1"><FiTrash2 size={12} /> Remove Item</button>
                  <button onClick={() => handleSaveForLater(item)} className="btn-sm btn-outline flex items-center gap-1"><FiBookmark size={12} /> Save For Later</button>
                </div>
              </div>
              <p className="font-semibold">₹{item.subtotal?.toFixed(2)}</p>
            </div>
          ))}

          {savedItems.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold mb-3">Saved For Later</h3>
              {savedItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <span className="text-sm">{item.productName}</span>
                  <button onClick={() => removeSaved(item.productId)} className="text-xs text-red-500">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 h-fit space-y-4">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div className="flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code (SAVE10)" className="input-field text-sm flex-1" />
            <button onClick={applyCoupon} className="btn-secondary text-sm whitespace-nowrap">Apply Coupon</button>
          </div>
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discount}%)</span><span>-₹{discountAmt.toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <Link to="/products" className="btn-secondary block text-center w-full">Continue Shopping</Link>
          {cart?.items?.length > 0 && (
            <Link to="/checkout" className="btn-primary block text-center w-full">Proceed to Checkout</Link>
          )}
        </div>
      </div>
    </div>
  )
}
