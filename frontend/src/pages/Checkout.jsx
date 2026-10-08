import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAddresses } from '../context/AddressContext'

export default function Checkout() {
  const { cart, fetchCart } = useCart()
  const { addresses, selectedId, setSelectedId, selectedAddress, addAddress, updateAddress } = useAddresses()
  const navigate = useNavigate()
  const [step, setStep] = useState('address')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [addressForm, setAddressForm] = useState({ label: 'Home', line: '', city: '', pincode: '' })
  const [payment, setPayment] = useState({
    method: 'UPI', cardNumber: '', upiId: '', netBank: 'SBI',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchCart() }, [fetchCart])

  const saveAddress = (e) => {
    e.preventDefault()
    const full = `${addressForm.line}, ${addressForm.city} - ${addressForm.pincode} (${addressForm.label})`
    if (editingId) {
      updateAddress(editingId, { ...addressForm, full })
    } else {
      addAddress({ ...addressForm, full })
    }
    setShowAddressForm(false)
    setEditingId(null)
    setAddressForm({ label: 'Home', line: '', city: '', pincode: '' })
  }

  const startEditAddress = (a) => {
    setEditingId(a.id)
    setAddressForm({ label: a.label || 'Home', line: a.line || a.full, city: a.city || '', pincode: a.pincode || '' })
    setShowAddressForm(true)
  }

  const placeOrder = async () => {
    const shippingAddress = selectedAddress?.full || addressForm.line
    if (!shippingAddress) { toast.error('Select or add an address'); return }
    setLoading(true)
    try {
      // Đặt hàng với phương thức VNPAY
      if (payment.method === 'VNPAY') {
        let paymentMethod = 'VNPAY'
        const orderRes = await api.post('/orders', {
          shippingAddress,
          paymentMethod,
        })
        const order = orderRes.data?.data
        // Tạo URL thanh toán VNPay
        const vnpRes = await api.post(`/vnpay/create-payment?orderId=${order.id}&amount=${order.totalAmount}`)
        const paymentUrl = vnpRes.data?.data?.paymentUrl
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          toast.error('Không thể tạo URL thanh toán VNPay')
        }
        return
      }

      // Các phương thức thanh toán khác
      let paymentMethod = 'CREDIT_CARD'
      if (payment.method === 'UPI') paymentMethod = 'UPI'
      else if (payment.method === 'COD') paymentMethod = 'CASH_ON_DELIVERY'
      else if (payment.method === 'NET_BANKING') paymentMethod = 'CREDIT_CARD'

      await api.post('/orders', {
        shippingAddress,
        paymentMethod,
        cardNumber: payment.method === 'CARD' || payment.method === 'NET_BANKING' ? payment.cardNumber || '4111111111111111' : undefined,
        upiId: payment.method === 'UPI' ? payment.upiId : undefined,
      })
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">Cart is empty</p>
        <Link to="/cart" className="btn-primary">Back to Cart</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      <div className="flex gap-2 mb-6 text-sm">
        {['address', 'payment', 'confirm'].map((s, i) => (
          <span key={s} className={`px-3 py-1 rounded-full ${step === s ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 'address' && (
            <div className="card p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowAddressForm(true); setEditingId(null) }} className="btn-primary">Add New Address</button>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-outline">Edit Address</button>
              </div>
              {addresses.map((a) => (
                <label key={a.id} className={`block p-4 border rounded-lg cursor-pointer ${selectedId === a.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'dark:border-gray-600'}`}>
                  <input type="radio" name="address" checked={selectedId === a.id} onChange={() => setSelectedId(a.id)} className="mr-2" />
                  {a.full || `${a.line}, ${a.city}`}
                  <button type="button" onClick={() => startEditAddress(a)} className="ml-3 text-xs text-primary-600">Edit</button>
                </label>
              ))}
              {showAddressForm && (
                <form onSubmit={saveAddress} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Label (Home/Work)" className="input-field" required />
                  <textarea value={addressForm.line} onChange={(e) => setAddressForm({ ...addressForm, line: e.target.value })} placeholder="Address line" className="input-field" rows={2} required />
                  <div className="flex gap-2">
                    <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="input-field" required />
                    <input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="Pincode" className="input-field" required />
                  </div>
                  <button type="submit" className="btn-primary">{editingId ? 'Update Address' : 'Save Address'}</button>
                </form>
              )}
              {!addresses.length && !showAddressForm && (
                <p className="text-gray-500 text-sm">No saved addresses. Click Add New Address.</p>
              )}
              <button onClick={() => setStep('payment')} disabled={!selectedAddress && !addressForm.line} className="btn-primary w-full">Continue to Payment</button>
              <Link to="/cart" className="btn-secondary block text-center w-full">Back to Cart</Link>
            </div>
          )}

          {step === 'payment' && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold">Payment Method</h2>
              {[
                { id: 'VNPAY', label: '💳 Thanh toán VNPay', badge: 'Khuyến nghị' },
                { id: 'UPI', label: 'Pay with UPI' },
                { id: 'CARD', label: 'Pay with Card' },
                { id: 'NET_BANKING', label: 'Net Banking' },
                { id: 'COD', label: 'Cash on Delivery' },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer dark:border-gray-600 ${
                  payment.method === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
                }`}>
                  <input type="radio" checked={payment.method === m.id} onChange={() => setPayment({ ...payment, method: m.id })} />
                  <span className="flex-1">{m.label}</span>
                  {m.badge && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-full">{m.badge}</span>}
                </label>
              ))}
              {payment.method === 'UPI' && (
                <input value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} placeholder="UPI ID (name@upi)" className="input-field" required />
              )}
              {(payment.method === 'CARD' || payment.method === 'NET_BANKING') && (
                <input value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="Card / Account number" className="input-field" />
              )}
              {payment.method === 'NET_BANKING' && (
                <select value={payment.netBank} onChange={(e) => setPayment({ ...payment, netBank: e.target.value })} className="input-field">
                  {['SBI', 'HDFC', 'ICICI', 'Axis'].map((b) => <option key={b}>{b}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep('confirm')} className="btn-primary flex-1">Confirm Payment</button>
                <button onClick={() => { toast.error('Payment cancelled'); setStep('address') }} className="btn-danger flex-1">Cancel Payment</button>
              </div>
              <button onClick={() => setStep('address')} className="btn-secondary w-full">Back</button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold">Confirm Order</h2>
              <p className="text-sm"><strong>Address:</strong> {selectedAddress?.full || '—'}</p>
              <p className="text-sm"><strong>Payment:</strong> {payment.method}</p>
              <button onClick={placeOrder} disabled={loading} className="btn-primary w-full">
                {loading ? 'Placing...' : 'Place Order'}
              </button>
              <button onClick={() => setStep('payment')} className="btn-secondary w-full">Back to Payment</button>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-bold mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span className="line-clamp-1 flex-1">{item.productName} x{item.quantity}</span>
              <span>₹{item.subtotal?.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
            <span>Total</span><span>₹{cart.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
