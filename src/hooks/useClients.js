import { useState, useEffect } from 'react'

const KEY = 'pulse_clients_v2'

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

function loadAndMigrate() {
  try {
    const v2 = JSON.parse(localStorage.getItem(KEY) || '[]')
    const v1 = JSON.parse(localStorage.getItem('pulse_clients') || '[]')
    if (v1.length > 0) {
      const merged = [...v2]
      v1.forEach(c => { if (!merged.find(m => m.id === c.id)) merged.push(c) })
      localStorage.setItem(KEY, JSON.stringify(merged))
      localStorage.removeItem('pulse_clients')
      return merged
    }
    return v2
  } catch { return [] }
}

export function useClients() {
  const [clients, setClients] = useState(() => loadAndMigrate())

  const saveClient = (client) => {
    try {
      const existing = JSON.parse(localStorage.getItem(KEY) || '[]')
      const index = existing.findIndex(c => c.id === client.id)
      if (index > -1) {
        existing[index] = client
      } else {
        existing.push(client)
      }
      localStorage.setItem(KEY, JSON.stringify(existing))
      setClients([...existing])
      window.dispatchEvent(new Event('pulse_clients_updated'))
    } catch (e) {
      console.error('saveClient failed', e)
    }
  }

  const deleteClient = (id) => {
    try {
      const updated = clients.filter(c => c.id !== id)
      localStorage.setItem(KEY, JSON.stringify(updated))
      setClients(updated)
      window.dispatchEvent(new Event('pulse_clients_updated'))
    } catch (e) {
      console.error('deleteClient failed', e)
    }
  }

  useEffect(() => {
    const sync = () => {
      try {
        setClients(JSON.parse(localStorage.getItem(KEY) || '[]'))
      } catch {}
    }
    window.addEventListener('pulse_clients_updated', sync)
    return () => window.removeEventListener('pulse_clients_updated', sync)
  }, [])

  return { clients, saveClient, deleteClient }
}
