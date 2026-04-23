import { useState } from 'react'

const KEY = 'pulse_reports_v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function persist(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function useReportData() {
  const [data, setData] = useState(() => load())

  const save = (next) => { setData(next); persist(next) }

  const getReportsForClient = (clientId) => data[clientId] || []

  const saveReport = (clientId, report) => {
    const existing = data[clientId] || []
    const idx = existing.findIndex(r => r.id === report.id)
    const updated = idx >= 0
      ? existing.map(r => r.id === report.id ? report : r)
      : [report, ...existing]
    save({ ...data, [clientId]: updated })
  }

  const deleteReport = (clientId, reportId) => {
    const existing = data[clientId] || []
    save({ ...data, [clientId]: existing.filter(r => r.id !== reportId) })
  }

  const getAllLatestReports = () => {
    return Object.entries(data).map(([clientId, reports]) => {
      const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return { clientId, latest: sorted[0] || null }
    }).filter(e => e.latest)
  }

  return { getReportsForClient, saveReport, deleteReport, getAllLatestReports }
}
