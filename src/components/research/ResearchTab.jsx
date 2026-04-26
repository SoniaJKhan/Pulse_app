import React, { useState } from 'react'
import { useResearchData } from '../../hooks/useResearchData'
import { useVATasks } from '../../hooks/useVATasks'
import ClientIntelligence from './ClientIntelligence'

const SURVEY_TYPES = ['Post-Class Pulse', 'Quarterly NPS', 'Exit Survey', 'Ad Hoc']
const BENCHMARK_HOURS = 2

const SUB_TABS = ['Member Surveys', 'NPS Tracker', 'Review Analysis', 'Competitor Intelligence', 'Response Time', 'Findings', 'Client Intelligence']

function npsColor(score) {
  if (score >= 50) return { color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)', border: 'rgba(74,124,92,0.25)', label: 'Excellent' }
  if (score >= 20) return { color: '#C4874A', bg: 'rgba(196,135,74,0.1)', border: 'rgba(196,135,74,0.25)', label: 'Good' }
  return { color: '#C4503A', bg: 'rgba(196,80,58,0.1)', border: 'rgba(196,80,58,0.25)', label: 'Needs Work' }
}

function TrendChart({ data, valueKey, color = '#4A8C8C', labelKey = 'quarter', minVal, maxVal }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid-grey)', fontSize: 12 }}>
      Add more entries to see trend
    </div>
  )
  const vals = data.map(d => d[valueKey])
  const min = minVal !== undefined ? minVal : Math.min(...vals) - 5
  const max = maxVal !== undefined ? maxVal : Math.max(...vals) + 5
  const w = 400, h = 80
  const pad = { l: 4, r: 4, t: 8, b: 4 }
  const points = vals.map((v, i) => {
    const x = pad.l + (i / (vals.length - 1)) * (w - pad.l - pad.r)
    const y = pad.t + ((max - v) / (max - min)) * (h - pad.t - pad.b)
    return `${x},${y}`
  })
  const ptArr = points.map(p => p.split(',').map(Number))
  const areaPath = `M${ptArr[0][0]},${h - pad.b} L${points.join(' L')} L${ptArr[ptArr.length - 1][0]},${h - pad.b} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`}/>
        <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
            {d[labelKey]}
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ title, onAdd, addLabel = '+ Add' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{title}</h3>
      {onAdd && (
        <button onClick={onAdd} style={{
          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
          padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif",
        }}>{addLabel}</button>
      )}
    </div>
  )
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid-grey)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif" }}>{label}</label>
      {children}
    </div>
  )
}

const inp = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13,
  fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)',
  outline: 'none',
}

const ta = { ...inp, resize: 'vertical', minHeight: 72 }

function FormActions({ onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
      <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
      <button onClick={onSave} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save</button>
    </div>
  )
}

// ─── Member Surveys ────────────────────────────────────────────────────────────
function SurveysSection({ clientId, surveys, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { name: '', type: SURVEY_TYPES[0], dateSent: '', numSent: '', numResponses: '', avgScore: '', keyThemes: '' }
  const [form, setForm] = useState(empty)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const responseRate = form.numSent && form.numResponses ? Math.round((form.numResponses / form.numSent) * 100) : null

  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (s) => { setForm({ ...s, numSent: String(s.numSent), numResponses: String(s.numResponses), avgScore: String(s.avgScore) }); setEditId(s.id); setShowForm(true) }

  const handleSave = () => {
    if (!form.name.trim() || !form.dateSent) return
    const payload = { ...form, numSent: Number(form.numSent) || 0, numResponses: Number(form.numResponses) || 0, avgScore: parseFloat(form.avgScore) || 0 }
    if (editId) onUpdate(editId, payload)
    else onAdd(payload)
    setShowForm(false)
  }

  const sortedSurveys = [...surveys].sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent))

  return (
    <div>
      <SectionHeader title="Member Surveys" onAdd={openAdd} />

      {sortedSurveys.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--mid-grey)', margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>Avg score trend</p>
          <TrendChart
            data={[...surveys].sort((a, b) => new Date(a.dateSent) - new Date(b.dateSent))}
            valueKey="avgScore"
            labelKey="name"
            color="#4A8C8C"
            minVal={0}
            maxVal={10}
          />
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Survey' : 'Add Survey'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Survey Name"><input style={inp} value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Quarterly NPS — Q1 2026" /></FormRow>
            <FormRow label="Type">
              <select style={inp} value={form.type} onChange={e => f('type', e.target.value)}>
                {SURVEY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormRow>
            <FormRow label="Date Sent"><input style={inp} type="date" value={form.dateSent} onChange={e => f('dateSent', e.target.value)} /></FormRow>
            <FormRow label="# Sent"><input style={inp} type="number" value={form.numSent} onChange={e => f('numSent', e.target.value)} min={0} /></FormRow>
            <FormRow label="# Responses">
              <input style={inp} type="number" value={form.numResponses} onChange={e => f('numResponses', e.target.value)} min={0} />
              {responseRate !== null && <span style={{ fontSize: 11, color: '#4A7C5C', marginTop: 3, display: 'block', fontFamily: "'Outfit', sans-serif" }}>Response rate: {responseRate}%</span>}
            </FormRow>
            <FormRow label="Avg Score (out of 10)"><input style={inp} type="number" step="0.1" min={0} max={10} value={form.avgScore} onChange={e => f('avgScore', e.target.value)} /></FormRow>
          </div>
          <FormRow label="Key Themes"><textarea style={ta} value={form.keyThemes} onChange={e => f('keyThemes', e.target.value)} placeholder="What did respondents say most?" /></FormRow>
          <FormActions onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {sortedSurveys.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No surveys logged yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedSurveys.map(s => {
          const rate = s.numSent ? Math.round((s.numResponses / s.numSent) * 100) : 0
          return (
            <div key={s.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{s.name}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(74,140,140,0.1)', color: '#4A8C8C', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{s.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: s.keyThemes ? 8 : 0 }}>
                    <span style={stat}><strong>{s.dateSent}</strong> <span style={{ color: 'var(--mid-grey)' }}>sent</span></span>
                    <span style={stat}><strong>{s.numSent}</strong> <span style={{ color: 'var(--mid-grey)' }}>recipients</span></span>
                    <span style={stat}><strong>{s.numResponses}</strong> <span style={{ color: 'var(--mid-grey)' }}>responses</span></span>
                    <span style={stat}><strong style={{ color: '#4A7C5C' }}>{rate}%</strong> <span style={{ color: 'var(--mid-grey)' }}>response rate</span></span>
                    <span style={stat}><strong style={{ color: 'var(--accent)' }}>{s.avgScore}/10</strong> <span style={{ color: 'var(--mid-grey)' }}>avg score</span></span>
                  </div>
                  {s.keyThemes && <p style={{ margin: 0, fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{s.keyThemes}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(s)} style={iconBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => onDelete(s.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── NPS Tracker ──────────────────────────────────────────────────────────────
function NPSSection({ clientId, nps, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { quarter: '', respondents: '', promotersPct: '', passivesPct: '', detractorsPct: '', topDetractorReason: '' }
  const [form, setForm] = useState(empty)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const calcScore = () => {
    const p = parseFloat(form.promotersPct) || 0
    const d = parseFloat(form.detractorsPct) || 0
    return Math.round(p - d)
  }

  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (n) => {
    setForm({ ...n, respondents: String(n.respondents), promotersPct: String(n.promotersPct), passivesPct: String(n.passivesPct), detractorsPct: String(n.detractorsPct) })
    setEditId(n.id); setShowForm(true)
  }
  const handleSave = () => {
    if (!form.quarter.trim()) return
    const score = calcScore()
    const payload = { ...form, score, respondents: Number(form.respondents) || 0, promotersPct: parseFloat(form.promotersPct) || 0, passivesPct: parseFloat(form.passivesPct) || 0, detractorsPct: parseFloat(form.detractorsPct) || 0 }
    if (editId) onUpdate(editId, payload)
    else onAdd(payload)
    setShowForm(false)
  }

  const sorted = [...nps].sort((a, b) => a.quarter.localeCompare(b.quarter))
  const latest = sorted[sorted.length - 1]

  return (
    <div>
      <SectionHeader title="NPS Tracker" onAdd={openAdd} />

      {latest && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 24, alignItems: 'start' }}>
          <div style={{ background: npsColor(latest.score).bg, border: `1.5px solid ${npsColor(latest.score).border}`, borderRadius: 14, padding: '20px 28px', textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: npsColor(latest.score).color, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{latest.score}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: npsColor(latest.score).color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>{npsColor(latest.score).label}</div>
            <div style={{ fontSize: 11, color: 'var(--mid-grey)', marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>{latest.quarter}</div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Score trend</p>
            <TrendChart data={sorted} valueKey="score" labelKey="quarter" color={npsColor(latest.score).color} minVal={-100} maxVal={100} />
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Quarter' : 'Add Quarter'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Quarter (e.g. Q1 2026)"><input style={inp} value={form.quarter} onChange={e => f('quarter', e.target.value)} placeholder="Q1 2026" /></FormRow>
            <FormRow label="Respondents"><input style={inp} type="number" value={form.respondents} onChange={e => f('respondents', e.target.value)} min={0} /></FormRow>
            <FormRow label="Promoters %"><input style={inp} type="number" step="0.1" value={form.promotersPct} onChange={e => f('promotersPct', e.target.value)} min={0} max={100} /></FormRow>
            <FormRow label="Passives %"><input style={inp} type="number" step="0.1" value={form.passivesPct} onChange={e => f('passivesPct', e.target.value)} min={0} max={100} /></FormRow>
            <FormRow label="Detractors %"><input style={inp} type="number" step="0.1" value={form.detractorsPct} onChange={e => f('detractorsPct', e.target.value)} min={0} max={100} /></FormRow>
            <FormRow label="Calculated NPS">
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 700, color: npsColor(calcScore()).color, fontFamily: "'Outfit', sans-serif" }}>{calcScore()}</div>
            </FormRow>
          </div>
          <FormRow label="Top Detractor Reason"><input style={inp} value={form.topDetractorReason} onChange={e => f('topDetractorReason', e.target.value)} placeholder="What did detractors cite most?" /></FormRow>
          <FormActions onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(n => {
          const nc = npsColor(n.score)
          return (
            <div key={n.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: nc.bg, border: `1.5px solid ${nc.border}`, borderRadius: 8, padding: '6px 14px', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: nc.color, lineHeight: 1, fontFamily: "'Libre Baskerville', serif" }}>{n.score}</div>
                <div style={{ fontSize: 10, color: nc.color, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{nc.label}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{n.quarter}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={stat}><strong style={{ color: '#4A7C5C' }}>{n.promotersPct}%</strong> <span style={{ color: 'var(--mid-grey)' }}>promoters</span></span>
                  <span style={stat}><strong>{n.passivesPct}%</strong> <span style={{ color: 'var(--mid-grey)' }}>passives</span></span>
                  <span style={stat}><strong style={{ color: 'var(--red)' }}>{n.detractorsPct}%</strong> <span style={{ color: 'var(--mid-grey)' }}>detractors</span></span>
                  <span style={stat}><strong>{n.respondents}</strong> <span style={{ color: 'var(--mid-grey)' }}>respondents</span></span>
                </div>
                {n.topDetractorReason && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Top detractor: {n.topDetractorReason}</p>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEdit(n)} style={iconBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => onDelete(n.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Review Analysis ──────────────────────────────────────────────────────────
function ReviewsSection({ clientId, reviews, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { platform: '', avgScore: '', totalReviews: '', newThisMonth: '', posThemes: '', negThemes: '', actionTaken: '' }
  const [form, setForm] = useState(empty)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (r) => { setForm({ ...r, avgScore: String(r.avgScore), totalReviews: String(r.totalReviews), newThisMonth: String(r.newThisMonth) }); setEditId(r.id); setShowForm(true) }
  const handleSave = () => {
    if (!form.platform.trim()) return
    const payload = { ...form, avgScore: parseFloat(form.avgScore) || 0, totalReviews: Number(form.totalReviews) || 0, newThisMonth: Number(form.newThisMonth) || 0 }
    if (editId) onUpdate(editId, payload)
    else onAdd(payload)
    setShowForm(false)
  }

  const combinedAvg = reviews.length ? (reviews.reduce((s, r) => s + r.avgScore, 0) / reviews.length).toFixed(1) : null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Review Analysis</h3>
          {combinedAvg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(196,135,74,0.1)', border: '1.5px solid rgba(196,135,74,0.25)', borderRadius: 8, padding: '4px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C4874A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>{combinedAvg} combined avg</span>
            </div>
          )}
        </div>
        <button onClick={openAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Platform</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Platform' : 'Add Platform'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Platform"><input style={inp} value={form.platform} onChange={e => f('platform', e.target.value)} placeholder="e.g. Google, Yelp, Trustpilot" /></FormRow>
            <FormRow label="Avg Score (out of 5)"><input style={inp} type="number" step="0.1" min={0} max={5} value={form.avgScore} onChange={e => f('avgScore', e.target.value)} /></FormRow>
            <FormRow label="Total Reviews"><input style={inp} type="number" value={form.totalReviews} onChange={e => f('totalReviews', e.target.value)} min={0} /></FormRow>
            <FormRow label="New This Month"><input style={inp} type="number" value={form.newThisMonth} onChange={e => f('newThisMonth', e.target.value)} min={0} /></FormRow>
          </div>
          <FormRow label="Recurring Positive Themes"><textarea style={ta} value={form.posThemes} onChange={e => f('posThemes', e.target.value)} placeholder="What do reviewers love?" /></FormRow>
          <FormRow label="Recurring Negative Themes"><textarea style={ta} value={form.negThemes} onChange={e => f('negThemes', e.target.value)} placeholder="What are the common complaints?" /></FormRow>
          <FormRow label="Action Taken"><textarea style={{ ...ta, minHeight: 56 }} value={form.actionTaken} onChange={e => f('actionTaken', e.target.value)} placeholder="What has been done to address negatives?" /></FormRow>
          <FormActions onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No review platforms logged yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{r.platform}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C4874A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>{r.avgScore}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{r.totalReviews} reviews · {r.newThisMonth} new this month</span>
                </div>
                {r.posThemes && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#4A7C5C', fontWeight: 700, flexShrink: 0, marginTop: 1, fontFamily: "'Outfit', sans-serif" }}>+ Positive:</span>
                    <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{r.posThemes}</span>
                  </div>
                )}
                {r.negThemes && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700, flexShrink: 0, marginTop: 1, fontFamily: "'Outfit', sans-serif" }}>– Negative:</span>
                    <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{r.negThemes}</span>
                  </div>
                )}
                {r.actionTaken && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, color: '#4A8C8C', fontWeight: 700, flexShrink: 0, marginTop: 1, fontFamily: "'Outfit', sans-serif" }}>Action:</span>
                    <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{r.actionTaken}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEdit(r)} style={iconBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => onDelete(r.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Competitor Intelligence ───────────────────────────────────────────────────
function CompetitorsSection({ clientId, competitors, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { name: '', googleReviewAvg: '', estMemberCount: '', strongestChannel: '', theyDoBetter: '', weDoBetter: '', monthlyNotes: '' }
  const [form, setForm] = useState(empty)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (c) => { setForm({ ...c, googleReviewAvg: String(c.googleReviewAvg), estMemberCount: String(c.estMemberCount) }); setEditId(c.id); setShowForm(true) }
  const handleSave = () => {
    if (!form.name.trim()) return
    const payload = { ...form, googleReviewAvg: parseFloat(form.googleReviewAvg) || 0, estMemberCount: Number(form.estMemberCount) || 0 }
    if (editId) onUpdate(editId, payload)
    else onAdd(payload)
    setShowForm(false)
  }

  const canAdd = competitors.length < 5

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Competitor Intelligence</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{competitors.length}/5</span>
          {canAdd && <button onClick={openAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add Competitor</button>}
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Competitor' : 'Add Competitor'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Business Name"><input style={inp} value={form.name} onChange={e => f('name', e.target.value)} placeholder="Competitor name" /></FormRow>
            <FormRow label="Strongest Channel"><input style={inp} value={form.strongestChannel} onChange={e => f('strongestChannel', e.target.value)} placeholder="e.g. Instagram, Google" /></FormRow>
            <FormRow label="Google Review Avg"><input style={inp} type="number" step="0.1" min={0} max={5} value={form.googleReviewAvg} onChange={e => f('googleReviewAvg', e.target.value)} /></FormRow>
            <FormRow label="Est. Member Count"><input style={inp} type="number" value={form.estMemberCount} onChange={e => f('estMemberCount', e.target.value)} min={0} /></FormRow>
          </div>
          <FormRow label="They Do Better"><textarea style={ta} value={form.theyDoBetter} onChange={e => f('theyDoBetter', e.target.value)} placeholder="Where do they have an edge?" /></FormRow>
          <FormRow label="We Do Better"><textarea style={ta} value={form.weDoBetter} onChange={e => f('weDoBetter', e.target.value)} placeholder="Where do we have an edge?" /></FormRow>
          <FormRow label="Monthly Notes"><textarea style={{ ...ta, minHeight: 56 }} value={form.monthlyNotes} onChange={e => f('monthlyNotes', e.target.value)} placeholder="What's happening with this competitor this month?" /></FormRow>
          <FormActions onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {competitors.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No competitors tracked yet.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {competitors.map(c => (
          <div key={c.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{c.name}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                  <span style={stat}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#C4874A" style={{ verticalAlign: 'middle' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {' '}<strong style={{ color: 'var(--accent)' }}>{c.googleReviewAvg}</strong>
                  </span>
                  {c.estMemberCount > 0 && <span style={stat}><strong>{c.estMemberCount}</strong> <span style={{ color: 'var(--mid-grey)' }}>members</span></span>}
                  {c.strongestChannel && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(74,140,140,0.1)', color: '#4A8C8C', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{c.strongestChannel}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => openEdit(c)} style={iconBtn}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => onDelete(c.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
            {c.theyDoBetter && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>They do better</span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>{c.theyDoBetter}</p>
              </div>
            )}
            {c.weDoBetter && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#4A7C5C', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>We do better</span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>{c.weDoBetter}</p>
              </div>
            )}
            {c.monthlyNotes && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>This month</span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>{c.monthlyNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Response Time ─────────────────────────────────────────────────────────────
function ResponseTimeSection({ clientId, responseTime, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { month: '', avgHours: '' }
  const [form, setForm] = useState(empty)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }
  const openEdit = (r) => { setForm({ ...r, avgHours: String(r.avgHours) }); setEditId(r.id); setShowForm(true) }
  const handleSave = () => {
    if (!form.month.trim()) return
    const payload = { ...form, avgHours: parseFloat(form.avgHours) || 0 }
    if (editId) onUpdate(editId, payload)
    else onAdd(payload)
    setShowForm(false)
  }

  const sorted = [...responseTime].sort((a, b) => a.month.localeCompare(b.month))
  const latest = sorted[sorted.length - 1]
  const avgHrs = latest ? latest.avgHours : null

  const gaugeColor = avgHrs === null ? '#8A8480'
    : avgHrs <= BENCHMARK_HOURS ? '#4A7C5C'
    : avgHrs <= 4 ? '#C4874A'
    : '#C4503A'

  const gaugeMax = 8
  const gaugePct = avgHrs !== null ? Math.min(avgHrs / gaugeMax, 1) : 0
  const benchmarkPct = BENCHMARK_HOURS / gaugeMax

  return (
    <div>
      <SectionHeader title="Response Time Benchmarking" onAdd={openAdd} addLabel="+ Log Month" />

      {avgHrs !== null && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: gaugeColor, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>{avgHrs}h</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', marginTop: 2, fontFamily: "'Outfit', sans-serif" }}>Current avg response time ({latest.month})</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: gaugeColor, fontFamily: "'Outfit', sans-serif" }}>
                {avgHrs <= BENCHMARK_HOURS ? 'Below benchmark' : `${(avgHrs - BENCHMARK_HOURS).toFixed(1)}h above benchmark`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Industry benchmark: {BENCHMARK_HOURS}hr</div>
            </div>
          </div>

          {/* Gauge bar */}
          <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'var(--border)', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '25%', background: 'rgba(74,124,92,0.3)', borderRadius: '6px 0 0 6px' }} />
            <div style={{ position: 'absolute', left: '25%', top: 0, height: '100%', width: '25%', background: 'rgba(196,135,74,0.3)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '50%', background: 'rgba(196,80,58,0.2)', borderRadius: '0 6px 6px 0' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${gaugePct * 100}%`, background: gaugeColor, borderRadius: '6px', transition: 'width 0.4s ease', maxWidth: '100%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif', position: 'relative'" }}>
            <span>0h</span>
            <div style={{ position: 'absolute', left: `${benchmarkPct * 100}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', top: -20 }}>
              <div style={{ width: 2, height: 20, background: 'var(--dark)', opacity: 0.4 }} />
            </div>
            <span style={{ position: 'absolute', left: `${benchmarkPct * 100}%`, transform: 'translateX(-50%)', color: 'var(--dark)', fontWeight: 700 }}>{BENCHMARK_HOURS}h ↑</span>
            <span style={{ marginLeft: 'auto' }}>{gaugeMax}h+</span>
          </div>

          {sorted.length >= 2 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--mid-grey)', margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>Trend</p>
              <TrendChart data={sorted} valueKey="avgHours" labelKey="month" color={gaugeColor} minVal={0} maxVal={gaugeMax} />
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{editId ? 'Edit Entry' : 'Log Month'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Month (e.g. Apr 2026)"><input style={inp} value={form.month} onChange={e => f('month', e.target.value)} placeholder="Apr 2026" /></FormRow>
            <FormRow label="Avg Response Time (hours)"><input style={inp} type="number" step="0.1" min={0} value={form.avgHours} onChange={e => f('avgHours', e.target.value)} /></FormRow>
          </div>
          <FormActions onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {responseTime.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No response time data logged yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...sorted].reverse().map(r => {
          const c = r.avgHours <= BENCHMARK_HOURS ? '#4A7C5C' : r.avgHours <= 4 ? '#C4874A' : '#C4503A'
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontSize: 12, color: 'var(--mid-grey)', flex: 1, fontFamily: "'Outfit', sans-serif" }}>{r.month}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'Outfit', sans-serif" }}>{r.avgHours}h</span>
              <button onClick={() => openEdit(r)} style={iconBtn}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => onDelete(r.id)} style={{ ...iconBtn, color: 'var(--red)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Research Findings Summary ─────────────────────────────────────────────────
function FindingsSection({ clientId, clientName, findings, onUpsert, onCreateTask }) {
  const currentMonth = 'April 2026'
  const existing = findings.find(f => f.month === currentMonth)
  const [text, setText] = useState(existing?.text || '')
  const [saved, setSaved] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    const f = findings.find(f => f.month === month)
    setText(f?.text || '')
    setSaved(true)
  }

  const handleSave = () => {
    onUpsert(selectedMonth, text)
    setSaved(true)
  }

  const months = ['April 2026', 'March 2026', 'February 2026', 'January 2026', 'December 2025', 'November 2025']

  return (
    <div>
      <SectionHeader title="Research Findings Summary" />
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
        A plain-language monthly synthesis of all research data above. This feeds directly into the monthly report.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {months.map(m => {
          const hasEntry = findings.some(f => f.month === m)
          return (
            <button
              key={m}
              onClick={() => handleMonthChange(m)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                background: selectedMonth === m ? 'var(--accent)' : hasEntry ? 'rgba(74,124,92,0.1)' : 'var(--bg)',
                color: selectedMonth === m ? '#fff' : hasEntry ? '#4A7C5C' : 'var(--mid-grey)',
                border: selectedMonth === m ? 'none' : `1.5px solid ${hasEntry ? 'rgba(74,124,92,0.25)' : 'var(--border)'}`,
              }}
            >
              {m} {hasEntry && selectedMonth !== m ? '✓' : ''}
            </button>
          )
        })}
      </div>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setSaved(false) }}
        placeholder={`Write your ${selectedMonth} research findings summary here. Cover NPS trends, survey highlights, review themes, competitor movements, and response time status...`}
        style={{
          width: '100%', boxSizing: 'border-box', minHeight: 200,
          padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 12,
          fontSize: 14, lineHeight: 1.7, fontFamily: "'Outfit', sans-serif",
          background: 'var(--bg)', color: 'var(--dark)', resize: 'vertical', outline: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 12, color: saved ? '#4A7C5C' : 'var(--accent)', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          {saved ? (text ? '✓ Saved' : '') : 'Unsaved changes'}
        </span>
        <button onClick={handleSave} disabled={saved && !!existing?.text}
          style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: saved && existing?.text ? 'var(--border)' : 'var(--accent)',
            color: saved && existing?.text ? 'var(--mid-grey)' : '#fff',
            cursor: saved && existing?.text ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          }}
        >Save Findings</button>
      </div>

      {findings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous findings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...findings].filter(f => f.month !== selectedMonth).map(f => (
              <div key={f.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>{f.month}</div>
                  <button
                    onClick={() => onCreateTask && onCreateTask(f)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(74,124,92,0.12)', border: '1px solid rgba(74,124,92,0.25)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#4A7C5C', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Link to Task
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ResearchTab ──────────────────────────────────────────────────────────
export default function ResearchTab({ clientId, clientName }) {
  const [subTab, setSubTab] = useState('Member Surveys')
  const {
    getClient,
    addSurvey, updateSurvey, deleteSurvey,
    addNPS, updateNPS, deleteNPS,
    addReview, updateReview, deleteReview,
    addCompetitorR, updateCompetitorR, deleteCompetitorR,
    addResponseTime, updateResponseTime, deleteResponseTime,
    upsertFindings,
  } = useResearchData()
  const { addTask } = useVATasks()

  const client = getClient(clientId)

  const handleCreateTaskFromFinding = (finding) => {
    addTask({
      title: `Action: ${finding.month} research findings`,
      clientId,
      clientName: clientName || clientId,
      notes: finding.text?.slice(0, 200) || '',
      priority: 'medium',
      status: 'pending',
      due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      assignedTo: 'Sonia',
    })
  }

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg)', overflowX: 'auto' }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            style={{
              padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: subTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'transparent', color: subTab === tab ? 'var(--accent)' : 'var(--mid-grey)',
              fontFamily: "'Outfit', sans-serif", marginBottom: '-1px', whiteSpace: 'nowrap',
            }}
          >{tab}</button>
        ))}
      </div>

      <div style={{ padding: '24px 0' }}>
        {subTab === 'Member Surveys' && (
          <SurveysSection
            clientId={clientId}
            surveys={client.surveys}
            onAdd={s => addSurvey(clientId, s)}
            onUpdate={(id, c) => updateSurvey(clientId, id, c)}
            onDelete={id => deleteSurvey(clientId, id)}
          />
        )}
        {subTab === 'NPS Tracker' && (
          <NPSSection
            clientId={clientId}
            nps={client.nps}
            onAdd={n => addNPS(clientId, n)}
            onUpdate={(id, c) => updateNPS(clientId, id, c)}
            onDelete={id => deleteNPS(clientId, id)}
          />
        )}
        {subTab === 'Review Analysis' && (
          <ReviewsSection
            clientId={clientId}
            reviews={client.reviews}
            onAdd={r => addReview(clientId, r)}
            onUpdate={(id, c) => updateReview(clientId, id, c)}
            onDelete={id => deleteReview(clientId, id)}
          />
        )}
        {subTab === 'Competitor Intelligence' && (
          <CompetitorsSection
            clientId={clientId}
            competitors={client.competitors}
            onAdd={c => addCompetitorR(clientId, c)}
            onUpdate={(id, ch) => updateCompetitorR(clientId, id, ch)}
            onDelete={id => deleteCompetitorR(clientId, id)}
          />
        )}
        {subTab === 'Response Time' && (
          <ResponseTimeSection
            clientId={clientId}
            responseTime={client.responseTime}
            onAdd={r => addResponseTime(clientId, r)}
            onUpdate={(id, c) => updateResponseTime(clientId, id, c)}
            onDelete={id => deleteResponseTime(clientId, id)}
          />
        )}
        {subTab === 'Findings' && (
          <FindingsSection
            clientId={clientId}
            clientName={clientName}
            findings={client.findings}
            onUpsert={(month, text) => upsertFindings(clientId, month, text)}
            onCreateTask={handleCreateTaskFromFinding}
          />
        )}
        {subTab === 'Client Intelligence' && (
          <ClientIntelligence clientId={clientId} clientName={clientName} />
        )}
      </div>
    </div>
  )
}

const stat = { fontSize: 12, fontFamily: "'Outfit', sans-serif", color: 'var(--dark)' }
const iconBtn = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
  padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
  color: 'var(--mid-grey)',
}
