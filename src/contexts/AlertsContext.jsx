import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { evaluateAlerts, mergeAlerts } from '../data/alertEngine'
import { tasks, contentItems, atRiskMembers } from '../data/mockData'

const STORAGE_KEY = 'pulse_alerts_v1'
const CLIENTS_KEY = 'pulse_clients_v2'

function loadClients() {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function loadStoredAlerts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

const AlertsContext = createContext(null)

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState(() => {
    const clients = loadClients()
    const triggers = evaluateAlerts({ clients, tasks, contentItems, atRiskMembers })
    const stored = loadStoredAlerts()
    if (stored) return mergeAlerts(stored, triggers)
    return triggers.map(t => ({
      id: `alert-${t.signature}`,
      ...t,
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      snoozedUntil: null,
    }))
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  }, [alerts])

  const refresh = useCallback(() => {
    const clients = loadClients()
    const triggers = evaluateAlerts({ clients, tasks, contentItems, atRiskMembers })
    setAlerts(prev => mergeAlerts(prev, triggers))
  }, [])

  const resolveAlert = useCallback((id, resolvedBy = null) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: resolvedBy || 'Sonia' }
          : a
      )
    )
  }, [])

  const unresolveAlert = useCallback((id) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === id ? { ...a, resolved: false, resolvedAt: null, resolvedBy: null } : a
      )
    )
  }, [])

  const snoozeAlert = useCallback((id, hours) => {
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString()
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, snoozedUntil: until } : a)
    )
  }, [])

  const unsnoozeAlert = useCallback((id) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, snoozedUntil: null } : a)
    )
  }, [])

  const addManualAlert = useCallback((alertData) => {
    const id = `manual-${Date.now()}`
    setAlerts(prev => [...prev, {
      id,
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      snoozedUntil: null,
      createdAt: new Date().toISOString(),
      ...alertData,
    }])
    return id
  }, [])

  // Auto-unsnooze expired snoozes
  const now = Date.now()
  const unresolved = alerts.filter(a => {
    if (a.resolved) return false
    if (a.snoozedUntil && new Date(a.snoozedUntil).getTime() > now) return false
    return true
  })
  const snoozed = alerts.filter(a => !a.resolved && a.snoozedUntil && new Date(a.snoozedUntil).getTime() > now)
  const highPriorityCount = unresolved.filter(a => a.priority === 'High').length

  // Today: alerts created or updated today
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayAlerts = unresolved.filter(a => {
    const created = a.createdAt?.slice(0, 10)
    return created === todayStr || a.priority === 'High'
  })

  return (
    <AlertsContext.Provider value={{
      alerts,
      unresolved,
      snoozed,
      todayAlerts,
      highPriorityCount,
      resolveAlert,
      unresolveAlert,
      snoozeAlert,
      unsnoozeAlert,
      addManualAlert,
      refresh,
    }}>
      {children}
    </AlertsContext.Provider>
  )
}

export const useAlerts = () => useContext(AlertsContext)
