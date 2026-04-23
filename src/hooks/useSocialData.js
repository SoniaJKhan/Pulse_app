import { useState } from 'react'
import { seedContent, seedMetrics, seedCompetitors } from '../data/mockSocialData'

const KEY = 'pulse_social_v1'

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

function init() {
  const stored = load()
  if (stored) return stored
  const initial = { content: seedContent, metrics: seedMetrics, competitors: seedCompetitors }
  persist(initial)
  return initial
}

export function useSocialData() {
  const [data, setData] = useState(init)

  const update = (next) => { setData(next); persist(next) }

  const addContent = (item) =>
    update({ ...data, content: [...data.content, { id: `sc${Date.now()}`, ...item }] })

  const updateContent = (id, changes) =>
    update({ ...data, content: data.content.map(c => c.id === id ? { ...c, ...changes } : c) })

  const deleteContent = (id) =>
    update({ ...data, content: data.content.filter(c => c.id !== id) })

  const upsertMetrics = (entry) => {
    const existing = data.metrics.find(m => m.clientId === entry.clientId && m.month === entry.month)
    if (existing) {
      update({ ...data, metrics: data.metrics.map(m => m.id === existing.id ? { ...existing, ...entry } : m) })
    } else {
      update({ ...data, metrics: [...data.metrics, { id: `sm${Date.now()}`, ...entry }] })
    }
  }

  const addCompetitor = (comp) =>
    update({ ...data, competitors: [...data.competitors, { id: `comp${Date.now()}`, ...comp }] })

  const updateCompetitor = (id, changes) =>
    update({ ...data, competitors: data.competitors.map(c => c.id === id ? { ...c, ...changes } : c) })

  const deleteCompetitor = (id) =>
    update({ ...data, competitors: data.competitors.filter(c => c.id !== id) })

  return {
    content: data.content,
    metrics: data.metrics,
    competitors: data.competitors,
    addContent,
    updateContent,
    deleteContent,
    upsertMetrics,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
  }
}
