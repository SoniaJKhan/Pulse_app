import { useState, useEffect, useCallback } from 'react'
import { clients as seedClients } from '../data/mockData'

const STORAGE_KEY = 'pulse_clients_v2'

export function generateChecklist() {
  const due = new Date()
  due.setDate(due.getDate() + 7)
  const dueStr = due.toISOString().split('T')[0]
  const prefix = Date.now().toString(36)
  return [
    'Send welcome email',
    'Request platform access',
    'Schedule kickoff call',
    'Run social media audit',
    'Run review analysis',
    'Set up member survey',
    'Deliver findings document',
  ].map((title, i) => ({
    id: `${prefix}-${i}`,
    title,
    due: dueStr,
    completed: false,
    completedAt: null,
    assignedTo: null,
  }))
}

export function useClients() {
  const [clients, setClients] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : seedClients
    } catch {
      return seedClients
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  }, [clients])

  const addClient = useCallback((data) => {
    const id = `c-${Date.now().toString(36)}`
    const newClient = {
      id,
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      businessType: data.businessType,
      bookingPlatform: data.bookingPlatform,
      package: data.package,
      status: 'Onboarding',
      healthScore: 5,
      monthlyMemberCount: parseInt(data.monthlyMemberCount) || 0,
      startDate: data.startDate,
      lastReportDate: null,
      nextReportDue: null,
      nextQuarterlyReview: null,
      notes: data.notes || '',
      checklist: generateChecklist(),
    }
    setClients(prev => [newClient, ...prev])
    return id
  }, [])

  const updateClient = useCallback((id, changes) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...changes } : c))
    )
  }, [])

  const toggleChecklistItem = useCallback((clientId, itemId) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id !== clientId) return c
        return {
          ...c,
          checklist: c.checklist.map(item => {
            if (item.id !== itemId) return item
            const completed = !item.completed
            return {
              ...item,
              completed,
              completedAt: completed ? new Date().toISOString().split('T')[0] : null,
            }
          }),
        }
      })
    )
  }, [])

  return { clients, addClient, updateClient, toggleChecklistItem }
}
