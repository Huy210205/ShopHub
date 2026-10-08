import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const SavedForLaterContext = createContext(null)
const KEY = 'shophub_saved'

export function SavedForLaterProvider({ children }) {
  const [savedItems, setSavedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(savedItems))
  }, [savedItems])

  const saveForLater = (item) => {
    if (savedItems.some((i) => i.productId === item.productId)) {
      toast.error('Already saved for later')
      return
    }
    setSavedItems((prev) => [...prev, item])
    toast.success('Saved for later')
  }

  const removeSaved = (productId) => {
    setSavedItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  return (
    <SavedForLaterContext.Provider value={{ savedItems, saveForLater, removeSaved }}>
      {children}
    </SavedForLaterContext.Provider>
  )
}

export const useSavedForLater = () => useContext(SavedForLaterContext)
