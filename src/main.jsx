import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider }       from './hooks/useAuth.jsx'
import { SharedDataProvider } from './hooks/useSharedData.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SharedDataProvider>
        <App />
      </SharedDataProvider>
    </AuthProvider>
  </StrictMode>,
)