import React, { createContext, useContext, useState, useEffect } from 'react'

const ACCOUNTS = [
  {
    id: 'admin-1',
    email: 'admin@stratinsightdigital.com',
    password: 'Stratinsight2025',
    name: 'Agency Admin',
    role: 'admin',
    initials: 'AA',
    agency: 'Strat Insight Digital',
  },
  {
    id: 'client-1',
    email: 'client@test.com',
    password: 'Client2025',
    name: 'Test Client',
    role: 'client',
    initials: 'TC',
    agency: 'Test Wellness Co.',
  },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pulse_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [error, setError] = useState('')

  const login = (email, password) => {
    const account = ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    )
    if (account) {
      const { password: _, ...safeUser } = account
      setUser(safeUser)
      localStorage.setItem('pulse_user', JSON.stringify(safeUser))
      setError('')
      return true
    }
    setError('Invalid email or password. Please try again.')
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pulse_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
