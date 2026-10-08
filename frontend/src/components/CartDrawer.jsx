import { Link } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart } = useCart()
  const { user } = useAuth()

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!user ? (
            <p className="text-center text-gray-500 py-8">Please login to view your cart</p>
          ) : !cart?.items?.length ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex gap-3 card p-3">
                <img src={item.imageUrl || '/placeholder.png'} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{item.productName}</h3>
                  <p className="text-primary-600 font-semibold">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                      <FiMinus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                      <FiPlus size={14} />
                    </button>
                    <button onClick={() => removeFromCart(item.productId)} className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{cart.total?.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="btn-primary block text-center w-full">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
