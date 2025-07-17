import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker, initInstallPrompt } from './utils/pwaUtils.js'

// Register service worker for PWA functionality
registerServiceWorker()

// Initialize install prompt handling
initInstallPrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
