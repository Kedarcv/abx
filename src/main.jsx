import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuth } from './store/auth.js'

// Subscribe to Firebase Auth state once at boot. The returned unsubscribe is
// intentionally not stored — the app lives until the tab closes.
useAuth.getState().init()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
