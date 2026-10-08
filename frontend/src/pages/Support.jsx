import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Support() {
  const { user } = useAuth()
  const [ticket, setTicket] = useState({ subject: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState('')

  const raiseTicket = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...ticket,
        email: user?.email || 'Anonymous/Guest'
      }
      const { data } = await api.post('/support/ticket', payload)
      toast.success(data.message || 'Ticket raised! We will contact you soon.')
      setTicket({ subject: '', description: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sendChat = (e) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    toast.success('Support: Thanks for reaching out! An agent will reply shortly.')
    setChatMsg('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Support</h1>
      <div className="grid gap-6">
        <div className="card p-6">
          <button onClick={() => setChatOpen(!chatOpen)} className="btn-primary w-full mb-4">Chat Support</button>
          {chatOpen && (
            <form onSubmit={sendChat} className="space-y-3">
              <div className="h-32 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-500 overflow-y-auto">
                <p>Support Bot: Hi! How can we help you today?</p>
              </div>
              <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Type your message..." className="input-field" />
              <button type="submit" className="btn-secondary w-full">Send</button>
            </form>
          )}
        </div>

        <form onSubmit={raiseTicket} className="card p-6 space-y-4">
          <h2 className="font-semibold">Raise Ticket</h2>
          <input value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} placeholder="Subject" className="input-field" disabled={loading} required />
          <textarea value={ticket.description} onChange={(e) => setTicket({ ...ticket, description: e.target.value })} placeholder="Describe your issue" className="input-field" rows={4} disabled={loading} required />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Raising Ticket...' : 'Raise Ticket'}
          </button>
        </form>

        <div className="flex gap-3">
          <Link to="/contact" className="btn-outline flex-1 text-center">Contact Us</Link>
          <Link to="/faq" className="btn-outline flex-1 text-center">FAQ</Link>
        </div>
      </div>
    </div>
  )
}

