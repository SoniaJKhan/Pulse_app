import { useState } from 'react'
import { seedWebsite } from '../data/mockWebsiteData'

const KEY = 'pulse_website_v1'

const EMPTY_CLIENT = {
  project: null,
  phases: [],
  feedback: [],
  checklist: [],
}

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

export function useWebsiteData() {
  const [data, setData] = useState(() => load() ?? seedWebsite)

  const save = (next) => { setData(next); persist(next) }

  const getClient = (clientId) => data[clientId] || EMPTY_CLIENT

  const setClientData = (clientId, updater) => {
    const current = getClient(clientId)
    save({ ...data, [clientId]: { ...current, ...updater(current) } })
  }

  // Project
  const upsertProject = (clientId, project) =>
    setClientData(clientId, c => ({ project: { ...c.project, ...project } }))

  const createProject = (clientId, project) => {
    const phases = ['Discovery', 'Design', 'Development', 'Client Review', 'Launch', 'Post-Launch'].map((name, i) => ({
      id: `ph-${clientId}-${i + 1}`, name, status: 'Not Started', startDate: '', completionDate: '', tasks: [],
    }))
    const checklist = [
      { id: 'cl-1', item: 'Page Speed Test', type: 'score', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-2', item: 'Mobile Responsiveness', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-3', item: 'Booking Integration', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-4', item: 'Contact Form', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-5', item: 'SSL Certificate Active', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-6', item: 'Google Analytics Connected', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
      { id: 'cl-7', item: 'SEO Basics Complete', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
    ]
    save({ ...data, [clientId]: { project: { id: `wp-${clientId}-${Date.now()}`, ...project }, phases, feedback: [], checklist } })
  }

  // Phases
  const updatePhase = (clientId, phaseId, changes) =>
    setClientData(clientId, c => ({ phases: c.phases.map(p => p.id === phaseId ? { ...p, ...changes } : p) }))

  // Tasks within phase
  const addTask = (clientId, phaseId, task) =>
    setClientData(clientId, c => ({
      phases: c.phases.map(p => p.id === phaseId
        ? { ...p, tasks: [...p.tasks, { id: `t-${Date.now()}`, ...task }] }
        : p)
    }))

  const updateTask = (clientId, phaseId, taskId, changes) =>
    setClientData(clientId, c => ({
      phases: c.phases.map(p => p.id === phaseId
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...changes } : t) }
        : p)
    }))

  const deleteTask = (clientId, phaseId, taskId) =>
    setClientData(clientId, c => ({
      phases: c.phases.map(p => p.id === phaseId
        ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
        : p)
    }))

  // Feedback
  const addFeedback = (clientId, fb) =>
    setClientData(clientId, c => ({ feedback: [...c.feedback, { id: `fb-${Date.now()}`, ...fb }] }))

  const updateFeedback = (clientId, id, changes) =>
    setClientData(clientId, c => ({ feedback: c.feedback.map(f => f.id === id ? { ...f, ...changes } : f) }))

  const deleteFeedback = (clientId, id) =>
    setClientData(clientId, c => ({ feedback: c.feedback.filter(f => f.id !== id) }))

  // Checklist
  const updateChecklistItem = (clientId, itemId, changes) =>
    setClientData(clientId, c => ({ checklist: c.checklist.map(i => i.id === itemId ? { ...i, ...changes } : i) }))

  return {
    getClient,
    upsertProject, createProject,
    updatePhase,
    addTask, updateTask, deleteTask,
    addFeedback, updateFeedback, deleteFeedback,
    updateChecklistItem,
  }
}
