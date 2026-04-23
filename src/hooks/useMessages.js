import { useState } from 'react'

const KEY = 'pulse_messages_v1'

const seedMessages = [
  { id: 'm1', clientId: 'c1', sender: 'agency', senderName: 'Sonia', timestamp: '2026-04-15T09:00:00.000Z', content: 'Hi Sarah! Just wanted to let you know we\'ve published the morning yoga reel — it\'s already getting great engagement. We\'ll share full analytics in your monthly report.', read: true },
  { id: 'm2', clientId: 'c1', sender: 'client', senderName: 'Sarah Mitchell', timestamp: '2026-04-15T10:30:00.000Z', content: 'Amazing, thank you! I noticed the pricing page post is still sitting as a draft — are we on track to get that scheduled before end of April?', read: true },
  { id: 'm3', clientId: 'c1', sender: 'agency', senderName: 'Jehangir', timestamp: '2026-04-16T08:15:00.000Z', content: 'Yes absolutely — the pricing page content is queued for the 22nd. We\'ve also got the new instructor introduction going out on the 21st. Everything\'s on schedule.', read: true },
  { id: 'm4', clientId: 'c1', sender: 'client', senderName: 'Sarah Mitchell', timestamp: '2026-04-17T14:20:00.000Z', content: 'Perfect! Could we also add something about the Sound Bath Sunday event on the 27th? Would be great to give it social promotion this week.', read: false },
]

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function persist(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function useMessages() {
  const [messages, setMessages] = useState(() => load() ?? seedMessages)

  const save = (next) => { setMessages(next); persist(next) }

  const getThreadForClient = (clientId) =>
    [...messages].filter(m => m.clientId === clientId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const getUnreadCountForClient = (clientId) =>
    messages.filter(m => m.clientId === clientId && m.sender === 'client' && !m.read).length

  const getTotalUnreadFromClients = () =>
    messages.filter(m => m.sender === 'client' && !m.read).length

  const getAllClientIds = () => [...new Set(messages.map(m => m.clientId))]

  const sendMessage = (clientId, sender, senderName, content) => {
    const msg = { id: `msg-${Date.now()}`, clientId, sender, senderName, timestamp: new Date().toISOString(), content, read: sender === 'agency' }
    save([...messages, msg])
  }

  const markClientThreadRead = (clientId) => {
    save(messages.map(m => m.clientId === clientId && m.sender === 'client' ? { ...m, read: true } : m))
  }

  return { getThreadForClient, getUnreadCountForClient, getTotalUnreadFromClients, getAllClientIds, sendMessage, markClientThreadRead }
}
