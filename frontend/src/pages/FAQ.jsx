import { Link } from 'react-router-dom'

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to Orders and click Track Order on any order.' },
  { q: 'What payment methods are accepted?', a: 'UPI, Credit/Debit Card, Net Banking, and Cash on Delivery.' },
  { q: 'How do I return a product?', a: 'For delivered orders, use Return Order from the Orders page.' },
  { q: 'Is my payment secure?', a: 'Yes, all transactions are encrypted and secure.' },
  { q: 'How do I apply a coupon?', a: 'Enter coupon code SAVE10 on the Cart page and click Apply Coupon.' },
]

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">FAQ</h1>
      <div className="space-y-4">
        {FAQS.map((f) => (
          <div key={f.q} className="card p-5">
            <h3 className="font-semibold text-primary-600 mb-2">{f.q}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3 justify-center">
        <Link to="/contact" className="btn-primary">Contact Us</Link>
        <Link to="/support" className="btn-outline">Chat Support</Link>
      </div>
    </div>
  )
}
