import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function VNPayReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | failed
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())

    api.get('/vnpay/return', { params })
      .then(res => {
        const data = res.data?.data
        setOrderId(data?.orderId)
        if (data?.success) {
          setStatus('success')
          setMessage('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.')
        } else {
          setStatus('failed')
          setMessage(data?.message || 'Thanh toán thất bại. Vui lòng thử lại.')
        }
      })
      .catch(() => {
        setStatus('failed')
        setMessage('Có lỗi xảy ra khi xác nhận thanh toán.')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-lg font-medium">Đang xác nhận thanh toán...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Thanh toán thành công!</h1>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
            {orderId && <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-semibold">#{orderId}</span></p>}
            <div className="flex gap-3">
              <button onClick={() => navigate('/orders')} className="btn-primary flex-1">
                Xem đơn hàng
              </button>
              <button onClick={() => navigate('/')} className="btn-outline flex-1">
                Tiếp tục mua sắm
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Thanh toán thất bại</h1>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/cart')} className="btn-primary flex-1">
                Thử lại
              </button>
              <button onClick={() => navigate('/')} className="btn-outline flex-1">
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
