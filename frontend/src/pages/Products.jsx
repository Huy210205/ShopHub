import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sortBy = searchParams.get('sortBy') || 'newest'
  const page = parseInt(searchParams.get('page') || '0')
  const view = searchParams.get('view') || ''

  const [draft, setDraft] = useState({ search, minPrice, maxPrice, category })

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data))
  }, [])

  useEffect(() => {
    setDraft({ search, minPrice, maxPrice, category })
  }, [search, minPrice, maxPrice, category])

  const fetchProducts = () => {
    setLoading(true)
    let sortByParam = sortBy
    let sortDir = 'desc'
    if (sortBy === 'price') { sortByParam = 'price'; sortDir = 'asc' }
    else if (sortBy === 'price-desc') { sortByParam = 'price'; sortDir = 'desc' }
    else if (sortBy === 'rating' || sortBy === 'popularity') { sortByParam = 'rating'; sortDir = 'desc' }
    else { sortByParam = 'newest'; sortDir = 'desc' }

    const params = new URLSearchParams({ page, size: 12, sortBy: sortByParam, sortDir })
    if (search) params.set('name', search)
    if (category) params.set('categoryId', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (view === 'deals') params.set('maxPrice', maxPrice || '3000')

    api.get(`/products?${params}`)
      .then(({ data }) => {
        setProducts(data.data.content)
        setTotalPages(data.data.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search, category, minPrice, maxPrice, sortBy, page, view])

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '0')
    setSearchParams(params)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)
    if (draft.search) params.set('search', draft.search)
    else params.delete('search')
    if (draft.minPrice) params.set('minPrice', draft.minPrice)
    else params.delete('minPrice')
    if (draft.maxPrice) params.set('maxPrice', draft.maxPrice)
    else params.delete('maxPrice')
    if (draft.category) params.set('category', draft.category)
    else params.delete('category')
    params.set('page', '0')
    setSearchParams(params)
  }

  const clearFilters = () => {
    setDraft({ search: '', minPrice: '', maxPrice: '', category: '' })
    setSearchParams({})
  }

  const title = view === 'deals' ? 'Deals' : view === 'categories' ? 'Categories' : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {/* Search bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={draft.search}
          onChange={(e) => setDraft({ ...draft, search: e.target.value })}
          className="input-field flex-1"
        />
        <button onClick={applyFilters} className="btn-primary">Search</button>
        <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
        <button onClick={applyFilters} className="btn-outline">Apply Filters</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <button onClick={() => setDraft({ ...draft, category: '' })} className={`block w-full text-left text-sm py-1 ${!draft.category ? 'text-primary-600 font-medium' : ''}`}>All</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setDraft({ ...draft, category: String(cat.id) })} className={`block w-full text-left text-sm py-1 ${draft.category == cat.id ? 'text-primary-600 font-medium' : ''}`}>{cat.name}</button>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="flex gap-2 mb-3">
              <input type="number" placeholder="Min" value={draft.minPrice} onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })} className="input-field text-sm" />
              <input type="number" placeholder="Max" value={draft.maxPrice} onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
          <div className="card p-4 space-y-2">
            <h3 className="font-semibold mb-2">Sort By</h3>
            <button onClick={() => updateFilter('sortBy', 'price')} className={`btn-sm w-full ${sortBy === 'price' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>Sort By Price</button>
            <button onClick={() => updateFilter('sortBy', 'rating')} className={`btn-sm w-full ${sortBy === 'rating' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>Sort By Rating</button>
            <button onClick={() => updateFilter('sortBy', 'newest')} className={`btn-sm w-full ${sortBy === 'newest' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>Sort By Newest</button>
            <button onClick={() => updateFilter('sortBy', 'popularity')} className={`btn-sm w-full ${sortBy === 'popularity' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>Sort By Popularity</button>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No products found</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button disabled={page === 0} onClick={() => updateFilter('page', String(page - 1))} className="btn-secondary">Previous</button>
                  <span className="py-2 px-4">Page {page + 1} of {totalPages}</span>
                  <button disabled={page >= totalPages - 1} onClick={() => updateFilter('page', String(page + 1))} className="btn-secondary">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
