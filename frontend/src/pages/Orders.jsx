import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { downloadInvoice, mockAction } from '../utils/productActions'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const TRACK_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetchOrders = () => {
    api.get('/users/orders?size=20')
      .then(({ data }) => setOrders(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                <p className="font-bold text-primary-600">₹{order.totalAmount}</p>
              </div>

              {expanded === order.id && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Track Order</p>
                  <div className="flex flex-wrap gap-2">
                    {TRACK_STEPS.map((s) => (
                      <span key={s} className={`text-xs px-2 py-1 rounded ${TRACK_STEPS.indexOf(s) <= TRACK_STEPS.indexOf(order.status) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    <span className="flex-1">{item.productName} x{item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="btn-sm btn-outline">View Order</button>
                <button onClick={() => setExpanded(order.id)} className="btn-sm btn-outline">Track Order</button>
                {['PENDING', 'PROCESSING'].includes(order.status) && (
                  <button onClick={() => cancelOrder(order.id)} className="btn-sm text-red-500 border border-red-300 px-2 rounded">Cancel Order</button>
                )}
                {order.status === 'DELIVERED' && (
                  <>
                    <button onClick={() => mockAction('Return Order')} className="btn-sm btn-outline">Return Order</button>
                    <button onClick={() => mockAction('Request Refund')} className="btn-sm btn-outline">Request Refund</button>
                  </>
                )}
                <button onClick={() => downloadInvoice(order)} className="btn-sm btn-primary">Download Invoice</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
