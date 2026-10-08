import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiSun, FiMoon, FiUser, FiMenu, FiX, FiHome } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const SHOP_LINKS = [
  { to: '/products?view=categories', label: 'Categories' },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(search)}`)
    setMobileOpen(false)
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0">
            <span className="text-2xl font-bold text-primary-400">ShopHub</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-primary-600">
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/" className="nav-link flex items-center gap-1"><FiHome size={16} /> Home</Link>
            {user ? (
              <>
                <Link to="/wishlist" className="nav-link flex items-center gap-1 relative" title="Wishlist">
                  Wishlist ❤️ {wishlistCount > 0 && <span className="text-primary-400">({wishlistCount})</span>}
                </Link>
                <Link to="/cart" className="nav-link flex items-center gap-1 relative" title="Cart">
                  Cart 🛒 {itemCount > 0 && <span className="text-primary-400">({itemCount})</span>}
                </Link>
                <Link to="/orders" className="nav-link flex items-center gap-1" title="Orders">
                  Orders 📦
                </Link>
                <Link to="/profile" className="nav-link flex items-center gap-1" title="Profile">
                  Profile 👤
                </Link>
                {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
                <button onClick={logout} className="nav-link">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Register</Link>
              </>
            )}
            <Link to="/contact" className="nav-link">Contact Us</Link>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-800">
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Shop links row — desktop */}
        <div className="hidden md:flex items-center gap-5 pb-3 border-t border-gray-800 pt-2 overflow-x-auto">
          {SHOP_LINKS.map((l) => (
            <Link key={l.label} to={l.to} className="nav-link text-xs uppercase tracking-wide">{l.label}</Link>
          ))}
        </div>


        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-3 border-t border-gray-800 pt-3">
            <form onSubmit={handleSearch}>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 rounded-lg text-gray-900" />
            </form>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link to="/" onClick={closeMobile} className="nav-link">Home</Link>
              {SHOP_LINKS.map((l) => (
                <Link key={l.label} to={l.to} onClick={closeMobile} className="nav-link">{l.label}</Link>
              ))}
              {user ? (
                <>
                  <Link to="/orders" onClick={closeMobile} className="nav-link">Orders</Link>
                  <Link to="/profile" onClick={closeMobile} className="nav-link">Profile</Link>
                  {isAdmin && <Link to="/admin" onClick={closeMobile} className="nav-link">Admin</Link>}
                  <button onClick={() => { logout(); closeMobile() }} className="nav-link">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile} className="nav-link">Login</Link>
                  <Link to="/register" onClick={closeMobile} className="nav-link">Register</Link>
                </>
              )}
              <Link to="/contact" onClick={closeMobile} className="nav-link">Contact Us</Link>
              <button onClick={toggleTheme} className="nav-link">{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

