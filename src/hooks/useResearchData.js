import { useState } from 'react'
import { seedResearch } from '../data/mockResearchData'

const KEY = 'pulse_research_v1'

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

export function useResearchData() {
  const [data, setData] = useState(() => load() ?? seedResearch)

  const save = (next) => { setData(next); persist(next) }

  const getClient = (clientId) => data[clientId] || { surveys: [], nps: [], reviews: [], competitors: [], responseTime: [], findings: [] }

  const updateClientSection = (clientId, section, items) => {
    save({ ...data, [clientId]: { ...getClient(clientId), [section]: items } })
  }

  // Surveys
  const addSurvey = (clientId, survey) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'surveys', [...c.surveys, { id: `sv${Date.now()}`, ...survey }])
  }
  const updateSurvey = (clientId, id, changes) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'surveys', c.surveys.map(s => s.id === id ? { ...s, ...changes } : s))
  }
  const deleteSurvey = (clientId, id) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'surveys', c.surveys.filter(s => s.id !== id))
  }

  // NPS
  const addNPS = (clientId, entry) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'nps', [...c.nps, { id: `nps${Date.now()}`, ...entry }])
  }
  const updateNPS = (clientId, id, changes) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'nps', c.nps.map(n => n.id === id ? { ...n, ...changes } : n))
  }
  const deleteNPS = (clientId, id) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'nps', c.nps.filter(n => n.id !== id))
  }

  // Reviews
  const addReview = (clientId, review) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'reviews', [...c.reviews, { id: `rv${Date.now()}`, ...review }])
  }
  const updateReview = (clientId, id, changes) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'reviews', c.reviews.map(r => r.id === id ? { ...r, ...changes } : r))
  }
  const deleteReview = (clientId, id) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'reviews', c.reviews.filter(r => r.id !== id))
  }

  // Competitors
  const addCompetitorR = (clientId, comp) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'competitors', [...c.competitors, { id: `rc${Date.now()}`, ...comp }])
  }
  const updateCompetitorR = (clientId, id, changes) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'competitors', c.competitors.map(c2 => c2.id === id ? { ...c2, ...changes } : c2))
  }
  const deleteCompetitorR = (clientId, id) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'competitors', c.competitors.filter(c2 => c2.id !== id))
  }

  // Response Time
  const addResponseTime = (clientId, entry) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'responseTime', [...c.responseTime, { id: `rt${Date.now()}`, ...entry }])
  }
  const updateResponseTime = (clientId, id, changes) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'responseTime', c.responseTime.map(r => r.id === id ? { ...r, ...changes } : r))
  }
  const deleteResponseTime = (clientId, id) => {
    const c = getClient(clientId)
    updateClientSection(clientId, 'responseTime', c.responseTime.filter(r => r.id !== id))
  }

  // Findings
  const upsertFindings = (clientId, month, text) => {
    const c = getClient(clientId)
    const existing = c.findings.find(f => f.month === month)
    if (existing) {
      updateClientSection(clientId, 'findings', c.findings.map(f => f.month === month ? { ...f, text } : f))
    } else {
      updateClientSection(clientId, 'findings', [...c.findings, { id: `fn${Date.now()}`, month, text }])
    }
  }

  return {
    getClient,
    addSurvey, updateSurvey, deleteSurvey,
    addNPS, updateNPS, deleteNPS,
    addReview, updateReview, deleteReview,
    addCompetitorR, updateCompetitorR, deleteCompetitorR,
    addResponseTime, updateResponseTime, deleteResponseTime,
    upsertFindings,
  }
}
