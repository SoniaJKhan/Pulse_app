import { useState, useEffect } from 'react'

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
      return JSON.parse(localStorage.getItem('pulse_clients')) || []
    } catch { return [] }
  })

  const saveClient = (client) => {
    const existing = JSON.parse(localStorage.getItem('pulse_clients')) || []
    const index = existing.findIndex(c => c.id === client.id)
    if (index > -1) {
      existing[index] = client
    } else {
      existing.push(client)
    }
    localStorage.setItem('pulse_clients', JSON.stringify(existing))
    setClients([...existing])
    window.dispatchEvent(new Event('pulse_clients_updated'))
  }

  const deleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id)
    localStorage.setItem('pulse_clients', JSON.stringify(updated))
    setClients(updated)
    window.dispatchEvent(new Event('pulse_clients_updated'))
  }

  useEffect(() => {
    const sync = () => {
      try {
        setClients(JSON.parse(localStorage.getItem('pulse_clients')) || [])
      } catch {}
    }
    window.addEventListener('pulse_clients_updated', sync)
    return () => window.removeEventListener('pulse_clients_updated', sync)
  }, [])

  return { clients, saveClient, deleteClient }
}
