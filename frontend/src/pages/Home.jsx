import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [email, setEmail] = useState('')

  useEffect(() => {
    api.get('/products?size=8&sortBy=newest').then(({ data }) => setProducts(data.data.content))
    api.get('/categories').then(({ data }) => setCategories(data.data))
  }, [])

  const subscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('Subscribed to newsletter!')
    setEmail('')
  }

  return (
    <div>
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Discover Amazing <span className="text-primary-400">Deals</span> Every Day
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              Shop the latest electronics, fashion, books and more with fast delivery and secure payments.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products" className="btn-outline border-white text-white hover:bg-white/10 inline-flex items-center gap-2 px-6 py-3">
                Explore Products
              </Link>
              <Link to="/products?view=deals" className="btn-outline border-primary-400 text-primary-400 hover:bg-primary-400/10 px-6 py-3">
                View Deals
              </Link>
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96fa2be4d1?w=600" alt="Shopping" className="rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-wrap gap-3 justify-center">
        <Link to="/products?view=categories" className="btn-secondary">Browse Categories</Link>
        <Link to="/faq" className="btn-outline">Learn More</Link>
        <Link to="/support" className="btn-outline">Chat Support</Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹999' },
          { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
          { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer service' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Icon className="text-primary-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link to="/products?view=categories" className="btn-outline btn-sm">Browse Categories</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="card p-6 text-center hover:shadow-lg hover:border-primary-300 transition-all">
              <h3 className="font-semibold text-primary-600">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link to="/products?sortBy=newest" className="text-primary-600 hover:underline flex items-center gap-1">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="card p-8 md:p-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Subscribe Newsletter</h2>
          <p className="text-primary-100 mb-6">Get deals, new arrivals & exclusive offers in your inbox.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="input-field text-gray-900 flex-1" required />
            <button type="submit" className="bg-white text-primary-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100">Subscribe Newsletter</button>
          </form>
        </div>
      </section>
    </div>
  )
}
