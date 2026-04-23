import React, { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { useWebsiteData } from '../hooks/useWebsiteData'

const TODAY = '2026-04-18'

function statusStyle(s) {
  if (s === 'Planning') return { color: '#4A8C8C', bg: 'rgba(74,140,140,0.1)', border: 'rgba(74,140,140,0.25)' }
  if (s === 'In Progress') return { color: 'var(--accent)', bg: 'rgba(196,135,74,0.1)', border: 'rgba(196,135,74,0.25)' }
  if (s === 'In Review') return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' }
  if (s === 'Live') return { color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)', border: 'rgba(74,124,92,0.25)' }
  if (s === 'Maintenance') return { color: 'var(--mid-grey)', bg: 'rgba(138,132,128,0.1)', border: 'rgba(138,132,128,0.25)' }
  return { color: 'var(--mid-grey)', bg: 'var(--bg)', border: 'var(--border)' }
}

function completionPct(phases) {
  if (!phases || !phases.length) return 0
  return Math.round((phases.filter(p => p.status === 'Complete').length / phases.length) * 100)
}

function currentPhase(phases) {
  if (!phases || !phases.length) return '—'
  const ip = phases.find(p => p.status === 'In Progress')
  if (ip) return ip.name
  if (phases.every(p => p.status === 'Complete')) return 'Post-Launch'
  const ns = phases.find(p => p.status === 'Not Started')
  return ns ? `${ns.name} (upcoming)` : '—'
}

function daysToLaunch(targetDate, actualLaunchDate) {
  if (actualLaunchDate) return null
  if (!targetDate) return null
  return Math.ceil((new Date(targetDate) - new Date(TODAY)) / 86400000)
}

export default function WebsiteProjectsPage({ onGoToClientWebsite }) {
  const { clients } = useClients()
  const { getClient } = useWebsiteData()
  const [search, setSearch] = useState('')

  const activeClients = clients.filter(c => c.status !== 'Churned')
  const projectClients = activeClients.filter(c => {
    const wd = getClient(c.id)
    return !!wd.project
  }).filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  const allProjects = activeClients.filter(c => getClient(c.id).project)
  const inProgress = allProjects.filter(c => {
    const s = getClient(c.id).project?.status
    return s === 'In Progress' || s === 'In Review'
  }).length
  const overdueCount = allProjects.filter(c => {
    const wd = getClient(c.id)
    const d = daysToLaunch(wd.project?.targetLaunchDate, wd.project?.actualLaunchDate)
    return d !== null && d < 0
  }).length

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Website Projects</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
          All active website projects and their build progress
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }} data-layout="stat-grid">
        {[
          { label: 'Total Projects', value: allProjects.length },
          { label: 'In Progress', value: inProgress },
          { label: 'Live / Maintenance', value: allProjects.filter(c => ['Live','Maintenance'].includes(getClient(c.id).project?.status)).length },
          { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'var(--red)' : 'var(--dark)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color || 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
          style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, fontFamily: "'Outfit', sans-serif", background: 'var(--bg-card)', color: 'var(--dark)', outline: 'none', width: 280, boxSizing: 'border-box' }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 2fr 1.2fr 1fr 1fr 1fr', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg)', padding: '10px 20px' }}>
          {['Client', 'Project', 'Status', 'Phase', 'Complete', 'Launch'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>{h}</span>
          ))}
        </div>

        {projectClients.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            No website projects found.
          </div>
        )}

        {projectClients.map((client, i) => {
          const wd = getClient(client.id)
          const proj = wd.project
          const pct = completionPct(wd.phases)
          const phase = currentPhase(wd.phases)
          const days = daysToLaunch(proj.targetLaunchDate, proj.actualLaunchDate)
          const isOverdue = days !== null && days < 0
          const ss = statusStyle(proj.status)
          const isLast = i === projectClients.length - 1

          return (
            <div key={client.id}
              onClick={() => onGoToClientWebsite(client.id)}
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 2fr 1.2fr 1fr 1fr 1fr', gap: 0, padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid var(--border)', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{client.businessName}</div>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{client.ownerName}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", paddingRight: 8 }}>{proj.name}</div>
              <div>
                <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{proj.status}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{phase}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', minWidth: 40 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#4A7C5C' : 'var(--accent)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif' " }}>{pct}%</span>
                </div>
              </div>
              <div>
                {proj.actualLaunchDate ? (
                  <span style={{ fontSize: 11, color: '#4A7C5C', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Launched {proj.actualLaunchDate}</span>
                ) : days !== null ? (
                  <span style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? 'var(--red)' : days <= 7 ? 'var(--accent)' : 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>
                    {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                  </span>
                ) : <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>—</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
