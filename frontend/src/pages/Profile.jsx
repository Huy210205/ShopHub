import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../context/AddressContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useTheme } from '../context/ThemeContext'
import {
  FiHome, FiUser, FiShoppingBag, FiHeart, FiShoppingCart, FiMapPin,
  FiCreditCard, FiPercent, FiBell, FiSettings, FiLogOut, FiPlus, FiTrash2,
  FiEye, FiDownload, FiCheckCircle, FiCopy, FiSun, FiMoon
} from 'react-icons/fi'

export default function Profile() {
  const { user, logout } = useAuth()
  const { addresses, addAddress, deleteAddress } = useAddresses()
  const { cart, removeFromCart, addToCart, itemCount } = useCart()
  const { wishlist, removeFromWishlist, count: wishlistCount } = useWishlist()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Sidebar controls
  const [tab, setTab] = useState('dashboard')

  // Forms and data states
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [addrForm, setAddrForm] = useState({ label: 'Home', line: '', city: '', pincode: '' })
  const [orders, setOrders] = useState([])

  // Simulated state for payments and rewards
  const [savedCards, setSavedCards] = useState([
    { id: 1, type: 'Visa', last4: '4321', holder: 'Vamsi Ukkusuri', expiry: '12/28' },
    { id: 2, type: 'Mastercard', last4: '8765', holder: 'Vamsi Ukkusuri', expiry: '05/29' }
  ])
  const [upiIds, setUpiIds] = useState(['vamsi@okaxis', 'ukkusuri@okicici'])
  const [rewardPoints, setRewardPoints] = useState(350)
  const [coupons] = useState([
    { code: 'SHOPHUB100', desc: 'Flat ₹100 Off on first purchase', minCart: 1000 },
    { code: 'FREESHIP', desc: 'Free standard shipping on catalog orders', minCart: 500 }
  ])

  // Preferences
  const [notifPreferences, setNotifPreferences] = useState({ email: true, sms: false, push: true })
  const [privacyMode, setPrivacyMode] = useState(false)

  // Address add form
  const [newCard, setNewCard] = useState({ type: 'Visa', last4: '', holder: '', expiry: '' })
  const [newUpi, setNewUpi] = useState('')

  // Load backend profile & orders
  useEffect(() => {
    if (user) {
      api.get('/users/profile').then(({ data }) => setProfile(data.data)).catch(() => {})
      api.get('/orders').then(({ data }) => setOrders(data.data)).catch(() => {})
    }
  }, [user])

  // Profile functions
  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/users/profile', { name: profile.name, phone: profile.phone, address: profile.address })
      setProfile(data.data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      await api.put('/users/change-password', passwords)
      toast.success('Password changed successfully!')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed')
    }
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
      toast.success('Photo uploaded (preview only)')
    }
  }

  const saveAddress = (e) => {
    e.preventDefault()
    addAddress({ ...addrForm, full: `${addrForm.line}, ${addrForm.city} - ${addrForm.pincode}` })
    setAddrForm({ label: 'Home', line: '', city: '', pincode: '' })
    toast.success('Delivery address saved!')
  }

  const handleAddCard = (e) => {
    e.preventDefault()
    if (!newCard.last4 || !newCard.holder) return toast.error('Please fill card details')
    setSavedCards([...savedCards, { ...newCard, id: Date.now() }])
    setNewCard({ type: 'Visa', last4: '', holder: '', expiry: '' })
    toast.success('Payment card saved!')
  }

  const handleAddUpi = (e) => {
    e.preventDefault()
    if (!newUpi) return
    setUpiIds([...upiIds, newUpi])
    setNewUpi('')
    toast.success('UPI ID saved!')
  }

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item.id || item.productId, 1)
      await removeFromWishlist(item.id)
      toast.success('Moved item to shopping cart!')
    } catch (err) {
      toast.error('Failed to move item')
    }
  }

  // Sidebar options matching the requested 10 items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'orders', label: 'My Orders', icon: FiShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
    { id: 'cart', label: 'My Cart', icon: FiShoppingCart },
    { id: 'addresses', label: 'Addresses', icon: FiMapPin },
    { id: 'payments', label: 'Payment Methods', icon: FiCreditCard },
    { id: 'rewards', label: 'Coupons & Rewards', icon: FiPercent },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ]

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row gap-8 antialiased">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-fit shrink-0 space-y-2">
        <div className="flex items-center gap-3 p-2 border-b dark:border-gray-700 pb-4">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm select-none">
            {profile.name?.[0] || 'U'}
          </div>
          <div className="leading-none text-left">
            <h3 className="font-bold text-sm">{profile.name || 'User'}</h3>
            <span className="text-[10px] text-gray-400">Verified shopper</span>
          </div>
        </div>

        <nav className="space-y-1 pt-2">
          {menuItems.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'wishlist' && wishlistCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${active ? 'bg-white text-primary-600' : 'bg-rose-100 text-rose-600'} font-black`}>{wishlistCount}</span>
                )}
                {item.id === 'cart' && itemCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${active ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-600'} font-black`}>{itemCount}</span>
                )}
              </button>
            )
          })}
          
          <button
            onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* RIGHT SIDE PANEL DYNAMICS */}
      <main className="flex-1 space-y-6">
        
        {/* ==================== USER: DASHBOARD OVERVIEW ==================== */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black">Welcome Back, {profile.name || 'User'}!</h2>

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: totalOrders, color: 'border-l-blue-500', textClr: 'text-blue-500' },
                { label: 'Pending Orders', value: pendingOrders, color: 'border-l-amber-500', textClr: 'text-amber-500' },
                { label: 'Wishlist Items', value: wishlistCount, color: 'border-l-rose-500', textClr: 'text-rose-500' },
                { label: 'Reward Points', value: rewardPoints, color: 'border-l-emerald-500', textClr: 'text-emerald-500' }
              ].map((card, index) => (
                <div key={index} className={`card p-5 border-l-4 ${card.color} bg-white dark:bg-gray-800 shadow-sm rounded-xl flex flex-col justify-between`}>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{card.label}</span>
                  <p className={`text-2xl font-extrabold ${card.textClr} mt-2`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Account progress tracker */}
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider">Reward Program Progress</h3>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((rewardPoints / 1000) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">You are <strong>{1000 - rewardPoints} points</strong> away from claiming a free premium coupon!</p>
            </div>

            {/* Recent Orders table */}
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Latest Orders</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-400">No transactions recorded yet.</p>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-primary-600">Order #{o.id}</p>
                        <span className="text-gray-400 text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{o.totalAmount}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== USER: MY PROFILE ==================== */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider border-b dark:border-gray-700 pb-2">My Profile</h3>
              
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-primary-600 font-bold">{profile.name?.[0]}</span>
                    )}
                  </div>
                  <label className="btn-outline cursor-pointer text-xs py-1.5 px-3 rounded-lg border">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                    <input value={profile.email || ''} disabled className="input-field bg-gray-150 dark:bg-gray-750" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
                    <input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                    <input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Default Delivery Address</label>
                    <input value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} className="input-field" />
                  </div>
                </div>

                <button type="submit" className="btn-primary py-2 px-6">Edit Profile</button>
              </form>
            </div>

            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider border-b dark:border-gray-700 pb-2">Change Password</h3>
              <form onSubmit={changePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Current Password</label>
                  <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">New Password</label>
                  <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="input-field" required />
                </div>
                <button type="submit" className="btn-primary py-2 px-6">Change Password</button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== USER: MY ORDERS ==================== */}
        {tab === 'orders' && (
          <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider">Purchase History & Tracking</h3>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400">No completed orders found.</p>
            ) : (
              <div className="space-y-6 divide-y dark:divide-gray-700">
                {orders.map(o => (
                  <div key={o.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold">Order ID: #{o.id}</p>
                        <span className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm">₹{o.totalAmount}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>{o.status}</span>
                      </div>
                    </div>

                    {/* Simple Track Order Progress Bar */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tracking Progress</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold relative">
                        {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st, i) => {
                          const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                          const orderIndex = steps.indexOf(o.status === 'PENDING' ? 'CONFIRMED' : o.status)
                          const active = i <= (orderIndex === -1 ? 0 : orderIndex)
                          return (
                            <span key={st} className={active ? 'text-primary-500' : ''}>
                              {st}
                            </span>
                          )
                        })}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-750 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full" style={{
                          width: o.status === 'DELIVERED' ? '100%' : o.status === 'SHIPPED' ? '75%' : o.status === 'PROCESSING' ? '50%' : '25%'
                        }}></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => toast.success('Invoice download initiated!')} className="btn-outline text-[11px] py-1 px-3 flex items-center gap-1.5">
                        <FiDownload size={12} /> Download Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== USER: WISHLIST ==================== */}
        {tab === 'wishlist' && (
          <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider">My Wishlist</h3>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-400">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map(item => (
                  <div key={item.id} className="p-4 border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 rounded-xl flex gap-3">
                    <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0 border" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs truncate">{item.name}</h4>
                        <p className="font-extrabold text-sm mt-0.5 text-primary-500">₹{item.price}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleMoveToCart(item)} className="text-[10px] font-bold text-primary-600 hover:underline">Move to Cart</button>
                        <button onClick={() => removeFromWishlist(item.id)} className="text-[10px] font-bold text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== USER: MY CART ==================== */}
        {tab === 'cart' && (
          <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider">Shopping Cart Snapshot</h3>
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y dark:divide-gray-700">
                  {cart.map(item => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold">{item.productName}</p>
                        <span className="text-gray-400 block">Quantity: {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:underline"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t dark:border-gray-700 flex gap-2">
                  <Link to="/cart" className="btn-primary flex-1 text-center py-2 text-xs">View Full Cart & Checkout</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== USER: ADDRESSES ==================== */}
        {tab === 'addresses' && (
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Add Delivery Address</h3>
              <form onSubmit={saveAddress} className="space-y-3 max-w-md">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address Tag / Label</label>
                  <input value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="E.g. Home, Office" className="input-field" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Street Address / Landmark</label>
                  <textarea value={addrForm.line} onChange={e => setAddrForm({ ...addrForm, line: e.target.value })} placeholder="Street Address" className="input-field" rows={2} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
                    <input value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="City" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                    <input value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })} placeholder="Pincode" className="input-field" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary py-2 px-6 flex items-center gap-2 text-xs">
                  <FiPlus size={14} /> Add Address
                </button>
              </form>
            </div>

            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Saved Locations</h3>
              {addresses.length === 0 ? (
                <p className="text-xs text-gray-400">No delivery addresses configured.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(a => (
                    <div key={a.id} className="p-4 border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 rounded-xl flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-400 rounded text-[9px] font-bold uppercase">{a.label}</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-2">{a.full}</p>
                      </div>
                      <button onClick={() => deleteAddress(a.id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== USER: PAYMENTS ==================== */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Save Card</h3>
              <form onSubmit={handleAddCard} className="space-y-3 max-w-md">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Card Provider</label>
                    <select value={newCard.type} onChange={e => setNewCard({ ...newCard, type: e.target.value })} className="input-field">
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Rupay">RuPay</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Last 4 Digits *</label>
                    <input maxLength={4} placeholder="XXXX" value={newCard.last4} onChange={e => setNewCard({ ...newCard, last4: e.target.value })} className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cardholder Name *</label>
                    <input placeholder="Name" value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry Date *</label>
                    <input placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} className="input-field" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary py-2 px-6 text-xs flex items-center gap-2">
                  <FiPlus size={14} /> Add Card
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Saved Cards</h3>
                {savedCards.map(c => (
                  <div key={c.id} className="p-4 border dark:border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 font-bold text-6xl uppercase tracking-widest pointer-events-none select-none">{c.type}</div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">{c.type} Card</p>
                      <p className="font-bold text-sm mt-2">•••• •••• •••• {c.last4}</p>
                      <p className="text-[10px] text-gray-300 font-semibold mt-2">{c.holder} ({c.expiry})</p>
                    </div>
                    <button onClick={() => setSavedCards(savedCards.filter(sc => sc.id !== c.id))} className="text-red-400 hover:text-red-600 z-10"><FiTrash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Saved UPI Accounts</h3>
                <form onSubmit={handleAddUpi} className="flex gap-2">
                  <input placeholder="upi@okaxis" value={newUpi} onChange={e => setNewUpi(e.target.value)} className="input-field flex-1" />
                  <button type="submit" className="btn-primary px-4 py-2 text-xs">Add UPI</button>
                </form>
                <div className="space-y-2">
                  {upiIds.map(id => (
                    <div key={id} className="p-3 border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 rounded-xl flex justify-between items-center text-xs font-semibold">
                      <span>{id}</span>
                      <button onClick={() => setUpiIds(upiIds.filter(ui => ui !== id))} className="text-red-500 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== USER: REWARDS & COUPONS ==================== */}
        {tab === 'rewards' && (
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">My Promo Coupons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon, i) => (
                  <div key={i} className="p-4 border-2 border-dashed border-primary-500/30 bg-primary-500/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="font-black text-primary-600 text-sm tracking-wider uppercase block">{coupon.code}</span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">{coupon.desc}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Coupon copied!') }} className="btn-outline py-1 px-3 mt-3 text-[10px] font-bold flex items-center justify-center gap-1.5">
                      <FiCopy size={12} /> Copy Code
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Referral Program</h3>
              <p className="text-xs text-gray-500">Invite your friends to register and shop on ShopHub! You both receive <strong>100 reward points</strong> as a discount credit upon their checkout!</p>
              <div className="flex gap-2">
                <input readOnly value="https://shophub.com/register?ref=vamsi_ukkusuri" className="input-field bg-gray-50 dark:bg-gray-900 text-xs font-mono select-all flex-1" />
                <button onClick={() => { navigator.clipboard.writeText('https://shophub.com/register?ref=vamsi_ukkusuri'); toast.success('Link copied!') }} className="btn-primary px-4 py-2 text-xs">Copy Link</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== USER: NOTIFICATIONS ==================== */}
        {tab === 'notifications' && (
          <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider border-b dark:border-gray-700 pb-2">My Alerts</h3>
            <div className="divide-y dark:divide-gray-700">
              {[
                { id: 1, title: 'Order Dispatched!', msg: 'Your order #1002 has been handed over to courier.', date: 'Today, 14:05' },
                { id: 2, title: 'Promo Reward Added', msg: 'You received 50 reward points on successful review.', date: 'Yesterday, 09:12' }
              ].map(notif => (
                <div key={notif.id} className="py-4 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <p>{notif.title}</p>
                    <span className="text-[10px] text-gray-400 font-semibold">{notif.date}</span>
                  </div>
                  <p className="text-xs text-gray-500">{notif.msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== USER: SETTINGS ==================== */}
        {tab === 'settings' && (
          <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider border-b dark:border-gray-700 pb-2">Account Preferences</h3>

            <div className="space-y-4 divide-y dark:divide-gray-700">
              {/* Dark mode */}
              <div className="flex justify-between items-center py-3 text-xs">
                <div>
                  <p className="font-bold text-sm">Theme Mode</p>
                  <span className="text-[10px] text-gray-400">Toggle light or dark layout styling.</span>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-750">
                  {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                </button>
              </div>

              {/* Notifications preferences */}
              <div className="py-4 space-y-3">
                <p className="font-bold text-xs uppercase tracking-wider text-gray-400">Notification Channels</p>
                {Object.keys(notifPreferences).map(pref => (
                  <div key={pref} className="flex justify-between items-center text-xs">
                    <span className="capitalize">{pref} Alerts</span>
                    <button
                      onClick={() => setNotifPreferences({ ...notifPreferences, [pref]: !notifPreferences[pref] })}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors ${notifPreferences[pref] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifPreferences[pref] ? 'translate-x-5' : ''}`}></div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Privacy */}
              <div className="flex justify-between items-center py-4 text-xs">
                <div>
                  <p className="font-bold text-sm">Incognito Profile Mode</p>
                  <span className="text-[10px] text-gray-450">Hide account rewards and orders from referral channels.</span>
                </div>
                <button
                  onClick={() => { setPrivacyMode(!privacyMode); toast.success(`Privacy mode ${!privacyMode ? 'enabled' : 'disabled'}`) }}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${privacyMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${privacyMode ? 'translate-x-5' : ''}`}></div>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
