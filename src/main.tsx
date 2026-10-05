import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { SiteSettingsProvider } from './lib/hooks/useSiteSettings'
import { AuthProvider } from './lib/hooks/useAuth'
import { BackendAuthProvider } from './lib/hooks/useBackendAuth'
import './styles/globals.css'

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
