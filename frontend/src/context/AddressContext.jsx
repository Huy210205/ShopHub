import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const AddressContext = createContext(null)

export function AddressProvider({ children }) {
  const { user } = useAuth()
  const key = user ? `shophub_addresses_${user.id}` : null

  const [addresses, setAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!key) { setAddresses([]); setSelectedId(null); return }
    try {
      const saved = JSON.parse(localStorage.getItem(key)) || []
      setAddresses(saved)
      setSelectedId(saved[0]?.id || null)
    } catch {
      setAddresses([])
    }
  }, [key])

  const persist = (list) => {
    setAddresses(list)
    if (key) localStorage.setItem(key, JSON.stringify(list))
  }

  const addAddress = (address) => {
    const entry = { ...address, id: Date.now() }
    const list = [...addresses, entry]
    persist(list)
    setSelectedId(entry.id)
    toast.success('Address added')
    return entry
  }

  const updateAddress = (id, data) => {
    persist(addresses.map((a) => (a.id === id ? { ...a, ...data } : a)))
    toast.success('Address updated')
  }

  const deleteAddress = (id) => {
    const list = addresses.filter((a) => a.id !== id)
    persist(list)
    if (selectedId === id) setSelectedId(list[0]?.id || null)
  }

  const selectedAddress = addresses.find((a) => a.id === selectedId)

  return (
    <AddressContext.Provider value={{
      addresses, selectedId, setSelectedId, selectedAddress,
      addAddress, updateAddress, deleteAddress,
    }}>
      {children}
    </AddressContext.Provider>
  )
}

export const useAddresses = () => useContext(AddressContext)
