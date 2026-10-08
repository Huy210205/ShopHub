import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/support/contact', form)
      toast.success(data.message || 'Message sent! We will contact you soon.')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input-field" disabled={loading} required />
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-field" disabled={loading} required />
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" className="input-field" rows={5} disabled={loading} required />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Contact Us'}
        </button>
      </form>
      <div className="mt-6 flex gap-3 justify-center">
        <Link to="/support" className="btn-outline">Chat Support</Link>
        <Link to="/faq" className="btn-outline">FAQ</Link>
      </div>
    </div>
  )
}

