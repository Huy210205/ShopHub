import toast from 'react-hot-toast'

export function shareProduct(product) {
  const url = `${window.location.origin}/products/${product.id}`
  const text = `Check out ${product.name} on ShopHub - ₹${product.price}`
  if (navigator.share) {
    navigator.share({ title: product.name, text, url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(url)
    toast.success('Product link copied!')
  }
}

export function downloadInvoice(order) {
  const content = `ShopHub Invoice\nOrder #${order.id}\nDate: ${new Date(order.createdAt).toLocaleString()}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}`
  const blob = new Blob([content], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `invoice-${order.id}.txt`
  a.click()
  toast.success('Invoice downloaded')
}

export function mockAction(label) {
  toast.success(`${label} — request submitted`)
}
