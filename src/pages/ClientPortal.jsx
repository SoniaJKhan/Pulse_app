import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocialData } from '../hooks/useSocialData'
import { useResearchData } from '../hooks/useResearchData'
import { useReportData } from '../hooks/useReportData'
import { useMessages } from '../hooks/useMessages'
import { useClients } from '../hooks/useClients'
import { PLATFORM_NAME, DEFAULT_AGENCY } from '../config/platform-config'

const TODAY = '2026-04-19'
const CURRENT_MONTH_KEY = '2026-04'
const AGENCY_NAME = DEFAULT_AGENCY.name

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MiniChart({ data, valueKey, color, height = 60 }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d[valueKey])
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const w = 300, h = height, pad = 4
  const points = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2)
    const y = pad + ((max - v) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  const ptArr = points.map(p => p.split(',').map(Number))
  const area = `M${ptArr[0][0]},${h - pad} L${points.join(' L')} L${ptArr[ptArr.length - 1][0]},${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={`cg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#cg-${color.replace('#','')})`}/>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

const MEMBER_TREND = [
  { label: 'Nov', count: 218 }, { label: 'Dec', count: 224 }, { label: 'Jan', count: 231 },
  { label: 'Feb', count: 237 }, { label: 'Mar', count: 241 }, { label: 'Apr', count: 245 },
]

const NAV = ['Dashboard', 'My Content', 'My Results', 'My Reports', 'Messages']

// ── Platform badge ─────────────────────────────────────────────────────────────
const platformColor = (p) => {
  if (p === 'Instagram') return '#E1306C'
  if (p === 'Facebook') return '#1877F2'
  if (p === 'TikTok') return '#000'
  if (p === 'Email') return 'var(--accent)'
  if (p === 'Google Business') return '#4285F4'
  return 'var(--mid-grey)'
}

// ── Dashboard section ──────────────────────────────────────────────────────────
function DashboardSection({ client, content, researchData, reportData, onNavigate }) {
  const rd = researchData.getClient(client.id)
  const latestNPS = [...rd.nps].sort((a, b) => a.quarter.localeCompare(b.quarter)).slice(-1)[0]
  const liveCount = content.filter(c => c.clientId === client.id && c.status === 'Live' && c.scheduledDate?.startsWith(CURRENT_MONTH_KEY.split('-')[0] + '-0' + CURRENT_MONTH_KEY.split('-')[1])).length
  const liveAll = content.filter(c => c.clientId === client.id && (c.status === 'Live' || c.status === 'Approved' || c.status === 'Scheduled')).length
  const awaitingApproval = content.filter(c => c.clientId === client.id && (c.clientApproval === 'Awaiting Review' || c.status === 'Pending Approval'))
  const reports = reportData.getReportsForClient(client.id)
  const latestReport = reports.length ? reports[0] : null

  const npsC = latestNPS?.score >= 50 ? '#4A7C5C' : latestNPS?.score >= 20 ? 'var(--accent)' : 'var(--red)'

  return (
    <div>
      {/* Approval banner */}
      {awaitingApproval.length > 0 && (
        <div style={{ background: 'rgba(196,135,74,0.08)', border: '2px solid rgba(196,135,74,0.35)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(196,135,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>{awaitingApproval.length} item{awaitingApproval.length !== 1 ? 's' : ''} awaiting your approval</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Review and approve content before it goes live</div>
            </div>
          </div>
          <button onClick={() => onNavigate('My Content')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
            Review Now →
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }} data-layout="portal-stats">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Members This Month</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{client.monthlyMemberCount}</div>
          <div style={{ fontSize: 12, color: '#4A7C5C', fontFamily: "'Outfit', sans-serif", marginTop: 6, fontWeight: 600 }}>↑ 4 from last month</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Latest NPS Score</div>
          {latestNPS ? (
            <>
              <div style={{ fontSize: 32, fontWeight: 800, color: npsC, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{latestNPS.score}</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 6 }}>{latestNPS.quarter} · {latestNPS.score >= 50 ? 'Excellent' : latestNPS.score >= 20 ? 'Good' : 'Needs Work'}</div>
            </>
          ) : <div style={{ fontSize: 16, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>No data yet</div>}
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Content Live This Month</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{liveAll}</div>
          <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 6 }}>posts published or approved</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', cursor: latestReport ? 'pointer' : 'default' }}
          onClick={() => latestReport && onNavigate('My Reports')}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Latest Report</div>
          {latestReport ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.3 }}>{latestReport.month}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif", marginTop: 6, fontWeight: 600 }}>View report →</div>
            </>
          ) : <div style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>No reports yet</div>}
        </div>
      </div>

      {/* Quick summary */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>This Month at a Glance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '✓', label: 'Member count trending up — 4th consecutive month of growth', color: '#4A7C5C' },
            { icon: '✓', label: 'NPS at 67 — well above industry benchmark of 45', color: '#4A7C5C' },
            latestNPS && { icon: '↑', label: 'Google review average holding at 4.8 — top decile for wellness studios', color: '#4A7C5C' },
            awaitingApproval.length > 0 && { icon: '!', label: `${awaitingApproval.length} content piece${awaitingApproval.length !== 1 ? 's' : ''} waiting on your approval`, color: 'var(--accent)' },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: item.color, flexShrink: 0, minWidth: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── My Content section ─────────────────────────────────────────────────────────
function MyContentSection({ client, content, onUpdateContent }) {
  const clientContent = content.filter(c => c.clientId === client.id)
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))

  const [feedbackItem, setFeedbackItem] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')

  const handleApprove = (item) => {
    onUpdateContent(item.id, { clientApproval: 'Approved', status: 'Approved' })
  }

  const handleRequestChanges = (item) => {
    if (!feedbackText.trim()) return
    onUpdateContent(item.id, {
      clientApproval: 'Changes Requested',
      status: 'Changes Requested',
      clientFeedback: feedbackText.trim(),
    })
    setFeedbackItem(null)
    setFeedbackText('')
  }

  const statusColor = (s) => {
    if (s === 'Live' || s === 'Approved') return { color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)' }
    if (s === 'Pending Approval' || s === 'Awaiting Review') return { color: 'var(--accent)', bg: 'rgba(196,135,74,0.1)' }
    if (s === 'Changes Requested') return { color: 'var(--red)', bg: 'rgba(196,80,58,0.1)' }
    if (s === 'Scheduled') return { color: '#4A8C8C', bg: 'rgba(74,140,140,0.1)' }
    return { color: 'var(--mid-grey)', bg: 'rgba(138,132,128,0.1)' }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>My Content</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Content created for you this month. Approve or request changes on items marked for your review.</p>
      </div>

      {clientContent.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No content this month yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {clientContent.map(item => {
          const needsApproval = item.clientApproval === 'Awaiting Review' || item.status === 'Pending Approval'
          const ss = statusColor(item.clientApproval === 'Changes Requested' ? 'Changes Requested' : item.status)
          const isFeedbackOpen = feedbackItem === item.id

          return (
            <div key={item.id} style={{ background: 'var(--bg-card)', border: `1.5px solid ${needsApproval ? 'rgba(196,135,74,0.4)' : 'var(--border)'}`, borderRadius: 14, padding: '18px 20px', boxShadow: needsApproval ? '0 0 0 3px rgba(196,135,74,0.08)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                    {item.platforms.map(p => (
                      <span key={p} style={{ fontSize: 11, fontWeight: 700, color: platformColor(p), background: `${platformColor(p)}18`, padding: '2px 8px', borderRadius: 5, fontFamily: "'Outfit', sans-serif" }}>{p}</span>
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{item.contentType}</span>
                    <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{item.scheduledDate}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{item.caption}</p>
                  {item.visualDirection && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>Visual: {item.visualDirection}</p>}
                  {item.clientFeedback && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(196,80,58,0.06)', borderRadius: 8, border: '1px solid rgba(196,80,58,0.2)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', fontFamily: "'Outfit', sans-serif" }}>Your feedback: </span>
                      <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{item.clientFeedback}</span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: ss.bg, color: ss.color, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>
                  {item.clientApproval === 'Changes Requested' ? 'Changes Requested' : item.status}
                </span>
              </div>

              {needsApproval && (
                <div style={{ marginTop: 10 }}>
                  {!isFeedbackOpen ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleApprove(item)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#4A7C5C', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                        Approve
                      </button>
                      <button onClick={() => { setFeedbackItem(item.id); setFeedbackText('') }} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', color: 'var(--mid-grey)', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                        Request Changes
                      </button>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Describe the changes you'd like…"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid var(--accent)', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none', resize: 'vertical', minHeight: 72, marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleRequestChanges(item)} disabled={!feedbackText.trim()} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: feedbackText.trim() ? 'var(--accent)' : 'var(--border)', color: feedbackText.trim() ? '#fff' : 'var(--mid-grey)', cursor: feedbackText.trim() ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                          Submit Feedback
                        </button>
                        <button onClick={() => setFeedbackItem(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', color: 'var(--mid-grey)', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── My Results section ─────────────────────────────────────────────────────────
function MyResultsSection({ client, researchData }) {
  const rd = researchData.getClient(client.id)
  const npsHistory = [...rd.nps].sort((a, b) => a.quarter.localeCompare(b.quarter))
  const reviewAvg = rd.reviews.length ? (rd.reviews.reduce((s, r) => s + r.avgScore, 0) / rd.reviews.length).toFixed(1) : null
  const rtSorted = [...rd.responseTime].sort((a, b) => a.month.localeCompare(b.month))
  const latestRT = rtSorted.slice(-1)[0]

  const npsC = (s) => s >= 50 ? '#4A7C5C' : s >= 20 ? 'var(--accent)' : 'var(--red)'
  const rtC = latestRT ? (latestRT.avgHours <= 2 ? '#4A7C5C' : latestRT.avgHours <= 4 ? 'var(--accent)' : 'var(--red)') : 'var(--mid-grey)'

  const ResultCard = ({ title, children }) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{title}</h3>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>My Results</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>The story your numbers tell. Updated monthly.</p>
      </div>

      {/* Member trend */}
      <ResultCard title="Member Growth">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{MEMBER_TREND[MEMBER_TREND.length - 1].count}</div>
            <div style={{ fontSize: 13, color: '#4A7C5C', fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginTop: 4 }}>↑ 27 members since November</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", textAlign: 'right' }}>6-month trend</div>
        </div>
        <MiniChart data={MEMBER_TREND} valueKey="count" color="#4A7C5C" height={72} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {MEMBER_TREND.map(d => <span key={d.label} style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{d.label}</span>)}
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
          Your studio has grown steadily over the past 6 months with no single month of decline — a strong indicator of healthy retention and consistent acquisition.
        </p>
      </ResultCard>

      {/* NPS history */}
      <ResultCard title="NPS Score History">
        {npsHistory.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: npsC(npsHistory[npsHistory.length - 1].score), fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>
                  {npsHistory[npsHistory.length - 1].score}
                </div>
                <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{npsHistory[npsHistory.length - 1].quarter}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#4A7C5C', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>↑ {npsHistory[npsHistory.length - 1].score - npsHistory[0].score} points since {npsHistory[0].quarter}</div>
                <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Industry avg: 45</div>
              </div>
            </div>
            <MiniChart data={npsHistory} valueKey="score" color="#4A7C5C" height={60} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {npsHistory.map(d => <span key={d.quarter} style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{d.quarter}</span>)}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Your NPS has improved every single quarter. At {npsHistory[npsHistory.length - 1].score}, you're well above industry average and in the top tier of wellness studios. Members love what you do — and they tell their friends.
            </p>
          </>
        ) : <div style={{ color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No NPS data yet.</div>}
      </ResultCard>

      {/* Review averages */}
      <ResultCard title="Review Averages">
        {rd.reviews.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>★ {reviewAvg}</div>
              <div style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>combined average across {rd.reviews.length} platform{rd.reviews.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rd.reviews.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", minWidth: 90 }}>{r.platform}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(r.avgScore / 5) * 100}%`, background: 'var(--accent)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif", minWidth: 36 }}>★ {r.avgScore}</span>
                  <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{r.totalReviews} reviews</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Across all platforms your average rating is {reviewAvg}/5 — placing you in the top 10% of wellness businesses in your region. New reviews are coming in consistently each month.
            </p>
          </>
        ) : <div style={{ color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No review data yet.</div>}
      </ResultCard>

      {/* Response time */}
      {latestRT && (
        <ResultCard title="Our Response Time to You">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: rtC, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{latestRT.avgHours}h</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>average ({latestRT.month})</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: rtC, fontFamily: "'Outfit', sans-serif" }}>
                {latestRT.avgHours <= 2 ? 'Below industry benchmark — excellent' : `${(latestRT.avgHours - 2).toFixed(1)}h above benchmark`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Industry benchmark: 2 hours</div>
            </div>
          </div>
          {rtSorted.length >= 2 && (
            <>
              <MiniChart data={rtSorted} valueKey="avgHours" color={rtC} height={50} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {rtSorted.map(d => <span key={d.month} style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{d.month.slice(0, 3)}</span>)}
              </div>
            </>
          )}
          <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            We respond to your messages and queries within {latestRT.avgHours} hours on average — and that time is trending down each month.
          </p>
        </ResultCard>
      )}
    </div>
  )
}

// ── My Reports section ─────────────────────────────────────────────────────────
function MyReportsSection({ client, reportData }) {
  const [viewingReport, setViewingReport] = useState(null)
  const reports = reportData.getReportsForClient(client.id)

  if (viewingReport) {
    const { snapshot, manual, month } = viewingReport
    const npsC = (s) => s >= 50 ? '#4A7C5C' : s >= 20 ? 'var(--accent)' : 'var(--red)'
    const signed = (v) => v === null ? null : v > 0 ? `+${v}` : `${v}`

    return (
      <div>
        <button onClick={() => setViewingReport(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)', marginBottom: 24 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Reports
        </button>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 36px', maxWidth: 720 }}>
          <div style={{ borderBottom: '2px solid var(--accent)', paddingBottom: 18, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{AGENCY_NAME}</div>
            <h1 style={{ fontSize: 22, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)', margin: '0 0 4px' }}>{client.businessName}</h1>
            <div style={{ fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{month} — Monthly Report</div>
          </div>

          {manual.executiveSummary && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Executive Summary</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'pre-wrap', margin: 0 }}>{manual.executiveSummary}</p>
            </div>
          )}

          {snapshot.social && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 10, borderTop: '1px solid var(--border)', paddingTop: 18 }}>Social Media Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                {[['Followers', snapshot.social.followerCount?.toLocaleString(), signed(snapshot.social.followerDelta)],
                  ['Reach', snapshot.social.reach?.toLocaleString(), null],
                  ['Engagement', `${snapshot.social.engagementRate}%`, null],
                  ['Content', snapshot.social.contentPieces, null]].map(([l, v, d]) => (
                  <div key={l} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif" }}>{v}</div>
                    {d && <div style={{ fontSize: 11, color: d.startsWith('+') ? '#4A7C5C' : 'var(--red)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{d} MoM</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {snapshot.research.npsScore !== null && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 10, borderTop: '1px solid var(--border)', paddingTop: 18 }}>Research Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: snapshot.research.findingsText ? 12 : 0 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>NPS Score</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: npsC(snapshot.research.npsScore), fontFamily: "'Libre Baskerville', serif" }}>{snapshot.research.npsScore}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Survey Avg</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Libre Baskerville', serif" }}>{snapshot.research.surveyAvg}/10</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Review Avg</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Libre Baskerville', serif" }}>★ {snapshot.research.reviewAvg}</div>
                </div>
              </div>
              {snapshot.research.findingsText && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>{snapshot.research.findingsText}</p>}
            </div>
          )}

          {[['Wins This Month', manual.wins], ['Areas to Improve', manual.areasToImprove], ['Next Month Priorities', manual.nextPriorities]].map(([title, content]) => content && (
            <div key={title} style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", whiteSpace: 'pre-wrap', margin: 0 }}>{content}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>My Reports</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Your monthly performance reports, prepared by the agency.</p>
      </div>

      {reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No reports generated yet — your first report is coming soon.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reports.map(r => (
          <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
            onClick={() => setViewingReport(r)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{r.month} Report</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 3 }}>Prepared by {AGENCY_NAME} · {formatDate(r.createdAt.slice(0, 10))}</div>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent)', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              View <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Messages section ───────────────────────────────────────────────────────────
function MessagesSection({ client, messages }) {
  const thread = messages.getThreadForClient(client.id)
  const [text, setText] = useState('')

  useEffect(() => {
    messages.markClientThreadRead(client.id)
  }, [client.id])

  const handleSend = () => {
    if (!text.trim()) return
    messages.sendMessage(client.id, 'client', client.ownerName || 'Client', text.trim())
    setText('')
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Messages</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Your conversation with {AGENCY_NAME}.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {thread.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No messages yet. Say hello!</div>
          )}
          {thread.map(msg => {
            const isClient = msg.sender === 'client'
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isClient ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexDirection: isClient ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isClient ? 'var(--accent)' : '#4A7C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                    {msg.senderName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{msg.senderName} · {formatTime(msg.timestamp)}</span>
                </div>
                <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: 12, background: isClient ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${isClient ? 'transparent' : 'var(--border)'}`, borderBottomRightRadius: isClient ? 4 : 12, borderBottomLeftRadius: isClient ? 12 : 4 }}>
                  <p style={{ margin: 0, fontSize: 13, color: isClient ? '#fff' : 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{msg.content}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message… (Enter to send)"
            style={{ flex: 1, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none', resize: 'none', minHeight: 44, maxHeight: 120 }}
          />
          <button onClick={handleSend} disabled={!text.trim()} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: text.trim() ? 'var(--accent)' : 'var(--border)', color: text.trim() ? '#fff' : 'var(--mid-grey)', cursor: text.trim() ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ClientPortal ──────────────────────────────────────────────────────────
export default function ClientPortal() {
  const { user, logout } = useAuth()
  const { clients } = useClients()
  const { content, updateContent } = useSocialData()
  const researchData = useResearchData()
  const reportData = useReportData()
  const messages = useMessages()
  const [activeTab, setActiveTab] = useState('Dashboard')

  const clientId = user?.clientId || 'c1'
  const client = clients.find(c => c.id === clientId) || { id: clientId, businessName: 'Your Business', ownerName: user?.name || 'Client', monthlyMemberCount: 0 }

  const unread = messages.getUnreadCountForClient(clientId)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--accent)', color: '#fff', fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {PLATFORM_NAME[0]}
          </div>
          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: 'var(--dark)' }}>{PLATFORM_NAME}</span>
          <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>· Client Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{client.businessName}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--mid-grey)', fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Nav */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0 28px', display: 'flex', overflowX: 'auto' }}>
        {NAV.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ position: 'relative', padding: '13px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', background: 'transparent', color: activeTab === tab ? 'var(--accent)' : 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: '-1px', whiteSpace: 'nowrap' }}>
            {tab}
            {tab === 'Messages' && unread > 0 && (
              <span style={{ position: 'absolute', top: 10, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        {activeTab === 'Dashboard' && <DashboardSection client={client} content={content} researchData={researchData} reportData={reportData} onNavigate={setActiveTab} />}
        {activeTab === 'My Content' && <MyContentSection client={client} content={content} onUpdateContent={updateContent} />}
        {activeTab === 'My Results' && <MyResultsSection client={client} researchData={researchData} />}
        {activeTab === 'My Reports' && <MyReportsSection client={client} reportData={reportData} />}
        {activeTab === 'Messages' && <MessagesSection client={client} messages={messages} />}
      </main>
    </div>
  )
}
