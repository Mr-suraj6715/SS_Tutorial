import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { SiteSettingsProvider } from './lib/hooks/useSiteSettings'
import { AuthProvider } from './lib/hooks/useAuth'
import { BackendAuthProvider } from './lib/hooks/useBackendAuth'
import './styles/globals.css'

// Transparently route /api and /uploads to Render backend if VITE_API_URL is configured
const rawApiUrl = (import.meta as any).env.VITE_API_URL
if (rawApiUrl && typeof window !== 'undefined') {
  const apiUrl = String(rawApiUrl).replace(/\/$/, '')
  const originalFetch = window.fetch
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        return originalFetch(apiUrl + input, init)
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api') || input.pathname.startsWith('/uploads')) {
        return originalFetch(new URL(apiUrl + input.pathname + input.search), init)
      }
    }
    return originalFetch(input, init)
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BackendAuthProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SiteSettingsProvider>
    </BackendAuthProvider>
  </React.StrictMode>
)
