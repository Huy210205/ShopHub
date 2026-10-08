import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Support from './pages/Support'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPath && <Navbar />}
      {!isAdminPath && <CartDrawer />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdminPath && (
        <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-primary-400 font-bold text-xl">ShopHub</p>
            <div className="flex justify-center gap-4 text-sm">
              <a href="/contact" className="hover:text-white">Contact Us</a>
              <a href="/faq" className="hover:text-white">FAQ</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
            <p className="text-sm">&copy; 2026 ShopHub E-Commerce Platform. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  )
}

