import React, { useState, useRef } from 'react'
import ContentCalendar from '../components/social/ContentCalendar'
import MetricsTracker from '../components/social/MetricsTracker'
import CompetitorTracker from '../components/social/CompetitorTracker'
import AIStudio from '../components/social/AIStudio'
import ClientIntelligence from '../components/research/ClientIntelligence'
import WebsiteTab from '../components/website/WebsiteTab'
import { useSocialData } from '../hooks/useSocialData'
import { useResearchData } from '../hooks/useResearchData'
import { useAlerts } from '../contexts/AlertsContext'
import { useReportData } from '../hooks/useReportData'

const TABS = ['Marketing', 'Operations']

const STATUS_STYLE = {
  Active:     { bg: 'var(--green-bg)',              color: 'var(--green)',    dot: 'var(--green)' },
  Onboarding: { bg: 'rgba(196,135,74,0.12)',        color: 'var(--accent)',   dot: 'var(--accent)' },
  Paused:     { bg: 'var(--light-grey)',             color: 'var(--mid-grey)', dot: 'var(--mid-grey)' },
  Churned:    { bg: 'var(--red-bg)',                color: 'var(--red)',      dot: 'var(--red)' },
}

const PACKAGE_STYLE = {
  'Full Service': { bg: 'rgba(196,135,74,0.12)',  color: 'var(--accent)' },
  'Growth':       { bg: 'rgba(74,124,92,0.1)',    color: '#4A7C5C' },
  'Starter':      { bg: 'rgba(138,132,128,0.12)', color: 'var(--mid-grey)' },
  'Custom':       { bg: 'rgba(74,140,140,0.12)',  color: '#4A8C8C' },
}

function healthColor(n) {
  if (n >= 7) return { bg: 'var(--green-bg)', color: 'var(--green)' }
  if (n >= 4) return { bg: 'var(--amber-bg)', color: 'var(--amber)' }
  return { bg: 'var(--red-bg)', color: 'var(--red)' }
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={p.detailRow}>
      <span style={p.detailLabel}>{label}</span>
      <span style={p.detailValue}>{value}</span>
    </div>
  )
}

function DateRow({ label, value }) {
  return (
    <div style={p.dateRow}>
      <span style={p.dateLabel}>{label}</span>
      <span style={p.dateValue}>{value || <span style={{ color: 'var(--mid-grey)', fontStyle: 'italic' }}>Not set</span>}</span>
    </div>
  )
}

function PlaceholderTab({ name }) {
  const icons = {
    'Social Media': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    'Operations': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    'Research': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    'VA Support': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
    'Website': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    'Reports': (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  }
  return (
    <div style={p.placeholderTab}>
      <div style={p.placeholderIcon}>{icons[name] || null}</div>
      <h3 style={p.placeholderTitle}>{name}</h3>
      <p style={p.placeholderDesc}>This section is being developed for the next sprint.</p>
      <span style={p.placeholderPill}>Coming soon</span>
    </div>
  )
}

// ─── Growth & Retention Tab ────────────────────────────────────────────────────
function GrowthRetentionTab({ client, onUpdate, addManualAlert }) {
  const [responseTime, setResponseTime] = useState(client.avgResponseTimeHours ?? '')
  const [rtSaved, setRtSaved] = useState(true)
  const [escalations, setEscalations] = useState(client.escalations || [])
  const [showEscForm, setShowEscForm] = useState(false)
  const [escTitle, setEscTitle] = useState('')
  const [escPriority, setEscPriority] = useState('High')
  const [escNote, setEscNote] = useState('')

  const handleSaveRT = () => {
    const val = parseFloat(responseTime)
    if (!isNaN(val) && val > 0) {
      onUpdate({ avgResponseTimeHours: val })
      setRtSaved(true)
    }
  }

  const handleAddEscalation = () => {
    if (!escTitle.trim()) return
    const esc = {
      id: `esc-${Date.now()}`,
      title: escTitle.trim(),
      priority: escPriority,
      note: escNote.trim(),
      createdAt: new Date().toISOString(),
    }
    const updated = [esc, ...escalations]
    setEscalations(updated)
    onUpdate({ escalations: updated })
    if (escPriority === 'High') {
      addManualAlert({
        type: 'escalation',
        priority: 'High',
        clientId: client.id,
        title: `Escalation: ${esc.title}`,
        message: escNote.trim() || `High priority escalation logged for ${client.businessName}.`,
      })
    }
    setEscTitle('')
    setEscNote('')
    setEscPriority('High')
    setShowEscForm(false)
  }

  const rtColor = !responseTime ? 'var(--mid-grey)'
    : responseTime <= 2 ? 'var(--green)'
    : responseTime <= 4 ? 'var(--amber)'
    : 'var(--red)'

  const priorityStyle = (pr) => ({
    High: { bg: 'var(--red-bg)', color: 'var(--red)' },
    Medium: { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    Low: { bg: 'var(--green-bg)', color: 'var(--green)' },
  }[pr] || {})

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
    border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid-grey)',
    marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif",
  }
  const sectionStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 16,
  }
  const sectionTitle = {
    fontSize: 13, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif",
    marginBottom: 14, display: 'block',
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Response Time */}
      <div style={sectionStyle}>
        <span style={sectionTitle}>Daily Average Response Time</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Avg hours to respond</label>
            <input
              type="number"
              min="0.1"
              step="0.25"
              value={responseTime}
              onChange={e => { setResponseTime(e.target.value); setRtSaved(false) }}
              onBlur={handleSaveRT}
              onKeyDown={e => e.key === 'Enter' && handleSaveRT()}
              style={{ ...inputStyle, width: 120 }}
              placeholder="e.g. 1.5"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-end', paddingBottom: 2 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: rtColor, fontFamily: "'DM Mono', monospace" }}>
              {responseTime ? `${parseFloat(responseTime)}h` : '—'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
              {!responseTime ? 'Not set' : responseTime <= 2 ? 'Excellent ✓' : responseTime <= 4 ? 'Acceptable' : 'Needs improvement'}
            </span>
          </div>
          {!rtSaved && (
            <button
              onClick={handleSaveRT}
              style={{ alignSelf: 'flex-end', padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}
            >
              Save
            </button>
          )}
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
          Industry benchmark: <strong style={{ color: 'var(--green)' }}>2 hours</strong> · Response time impacts member retention and health score.
        </div>
      </div>

      {/* Escalation Log */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ ...sectionTitle, marginBottom: 0 }}>Escalation Log</span>
          <button
            onClick={() => setShowEscForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: showEscForm ? 'var(--bg)' : 'var(--accent)', color: showEscForm ? 'var(--mid-grey)' : '#fff', border: showEscForm ? '1.5px solid var(--border)' : 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Escalation
          </button>
        </div>

        {showEscForm && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle}
                placeholder="Brief description of the escalation"
                value={escTitle}
                onChange={e => setEscTitle(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={escPriority}
                  onChange={e => setEscPriority(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="Context or resolution steps"
                  value={escNote}
                  onChange={e => setEscNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddEscalation()}
                />
              </div>
            </div>
            {escPriority === 'High' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--red-bg)', border: '1px solid rgba(192,64,42,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--red)', fontFamily: "'Outfit', sans-serif" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                High priority escalations will automatically create an alert in the Alerts section.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddEscalation} style={{ padding: '7px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Save Escalation</button>
              <button onClick={() => setShowEscForm(false)} style={{ padding: '7px 12px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--mid-grey)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        {escalations.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>No escalations logged yet.</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 4, opacity: 0.7 }}>High priority escalations are automatically sent to Alerts.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {escalations.map(esc => {
              const ps = priorityStyle(esc.priority)
              return (
                <div key={esc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ps.bg, color: ps.color, fontFamily: "'Outfit', sans-serif", flexShrink: 0, marginTop: 1 }}>{esc.priority}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{esc.title}</div>
                    {esc.note && <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{esc.note}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                    {new Date(esc.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Gmail Integration Note */}
      <div style={{ ...sectionStyle, background: 'rgba(74,140,200,0.06)', border: '1px solid rgba(74,140,200,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(74,140,200,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(74,140,200,0.9)', fontFamily: "'Outfit', sans-serif" }}>Gmail Integration — Coming Soon</div>
            <div style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
              Connect Gmail to automatically pull response time data and track client communication directly from your inbox.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SOCIAL_SUB_TABS = ['Content Calendar', 'Metrics', 'Competitors', 'AI Studio']

function computeAutoHealth(client, npsArray, reviewsArray, unresolvedAlerts, allReports) {
  let score = 0
  // NPS above 50 → +2
  if (npsArray.length > 0) {
    const last = npsArray[npsArray.length - 1]
    if ((last.score ?? last.npsScore ?? 0) > 50) score += 2
  }
  // Review avg above 4.5 → +2
  if (reviewsArray.length > 0) {
    const last = reviewsArray[reviewsArray.length - 1]
    if ((last.avgScore ?? 0) > 4.5) score += 2
  }
  // No overdue high priority alerts → +2
  const highAlerts = unresolvedAlerts.filter(a => a.clientId === client.id && a.priority === 'High')
  if (highAlerts.length === 0) score += 2
  // Report generated this month → +2
  const thisMonth = new Date().toISOString().slice(0, 7)
  const clientReports = allReports[client.id] || []
  if (clientReports.some(r => r.createdAt?.slice(0, 7) === thisMonth)) score += 2
  // Response time under 2h → +2
  if (client.avgResponseTimeHours && client.avgResponseTimeHours < 2) score += 2
  return Math.min(10, score)
}

export default function ClientProfile({ client, onBack, onUpdate, onToggleChecklist, initialTab }) {
  const [activeTab, setActiveTab] = useState(TABS.includes(initialTab) ? initialTab : 'Marketing')
  const [socialSubTab, setSocialSubTab] = useState('Content Calendar')
  const {
    content, metrics, competitors,
    addContent, updateContent, deleteContent,
    upsertMetrics,
    addCompetitor, updateCompetitor, deleteCompetitor,
  } = useSocialData()
  const { getClient: getResearch } = useResearchData()
  const researchData = getResearch(client.id)
  const { unresolved, addManualAlert } = useAlerts()
  const reportHook = useReportData()
  const allReports = reportHook.data || {}
  const [notes, setNotes] = useState(client.notes || '')
  const [notesSaved, setNotesSaved] = useState(true)
  const [editingHealth, setEditingHealth] = useState(false)
  const healthRef = useRef(null)
  const [addingCred, setAddingCred] = useState(false)
  const [newCredPlatform, setNewCredPlatform] = useState('')
  const [newCredEmail, setNewCredEmail] = useState('')
  const [photoKey] = useState(Math.random())
  const photoInputRef = useRef(null)

  const autoScore = computeAutoHealth(client, researchData.nps || [], researchData.reviews || [], unresolved, allReports)

  const hc = healthColor(client.healthScore)
  const st = STATUS_STYLE[client.status] || STATUS_STYLE.Active
  const pk = PACKAGE_STYLE[client.package] || PACKAGE_STYLE.Starter

  const completedTasks = client.checklist?.filter(t => t.completed).length || 0
  const totalTasks = client.checklist?.length || 0
  const credentials = client.credentials || []

  const handleSaveNotes = () => {
    onUpdate({ notes })
    setNotesSaved(true)
  }

  const handleHealthChange = (val) => {
    onUpdate({ healthScore: parseInt(val) })
    setEditingHealth(false)
  }

  const handleAddCredential = () => {
    if (!newCredPlatform.trim()) return
    const cred = { id: `cred-${Date.now()}`, platform: newCredPlatform.trim(), loginEmail: newCredEmail.trim() }
    onUpdate({ credentials: [...credentials, cred] })
    setNewCredPlatform('')
    setNewCredEmail('')
    setAddingCred(false)
  }

  const handleRemoveCredential = (id) => {
    onUpdate({ credentials: credentials.filter(c => c.id !== id) })
  }

  const handleChecklistAssign = (itemId, assignedTo) => {
    const updated = (client.checklist || []).map(i =>
      i.id === itemId ? { ...i, assignedTo: assignedTo || null } : i
    )
    onUpdate({ checklist: updated })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpdate({ photo: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleAutoHealth = () => {
    onUpdate({ healthScore: autoScore })
    setEditingHealth(false)
  }

  return (
    <div style={p.page}>
      {/* Back */}
      <button style={p.backBtn} onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        All Clients
      </button>

      {/* Header card */}
      <div style={p.headerCard}>
        <div style={p.headerTop}>
          <div style={p.headerLeft}>
            <div
              style={{ ...p.clientInitials, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
              title="Click to upload photo"
              onClick={() => photoInputRef.current?.click()}
            >
              {client.photo
                ? <img src={client.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                : <span>{client.businessName.charAt(0)}{client.ownerName?.charAt(0) || ''}</span>
              }
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </div>
            <div>
              <h1 style={p.clientName}>{client.businessName}</h1>
              <p style={p.clientOwner}>{client.ownerName} · {client.businessType}</p>
            </div>
          </div>

          <div style={p.headerRight}>
            {/* Health score */}
            <div style={{ position: 'relative' }}>
              <button
                ref={healthRef}
                style={{ ...p.healthBadge, background: hc.bg, color: hc.color }}
                onClick={() => setEditingHealth(v => !v)}
                title="Click to edit health score"
              >
                <span style={p.healthNum}>{client.healthScore}</span>
                <span style={p.healthDen}>/10</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px', opacity: 0.6 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              {editingHealth && (
                <div style={p.healthDropdown}>
                  <p style={p.healthDropdownLabel}>Set Health Score</p>
                  <button
                    style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '6px 10px', background: 'rgba(196,135,74,0.12)', border: '1px solid rgba(196,135,74,0.3)', borderRadius: '7px', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    onClick={handleAutoHealth}
                  >
                    Auto-compute: {autoScore}/10
                  </button>
                  <div style={p.healthGrid}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => {
                      const c2 = healthColor(n)
                      return (
                        <button
                          key={n}
                          style={{
                            ...p.healthOption,
                            background: n === client.healthScore ? c2.bg : 'transparent',
                            color: n === client.healthScore ? c2.color : 'var(--dark)',
                            fontWeight: n === client.healthScore ? 700 : 400,
                          }}
                          onClick={() => handleHealthChange(n)}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div style={{ ...p.statusBadge, background: st.bg, color: st.color }}>
              <span style={{ ...p.statusDot, background: st.dot }} />
              {client.status}
            </div>

            {/* Package */}
            <div style={{ ...p.pkgBadge, background: pk.bg, color: pk.color }}>
              {client.package}
            </div>
          </div>
        </div>

        {/* Checklist progress */}
        {totalTasks > 0 && (
          <div style={p.progressBar}>
            <div style={p.progressTrack}>
              <div style={{ ...p.progressFill, width: `${(completedTasks / totalTasks) * 100}%` }} />
            </div>
            <span style={p.progressLabel}>Onboarding: {completedTasks}/{totalTasks} tasks</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={p.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab}
            style={{
              ...p.tab,
              ...(activeTab === tab ? p.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={p.tabContent}>
        {activeTab === 'Marketing' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Brand Kit */}
            <div>
              <div style={p.sectionLabel}>Brand Kit</div>
              <AIStudio
                client={client}
                onAddContent={addContent}
                onSwitchToCalendar={() => {}}
              />
            </div>

            {/* Intelligence Flow */}
            <div>
              <div style={p.sectionLabel}>Intelligence Flow</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
                <ClientIntelligence clientId={client.id} />
              </div>
            </div>

            {/* Content Calendar */}
            <div>
              <div style={p.sectionLabel}>Content Calendar</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <ContentCalendar
                  clientId={client.id}
                  content={content.filter(c => c.clientId === client.id)}
                  onAdd={addContent}
                  onUpdate={updateContent}
                  onDelete={deleteContent}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'Operations' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Growth & Retention */}
            <div>
              <div style={p.sectionLabel}>Growth & Retention</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <GrowthRetentionTab client={client} onUpdate={onUpdate} addManualAlert={addManualAlert} />
              </div>
            </div>

            {/* VA Tasks */}
            <div>
              <div style={p.sectionLabel}>VA Tasks</div>
              <PlaceholderTab name="VA Support" />
            </div>

            {/* Reports */}
            <div>
              <div style={p.sectionLabel}>Reports</div>
              <PlaceholderTab name="Reports" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const p = {
  page: {
    padding: '28px 32px',
    maxWidth: '1200px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'var(--mid-grey)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '0',
    marginBottom: '20px',
  },
  headerCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '22px 24px',
    marginBottom: '4px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  clientInitials: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'rgba(196,135,74,0.15)',
    color: 'var(--accent)',
    fontSize: '16px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Libre Baskerville', serif",
    flexShrink: 0,
    letterSpacing: '0.02em',
  },
  clientName: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '4px',
    fontFamily: "'Libre Baskerville', serif",
  },
  clientOwner: {
    fontSize: '13.5px',
    color: 'var(--mid-grey)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  healthBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  healthNum: {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: "'Libre Baskerville', serif",
    lineHeight: 1,
  },
  healthDen: {
    fontSize: '12px',
    fontWeight: 500,
    opacity: 0.7,
    marginLeft: '2px',
  },
  healthDropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)',
    padding: '14px',
    zIndex: 20,
    width: '160px',
  },
  healthDropdownLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--mid-grey)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '10px',
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px',
  },
  healthOption: {
    padding: '6px 0',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    textAlign: 'center',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    fontWeight: 600,
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  pkgBadge: {
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    fontWeight: 600,
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
  },
  progressTrack: {
    flex: 1,
    height: '5px',
    background: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  tabBar: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid var(--border)',
    marginBottom: '28px',
    overflowX: 'auto',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
  },
  tab: {
    padding: '16px 32px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--mid-grey)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color var(--transition)',
    fontFamily: "'Libre Baskerville', serif",
    letterSpacing: '0.01em',
  },
  tabActive: {
    color: 'var(--dark)',
    borderBottomColor: '#C4874A',
    fontWeight: 700,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--mid-grey)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: "'Outfit', sans-serif",
    marginBottom: 12,
  },
  tabContent: {
    minHeight: '400px',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
    boxShadow: 'var(--shadow-card)',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '16px',
    fontFamily: "'Libre Baskerville', serif",
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  checklistBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '20px',
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
    padding: '9px 0',
    borderBottom: '1px solid var(--border)',
  },
  detailLabel: {
    fontSize: '12.5px',
    color: 'var(--mid-grey)',
    fontWeight: 500,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: '13.5px',
    color: 'var(--dark)',
    fontWeight: 500,
    textAlign: 'right',
  },
  dateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  dateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 0',
    borderBottom: '1px solid var(--border)',
    gap: '12px',
  },
  dateLabel: {
    fontSize: '12.5px',
    color: 'var(--mid-grey)',
    fontWeight: 500,
  },
  dateValue: {
    fontSize: '13.5px',
    color: 'var(--dark)',
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
  },
  checklistItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '11px',
    padding: '9px 10px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'background var(--transition)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
    transition: 'all var(--transition)',
  },
  checkContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  checkTitle: {
    fontSize: '13.5px',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  checkMeta: {
    fontSize: '11px',
    color: 'var(--mid-grey)',
  },
  notesArea: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '13.5px',
    color: 'var(--dark)',
    background: 'var(--bg)',
    fontFamily: "'Outfit', sans-serif",
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.6,
  },
  notesFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  unsaved: {
    fontSize: '12px',
    color: 'var(--amber)',
    fontWeight: 500,
  },
  saveNotes: {
    padding: '7px 16px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveNotesSaved: {
    background: 'var(--border)',
    color: 'var(--mid-grey)',
    cursor: 'default',
  },
  placeholderTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    textAlign: 'center',
    gap: '12px',
    boxShadow: 'var(--shadow-card)',
  },
  placeholderIcon: {
    width: '68px',
    height: '68px',
    borderRadius: '14px',
    background: 'rgba(196,135,74,0.1)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  placeholderTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--dark)',
  },
  placeholderDesc: {
    fontSize: '13.5px',
    color: 'var(--mid-grey)',
    maxWidth: '300px',
    lineHeight: 1.6,
  },
  placeholderPill: {
    background: 'rgba(196,135,74,0.1)',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: '20px',
    marginTop: '4px',
  },
}
