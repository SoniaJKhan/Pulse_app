import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AlertsProvider } from './contexts/AlertsContext'
import Login from './components/Login'
import Layout from './components/Layout'
import ClientPortal from './pages/ClientPortal'
import { cleanupLegacyKeys } from './utils/storage'

cleanupLegacyKeys()

function AppInner() {
  const { user } = useAuth()
  if (!user) return <Login />
  if (user.role === 'client') return <ClientPortal />
  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <AlertsProvider>
        <AppInner />
      </AlertsProvider>
    </AuthProvider>
  )
}
