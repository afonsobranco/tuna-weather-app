import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Inject Vercel Speed Insights
injectSpeedInsights()

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
