import { useState } from 'react'
import { seedVATasks } from '../data/mockVAData'

const KEY = 'pulse_va_tasks_v1'

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

export function useVATasks() {
  const [tasks, setTasks] = useState(() => load() ?? seedVATasks)

  const save = (next) => { setTasks(next); persist(next) }

  const addTask = (task) =>
    save([...tasks, { id: `va${Date.now()}`, ...task }])

  const updateTask = (id, changes) =>
    save(tasks.map(t => t.id === id ? { ...t, ...changes } : t))

  const deleteTask = (id) =>
    save(tasks.filter(t => t.id !== id))

  return { tasks, addTask, updateTask, deleteTask }
}
