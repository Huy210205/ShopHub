import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CompareContext = createContext(null)
const KEY = 'shophub_compare'
const MAX = 4

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(compareList))
  }, [compareList])

  const isCompared = (id) => compareList.some((p) => p.id === id)

  const toggleCompare = (product) => {
    if (isCompared(product.id)) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id))
      toast.success('Removed from compare')
    } else if (compareList.length >= MAX) {
      toast.error(`Compare up to ${MAX} products only`)
    } else {
      setCompareList((prev) => [...prev, product])
      toast.success('Added to compare')
    }
  }

  return (
    <CompareContext.Provider value={{ compareList, isCompared, toggleCompare, count: compareList.length }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => useContext(CompareContext)
