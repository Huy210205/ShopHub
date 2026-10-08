import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  FiHome, FiBox, FiFolder, FiShoppingCart, FiUsers, FiStar, FiPercent,
  FiTrendingUp, FiSettings, FiBell, FiPlus, FiTrash2, FiCopy,
  FiMenu, FiX, FiSearch, FiSun, FiMoon, FiLogOut, FiAlertCircle
} from 'react-icons/fi'

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function AdminDashboard() {
  const { logout, user } = useAuth()
  const { darkMode, toggleTheme } = useTheme()

  // Sidebar Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Current tab state
  const [tab, setTab] = useState('dashboard')

  // API Data states
  const [analytics, setAnalytics] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])

  // UI search and notifications states
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Low stock alert: Smart Watch Pro is down to 8 units.', time: '5m ago', read: false },
    { id: 2, text: 'New refund request raised for Order #1004.', time: '1h ago', read: false },
    { id: 3, text: 'Support ticket registry updated by user.', time: '2h ago', read: true }
  ])

  // Sub-features search filters
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', sku: '', categoryId: '', brand: '', price: '', stock: '',
    imageUrl: '', description: '', specifications: '', weight: '', dimensions: ''
  })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [editingProduct, setEditingProduct] = useState(null)

  // Simulated features
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'SAVE10', discountType: 'PERCENTAGE', discountValue: 10, expiryDate: '2026-12-31', usageLimit: 500, usageCount: 145, status: 'ACTIVE' },
    { id: 2, code: 'WELCOME500', discountType: 'FLAT', discountValue: 500, expiryDate: '2026-08-30', usageLimit: 100, usageCount: 99, status: 'ACTIVE' }
  ])

  const [twoFactor, setTwoFactor] = useState(false)

  // Load Data
  const loadAnalytics = () => api.get('/admin/analytics').then(({ data }) => setAnalytics(data.data))
  const loadProducts = () => api.get('/products?size=50').then(({ data }) => setProducts(data.data.content))
  const loadCategories = () => api.get('/categories').then(({ data }) => setCategories(data.data))
  const loadUsers = () => api.get('/admin/users?size=50').then(({ data }) => setUsers(data.data.content))
  const loadOrders = () => api.get('/admin/orders?size=50').then(({ data }) => setOrders(data.data.content))

  useEffect(() => {
    loadAnalytics()
    loadCategories()
    loadProducts()
    loadUsers()
    loadOrders()
  }, [])

  // Product save / edit
  const saveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name.trim()) return toast.error('Product name cannot be empty')
    if (+productForm.price <= 0) return toast.error('Price must be greater than 0')
    if (+productForm.stock < 0) return toast.error('Stock cannot be negative')
    if (!productForm.sku) return toast.error('SKU is mandatory')
    if (!productForm.categoryId) return toast.error('Category is mandatory')

    const payload = {
      ...productForm,
      price: +productForm.price,
      stock: +productForm.stock,
      categoryId: +productForm.categoryId
    }

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct}`, payload)
        toast.success('Product updated successfully')
      } else {
        await api.post('/admin/products', payload)
        toast.success('Product created successfully')
      }
      setProductForm({ name: '', sku: '', categoryId: '', brand: '', price: '', stock: '', imageUrl: '', description: '', specifications: '', weight: '', dimensions: '' })
      setEditingProduct(null)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      loadProducts()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleDuplicateProduct = (p) => {
    setProductForm({
      name: `${p.name} (Copy)`,
      sku: `${p.sku || 'SKU'}-COPY-${Date.now().toString().slice(-4)}`,
      brand: p.brand || '',
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      description: p.description || '',
      categoryId: p.categoryId || '',
      specifications: p.specifications || '',
      weight: p.weight || '',
      dimensions: p.dimensions || ''
    })
    setEditingProduct(null)
    setTab('products')
    toast.success('Duplicated details into form')
  }

  // Category save
  const saveCategory = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/categories', categoryForm)
      toast.success('Category created')
      setCategoryForm({ name: '', description: '' })
      loadCategories()
    } catch (err) {
      toast.error('Failed to create category')
    }
  }

  // Update order status
  const handleUpdateOrderStatus = async (id, status) => {
    const order = orders.find(o => o.id === id)
    if (order && order.status === 'DELIVERED') {
      return toast.error('Delivered orders cannot be edited.')
    }
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      toast.success(`Order status updated to ${status}`)
      loadOrders()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  // Block/Unblock customer
  const toggleBlockUser = async (id, blocked, name) => {
    try {
      await api.put(`/admin/users/${id}/${blocked ? 'unblock' : 'block'}`)
      toast.success(blocked ? `Unblocked ${name}` : `Blocked ${name}`)
      loadUsers()
    } catch (err) {
      toast.error('Failed to change block status')
    }
  }

  // Sidebar Links
  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'products', label: 'Products', icon: FiBox },
    { id: 'categories', label: 'Categories', icon: FiFolder },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart },
    { id: 'customers', label: 'Customers', icon: FiUsers },
    { id: 'reviews', label: 'Reviews', icon: FiStar },
    { id: 'coupons', label: 'Coupons', icon: FiPercent },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ]

  // Filter computations
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
  const filteredOrders = orders.filter(o => o.id.toString().includes(orderSearch) || o.status.toLowerCase().includes(orderSearch.toLowerCase()))
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col antialiased">
      
      {/* FIXED TOP NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Menu triggers */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hidden md:block text-gray-500">
            <FiMenu size={20} />
          </button>
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden text-gray-500">
            <FiMenu size={20} />
          </button>

          <span className="text-xl font-bold text-primary-600 dark:text-primary-400 select-none tracking-wide">ShopHub Admin</span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search panels & analytics..."
            className="w-full bg-gray-100 dark:bg-gray-900 text-xs pl-9 pr-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          {/* Dark Mode toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications alert */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 relative">
              <FiBell size={18} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between items-center text-xs">
                  <span className="font-bold">System Alerts</span>
                  <button onClick={() => { setNotifications(notifications.map(n => ({ ...n, read: true }))); toast.success('Marked all read') }} className="text-primary-600 font-semibold hover:underline">Mark all read</button>
                </div>
                <div className="divide-y dark:divide-gray-700 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 text-xs hover:bg-gray-50 dark:hover:bg-gray-750">
                      <p className="font-medium text-gray-750 dark:text-gray-300">{n.text}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin profile & Logout widget */}
          <div className="flex items-center gap-2 border-l border-gray-250 dark:border-gray-700 pl-4">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs select-none">
              VU
            </div>
            <div className="hidden lg:block leading-none text-left select-none">
              <p className="font-bold text-xs">Vamsi Ukkusuri</p>
              <span className="text-[10px] text-gray-400 font-medium">Super Admin</span>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 ml-2" title="Logout from Admin Dashboard">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* COLLAPSIBLE SIDEBAR & MAIN BODY WRAPPER */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside className={`bg-gray-900 text-gray-400 border-r border-gray-800 hidden md:flex flex-col shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map(link => {
              const Icon = link.icon
              const active = tab === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => setTab(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={link.label}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* MOBILE SIDEBAR (Drawer overlay) */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <aside className="w-64 bg-gray-900 text-gray-400 h-full p-4 flex flex-col space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span className="font-bold text-white text-base">Navigation</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map(link => {
                  const Icon = link.icon
                  const active = tab === link.id
                  return (
                    <button
                      key={link.id}
                      onClick={() => { setTab(link.id); setMobileSidebarOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.label}</span>
                    </button>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* CENTRAL SCROLL CONTENT BODY */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
          
          {/* ==================== PANEL: DASHBOARD ==================== */}
          {tab === 'dashboard' && analytics && (
            <div className="space-y-6">
              
              {/* Dynamic Low Stock alert panel */}
              {products.some(p => p.stock < 10) && (
                <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-300 rounded-lg flex items-center gap-3 text-xs shadow-sm">
                  <FiAlertCircle size={18} className="shrink-0" />
                  <span><strong>Low Stock Alert:</strong> Some items in catalog are below 10 units. Restock from the products catalog panel.</span>
                </div>
              )}

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue', value: `₹${analytics.totalRevenue}`, color: 'border-l-emerald-500', textClr: 'text-emerald-500' },
                  { label: 'Total Orders', value: analytics.totalOrders, color: 'border-l-blue-500', textClr: 'text-blue-500' },
                  { label: 'Total Customers', value: analytics.totalUsers, color: 'border-l-purple-500', textClr: 'text-purple-500' },
                  { label: 'Total Products', value: analytics.totalProducts, color: 'border-l-amber-500', textClr: 'text-amber-500' }
                ].map((card, index) => (
                  <div key={index} className={`card p-6 border-l-4 ${card.color} bg-white dark:bg-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all rounded-xl`}>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{card.label}</span>
                    <p className={`text-3xl font-extrabold ${card.textClr} mt-3`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* SALES ANALYTICS CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Daily Sales & Orders</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={[
                      { name: 'Mon', revenue: 32000 },
                      { name: 'Tue', revenue: 49000 },
                      { name: 'Wed', revenue: 58000 },
                      { name: 'Thu', revenue: 64000 },
                      { name: 'Fri', revenue: 81000 },
                      { name: 'Sat', revenue: 99000 },
                      { name: 'Sun', revenue: 92000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#ea580c" fillOpacity={0.06} fill="#ea580c" name="Revenue (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Top Category shares</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Electronics', value: 45 },
                          { name: 'Fashion', value: 30 },
                          { name: 'Books', value: 15 },
                          { name: 'Home & Kitchen', value: 10 }
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Recent Core Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b dark:border-gray-700 text-gray-400 uppercase tracking-wider font-semibold">
                        <th className="py-3">Order ID</th>
                        <th>User Email</th>
                        <th>Gross Total</th>
                        <th>Order Status</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {analytics.recentOrders?.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                          <td className="py-3 font-semibold text-primary-600">#{o.id}</td>
                          <td className="font-medium text-gray-750 dark:text-gray-300">user@ecommerce.com</td>
                          <td className="font-bold text-gray-900 dark:text-white">₹{o.totalAmount}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>{o.status}</span>
                          </td>
                          <td className="text-gray-400">{new Date(o.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PANEL: PRODUCTS ==================== */}
          {tab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4 h-fit">
                <h3 className="font-bold text-sm uppercase tracking-wider pb-2 border-b dark:border-gray-700">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <form onSubmit={saveProduct} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Product Title *</label>
                    <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="input-field" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">SKU *</label>
                      <input placeholder="SKU-XXXX" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Brand</label>
                      <input placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₹) *</label>
                      <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Stock *</label>
                      <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category *</label>
                    <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="input-field" required>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL</label>
                    <input placeholder="https://..." value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                    <textarea rows={3} placeholder="Details..." value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="input-field" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn-primary flex-1 py-2">{editingProduct ? 'Save' : 'Publish'}</button>
                    {editingProduct && (
                      <button type="button" onClick={() => {
                        setEditingProduct(null)
                        setProductForm({ name: '', sku: '', categoryId: '', brand: '', price: '', stock: '', imageUrl: '', description: '', specifications: '', weight: '', dimensions: '' })
                      }} className="btn-outline px-3">Cancel</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-8 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Catalog Inventory</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8 pr-4 py-1.5 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs w-52 outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b dark:border-gray-700 text-gray-400">
                        <th className="py-3">Product Name</th>
                        <th>Price</th>
                        <th>Stock Level</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                          <td className="py-3 flex items-center gap-3">
                            <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt="" className="w-9 h-9 object-cover rounded-lg shrink-0 border" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                              <span className="text-[10px] text-gray-450 block mt-0.5">SKU: {p.sku || `PROD-${p.id}`}</span>
                            </div>
                          </td>
                          <td className="font-bold">₹{p.price}</td>
                          <td>
                            {p.stock <= 0 ? (
                              <span className="text-red-500 font-bold text-[10px]">OUT OF STOCK</span>
                            ) : p.stock < 10 ? (
                              <span className="text-amber-500 font-bold text-[10px]">LOW ({p.stock})</span>
                            ) : (
                              <span className="text-emerald-500 font-bold text-[10px]">HEALTHY ({p.stock})</span>
                            )}
                          </td>
                          <td className="text-right py-3 space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p.id)
                                setProductForm({
                                  name: p.name, sku: p.sku || `SKU-${p.id}`, categoryId: p.categoryId || '',
                                  brand: p.brand || '', price: p.price, stock: p.stock, imageUrl: p.imageUrl,
                                  description: p.description || '', specifications: p.specifications || '',
                                  weight: p.weight || '', dimensions: p.dimensions || ''
                                })
                              }}
                              className="text-primary-600 font-bold hover:underline"
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDuplicateProduct(p)} className="text-blue-500 font-bold hover:underline">Duplicate</button>
                            <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-red-500 font-bold hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PANEL: CATEGORIES ==================== */}
          {tab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Create Category</h3>
                <form onSubmit={saveCategory} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category Title *</label>
                    <input placeholder="Title" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                    <textarea rows={3} placeholder="Description details..." value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="input-field" />
                  </div>
                  <button type="submit" className="btn-primary w-full py-2">Publish Category</button>
                </form>
              </div>

              <div className="lg:col-span-7 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Active Categories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="p-4 border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 rounded-xl">
                      <span className="text-[10px] text-primary-500 font-bold uppercase">CAT #{c.id}</span>
                      <h4 className="font-bold text-base mt-1">{c.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{c.description || 'No description.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PANEL: ORDERS ==================== */}
          {tab === 'orders' && (
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                <h3 className="font-bold text-sm uppercase tracking-wider">Order Book Management</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Order ID or Status..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-4 py-1.5 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs w-52 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-400">
                      <th className="py-3">Order ID</th>
                      <th>Gross Total</th>
                      <th>Current Status</th>
                      <th>Update Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                        <td className="py-3 font-semibold text-primary-600">#{o.id}</td>
                        <td className="font-bold">₹{o.totalAmount}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>{o.status}</span>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            disabled={o.status === 'DELIVERED'}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="input-field text-[11px] py-1 max-w-[150px]"
                          >
                            {['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-right py-3">
                          <button onClick={() => toast.success('Printed invoice')} className="text-primary-600 font-bold hover:underline">Invoice</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PANEL: CUSTOMERS ==================== */}
          {tab === 'customers' && (
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider">Customer Log Registry</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name/email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-4 py-1.5 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs w-52 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-400">
                      <th className="py-3">Customer Name</th>
                      <th>Email Address</th>
                      <th>System Role</th>
                      <th>Blocked Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                        <td className="py-3 font-semibold">{u.name}</td>
                        <td className="font-medium">{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          {u.blocked ? (
                            <span className="text-red-500 font-bold">Blocked</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">Active</span>
                          )}
                        </td>
                        <td className="text-right py-3">
                          <button
                            onClick={() => toggleBlockUser(u.id, u.blocked, u.name)}
                            className={`font-bold hover:underline ${u.blocked ? 'text-emerald-600' : 'text-amber-600'}`}
                          >
                            {u.blocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PANEL: REVIEWS ==================== */}
          {tab === 'reviews' && (
            <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Customer Product Reviews</h3>
              <div className="divide-y dark:divide-gray-700">
                {[
                  { id: 1, author: 'cust3@gmail.com', rating: 1, text: 'This watch is fake and absolute scam!', date: 'Today, 10:14', product: 'Smart Watch Pro' },
                  { id: 2, author: 'buyer@outlook.com', rating: 5, text: 'Excellent headphone, pristine sound quality!', date: 'Yesterday, 14:22', product: 'Wireless Headphones' }
                ].map(rev => {
                  const isOffensive = rev.text.toLowerCase().includes('fake') || rev.text.toLowerCase().includes('scam')
                  return (
                    <div key={rev.id} className="py-4 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold">{rev.author} reviewed <span className="text-primary-500">{rev.product}</span></p>
                          <span className="text-amber-500">{'⭐'.repeat(rev.rating)}</span>
                        </div>
                        <span className="text-gray-400 text-[10px]">{rev.date}</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border dark:border-gray-850">
                        {rev.text}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        {isOffensive && <span className="text-[10px] font-bold text-rose-500">Flagged: Abusive Language</span>}
                        <button onClick={() => toast.success('Review status adjusted')} className="text-red-500 font-bold hover:underline">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ==================== PANEL: COUPONS ==================== */}
          {tab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Create Coupon Code</h3>
                <form onSubmit={(e) => { e.preventDefault(); toast.success('Coupon created successfully!'); e.target.reset() }} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Promo Code *</label>
                    <input placeholder="E.g. NEWYEAR20" className="input-field" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Type</label>
                      <select className="input-field">
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Rate (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Value *</label>
                      <input type="number" placeholder="Value" className="input-field" required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-2">Create Coupon</button>
                </form>
              </div>

              <div className="lg:col-span-7 card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider">Active Promotional Coupons</h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-400">
                      <th className="py-2">Code</th>
                      <th>Discount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} className="border-b dark:border-gray-700">
                        <td className="py-2 font-semibold text-primary-500">{c.code}</td>
                        <td className="font-bold">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                        <td className="text-emerald-500 font-bold">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PANEL: ANALYTICS ==================== */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-wider">Advanced Analytics Dashboard</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Monthly Revenue Trends (₹)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[
                      { name: 'Jan', revenue: 120000 },
                      { name: 'Feb', revenue: 190000 },
                      { name: 'Mar', revenue: 240000 },
                      { name: 'Apr', revenue: 310000 },
                      { name: 'May', revenue: 450000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Gross Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Top Category sales volume</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Electronics', count: 432 },
                      { name: 'Fashion', count: 782 },
                      { name: 'Books', count: 212 },
                      { name: 'Home & Kitchen', count: 356 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PANEL: SETTINGS ==================== */}
          {tab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl space-y-6">
                <h3 className="font-bold text-sm uppercase tracking-wider border-b dark:border-gray-700 pb-2">Administrative Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-sm">Two-Factor Authentication (2FA)</p>
                      <span className="text-[10px] text-gray-450">Require standard verification codes on login.</span>
                    </div>
                    <button
                      onClick={() => { setTwoFactor(!twoFactor); toast.success(`2FA ${!twoFactor ? 'enabled' : 'disabled'}`) }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${twoFactor ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
