import React, { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { useResearchData } from '../hooks/useResearchData'

function npsZone(score) {
  if (score === null || score === undefined) return { label: 'No data', color: 'var(--mid-grey)', bg: 'var(--bg)', border: 'var(--border)' }
  if (score >= 50) return { label: 'Excellent', color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)', border: 'rgba(74,124,92,0.25)' }
  if (score >= 20) return { label: 'Good', color: '#C4874A', bg: 'rgba(196,135,74,0.1)', border: 'rgba(196,135,74,0.25)' }
  return { label: 'Needs Work', color: '#C4503A', bg: 'rgba(196,80,58,0.1)', border: 'rgba(196,80,58,0.25)' }
}

function reviewHealth(avg) {
  if (!avg) return null
  if (avg >= 4.5) return '#4A7C5C'
  if (avg >= 4.0) return '#C4874A'
  return '#C4503A'
}

function researchHealth(npsScore, reviewAvg) {
  let score = 0
  if (npsScore !== null) score += npsScore >= 50 ? 2 : npsScore >= 20 ? 1 : 0
  if (reviewAvg !== null) score += reviewAvg >= 4.5 ? 2 : reviewAvg >= 4.0 ? 1 : 0
  if (score >= 3) return { label: 'Strong', color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)' }
  if (score >= 1) return { label: 'Developing', color: '#C4874A', bg: 'rgba(196,135,74,0.1)' }
  return { label: 'Needs Attention', color: '#C4503A', bg: 'rgba(196,80,58,0.1)' }
}

export default function ResearchPage({ onGoToClientResearch }) {
  const { clients } = useClients()
  const { getClient } = useResearchData()
  const [search, setSearch] = useState('')

  const activeClients = clients.filter(c => c.status !== 'Churned')
  const filtered = activeClients.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  const getStats = (clientId) => {
    const data = getClient(clientId)
    const sortedNPS = [...data.nps].sort((a, b) => a.quarter.localeCompare(b.quarter))
    const latestNPS = sortedNPS[sortedNPS.length - 1]
    const npsScore = latestNPS ? latestNPS.score : null
    const npsQuarter = latestNPS ? latestNPS.quarter : null

    const sortedSurveys = [...data.surveys].sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent))
    const lastSurvey = sortedSurveys[0]
    const lastSurveyDate = lastSurvey ? lastSurvey.dateSent : null

    const reviewAvg = data.reviews.length
      ? parseFloat((data.reviews.reduce((s, r) => s + r.avgScore, 0) / data.reviews.length).toFixed(1))
      : null

    const health = researchHealth(npsScore, reviewAvg)
    return { npsScore, npsQuarter, lastSurveyDate, reviewAvg, health }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Research</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
          NPS scores, survey activity, and review performance across all clients
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }} data-layout="stat-grid">
        {[
          { label: 'Total Clients', value: activeClients.length },
          { label: 'Avg NPS ≥50', value: activeClients.filter(c => { const s = getStats(c.id); return s.npsScore !== null && s.npsScore >= 50 }).length },
          { label: 'Review Avg ≥4.5', value: activeClients.filter(c => { const s = getStats(c.id); return s.reviewAvg !== null && s.reviewAvg >= 4.5 }).length },
          { label: 'Research Healthy', value: activeClients.filter(c => getStats(c.id).health.label === 'Strong').length },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients…"
          style={{
            padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
            fontSize: 13, fontFamily: "'Outfit', sans-serif", background: 'var(--bg-card)',
            color: 'var(--dark)', outline: 'none', width: 280, boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg)', padding: '10px 20px' }}>
          {['Client', 'Latest NPS', 'NPS Quarter', 'Last Survey', 'Review Avg', 'Health'].slice(0,5).map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No clients found.</div>
        )}

        {filtered.map((client, i) => {
          const stats = getStats(client.id)
          const nc = npsZone(stats.npsScore)
          const rh = reviewHealth(stats.reviewAvg)
          const isLast = i === filtered.length - 1

          return (
            <div
              key={client.id}
              onClick={() => onGoToClientResearch(client.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: 0,
                padding: '14px 20px',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Client */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{client.businessName}</div>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{client.ownerName}</div>
              </div>

              {/* NPS Score */}
              <div>
                {stats.npsScore !== null ? (
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, background: nc.bg, border: `1px solid ${nc.border}`, fontSize: 13, fontWeight: 700, color: nc.color, fontFamily: "'Outfit', sans-serif" }}>
                    {stats.npsScore}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>No data</span>
                )}
              </div>

              {/* NPS Quarter */}
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {stats.npsQuarter || '—'}
              </div>

              {/* Last Survey */}
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                {stats.lastSurveyDate || '—'}
              </div>

              {/* Review Avg */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {stats.reviewAvg !== null ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={rh}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: rh, fontFamily: "'Outfit', sans-serif" }}>{stats.reviewAvg}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontStyle: 'italic', fontFamily: "'Outfit', sans-serif" }}>No data</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Health legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Strong', color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)' },
          { label: 'Developing', color: '#C4874A', bg: 'rgba(196,135,74,0.1)' },
          { label: 'Needs Attention', color: '#C4503A', bg: 'rgba(196,80,58,0.1)' },
        ].map(z => (
          <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color }} />
            <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{z.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>· NPS ≥50 = Excellent · 20–49 = Good · &lt;20 = Needs Work</span>
      </div>
    </div>
  )
}
