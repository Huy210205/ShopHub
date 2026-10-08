import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import { SavedForLaterProvider } from './context/SavedForLaterContext'
import { AddressProvider } from './context/AddressContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <SavedForLaterProvider>
                <AddressProvider>
                  <CartProvider>
                    <App />
                    <Toaster position="top-right" />
                  </CartProvider>
                </AddressProvider>
              </SavedForLaterProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
