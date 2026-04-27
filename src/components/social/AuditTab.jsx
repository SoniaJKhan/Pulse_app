import React, { useState, useEffect, useCallback } from 'react'

const BG   = '#F7F5FF'
const CARD = '#FFFFFF'
const OR   = '#F97316'
const PU   = '#7C3AED'
const TX   = '#1A1A1A'
const MI   = '#6B7280'
const BD   = '#E5E7EB'
const GR   = '#16A34A'
const RD   = '#EF4444'
const FF   = "'Outfit', sans-serif"
const MIN_POSTS = 5

const PLATFORMS    = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube']
const CONTENT_TYPES = ['Reel', 'Carousel', 'Static Post', 'Story', 'Video', 'Blog']

function emptyRow() {
  return { id: `r${Date.now()}-${Math.random()}`, url: '', platform: 'Instagram', contentType: 'Reel', views: '', likes: '', comments: '', hook: '', notes: '' }
}

function loadAudit(clientId) {
  try {
    const raw = localStorage.getItem(`pulse_audit_${clientId}`)
    if (raw) {
      const rows = JSON.parse(raw)
      if (Array.isArray(rows) && rows.length > 0) return rows
    }
  } catch {}
  return [emptyRow()]
}

function saveAudit(clientId, rows) {
  try { localStorage.setItem(`pulse_audit_${clientId}`, JSON.stringify(rows)) } catch {}
}

const INP = {
  width: '100%', boxSizing: 'border-box', padding: '8px 11px',
  border: `1.5px solid ${BD}`, borderRadius: 9, fontSize: 13,
  fontFamily: FF, color: TX, background: '#FAFAFA', outline: 'none',
}

export default function AuditTab({ clientId, pushToast }) {
  const [rows, setRows]       = useState(() => loadAudit(clientId))
  const [warning, setWarning] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    setRows(loadAudit(clientId))
    setWarning('')
    setUnlocked(false)
  }, [clientId])

  const updRow = useCallback((id, field, val) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
    setWarning('')
  }, [])

  const addRow = () => setRows(prev => [...prev, emptyRow()])

  const removeRow = (id) => setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)

  const save = () => {
    const filled = rows.filter(r => r.url.trim() || r.hook.trim() || r.views || r.likes)
    if (filled.length < MIN_POSTS) {
      setWarning(`Add at least ${MIN_POSTS} posts to unlock Analysis`)
      setUnlocked(false)
      return
    }
    saveAudit(clientId, rows)
    setWarning('')
    setUnlocked(true)
    pushToast?.('Audit saved')
  }

  const count   = rows.filter(r => r.url.trim() || r.hook.trim() || r.views || r.likes).length
  const pct     = Math.min(count / MIN_POSTS, 1)
  const isGreen = count >= MIN_POSTS

  return (
    <div style={{ fontFamily: FF }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: TX }}>Content Audit</h2>
        <p style={{ margin: 0, fontSize: 14, color: MI }}>Add your last 5–10 posts. This trains your analysis engine.</p>
      </div>

      {/* Progress indicator */}
      <div style={{ background: CARD, borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: `1px solid ${BD}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isGreen ? GR : TX }}>
            {count} / {MIN_POSTS} posts added
          </span>
          <span style={{ fontSize: 12, color: isGreen ? GR : MI, fontWeight: 600 }}>
            {isGreen ? '✓ Minimum reached' : `${MIN_POSTS - count} more to unlock Analysis`}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: BD, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 99, background: isGreen ? GR : OR, transition: 'width .3s, background .3s' }} />
        </div>
      </div>

      {/* Post rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ background: CARD, borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: `1px solid ${BD}`, position: 'relative' }}>

            {/* Row number + trash */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: '.06em' }}>Post {idx + 1}</span>
              <button
                onClick={() => removeRow(row.id)}
                title="Remove post"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: RD, padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>

            {/* Row 1: URL full width */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Post URL</label>
              <input value={row.url} onChange={e => updRow(row.id, 'url', e.target.value)} placeholder="Post URL" style={INP} />
            </div>

            {/* Row 2: Platform + Content Type + Views + Likes + Comments */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Platform</label>
                <select value={row.platform} onChange={e => updRow(row.id, 'platform', e.target.value)} style={INP}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Content Type</label>
                <select value={row.contentType} onChange={e => updRow(row.id, 'contentType', e.target.value)} style={INP}>
                  {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Views</label>
                <input type="number" min="0" value={row.views} onChange={e => updRow(row.id, 'views', e.target.value)} placeholder="0" style={INP} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Likes</label>
                <input type="number" min="0" value={row.likes} onChange={e => updRow(row.id, 'likes', e.target.value)} placeholder="0" style={INP} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Comments</label>
                <input type="number" min="0" value={row.comments} onChange={e => updRow(row.id, 'comments', e.target.value)} placeholder="0" style={INP} />
              </div>
            </div>

            {/* Row 3: Hook + Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Hook</label>
                <input value={row.hook} onChange={e => updRow(row.id, 'hook', e.target.value)} placeholder="What was the opening line?" style={INP} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Notes</label>
                <input value={row.notes} onChange={e => updRow(row.id, 'notes', e.target.value)} placeholder="What worked or did not work?" style={INP} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Post */}
      <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `2px dashed ${OR}`, background: `${OR}08`, color: OR, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF, marginBottom: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Post
      </button>

      {/* Warning */}
      {warning && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${OR}15`, border: `1px solid ${OR}40`, color: OR, fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: FF }}>
          ⚠ {warning}
        </div>
      )}

      {/* Unlocked banner */}
      {unlocked && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(22,163,74,0.12)', border: `1px solid rgba(22,163,74,0.3)`, color: GR, fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: FF, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Audit complete. Analysis is now unlocked.
        </div>
      )}

      {/* Save */}
      <button onClick={save} style={{ padding: '12px 32px', borderRadius: 11, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, boxShadow: `0 4px 16px ${PU}40` }}>
        Save Audit
      </button>
    </div>
  )
}
