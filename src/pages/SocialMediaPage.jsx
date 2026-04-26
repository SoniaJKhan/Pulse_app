import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useClients } from '../hooks/useClients'
import { useSocialData } from '../hooks/useSocialData'
import { useAuth } from '../contexts/AuthContext'
import ClientIntelligence from '../components/research/ClientIntelligence'

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG   = '#0F0F11'
const CARD = '#18171B'
const PU   = '#6C4CF1'
const PL   = '#8B6FF5'
const GR   = '#4A7C5C'
const OR   = '#F5722A'
const YL   = '#C89A1A'
const TX   = '#FFFFFF'
const MI   = 'rgba(255,255,255,0.55)'
const BD   = 'rgba(255,255,255,0.08)'
const R    = '14px'
const SH   = '0 2px 20px rgba(0,0,0,0.4)'

// ── Anthropic API ──────────────────────────────────────────────────────────────
async function callClaude(messages, maxTokens = 1400) {
  const key = localStorage.getItem('pulse_anthropic_key')
  if (!key) throw new Error('NO_KEY')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, messages }),
  })
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200)) }
  const json = await res.json()
  const text = json.content[0].text.trim()
  try { return JSON.parse(text) } catch {}
  const m = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (m) { try { return JSON.parse(m[1]) } catch {} }
  const o = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (o) { try { return JSON.parse(o[0]) } catch {} }
  return text
}

// ── Storage helpers ─────────────────────────────────────────────────────────────
const defAnalysis = () => ({
  contentAudit: [], competitors: [], contentResult: null, competitorResult: null,
  strategyResult: null, formatRules: null, executionRules: null,
  pillars: [], ideas: [], weeklyPlan: [], weeklyObjective: '',
})
const loadAnalysis = cid => { try { const r = localStorage.getItem(`pulse_analysis_${cid}`); return r ? JSON.parse(r) : defAnalysis() } catch { return defAnalysis() } }
const saveAnalysis = (cid, d) => { try { localStorage.setItem(`pulse_analysis_${cid}`, JSON.stringify(d)) } catch {} }
const loadBrandKit = cid => { try { return JSON.parse(localStorage.getItem(`pulse_brand_kit_${cid}`) || '{}') } catch { return {} } }
const saveBrandKit = (cid, d) => { try { localStorage.setItem(`pulse_brand_kit_${cid}`, JSON.stringify(d)) } catch {} }

function getStoredPlan(cid) {
  try { const r = localStorage.getItem('pulse_client_intelligence'); return r ? (JSON.parse(r)[cid]?.aiOutputs?.weeklyPlan || []) : [] } catch { return [] }
}
function preFillIntelligence(cid, client) {
  try {
    const KEY = 'pulse_client_intelligence'
    const all = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!all[cid]?.clientProfile?.clientName) {
      all[cid] = {
        brand: { toneKeywords: [], audienceDescription: '', languageStyle: 'English' },
        contentAudit: [], competitors: [], weeklyObjective: '',
        aiOutputs: { patterns: null, competitorInsights: null, strategy: null, formatRules: null, executionRules: null, pillars: [], ideas: [], weeklyPlan: [] },
        ...(all[cid] || {}),
        clientProfile: { clientName: client?.businessName || '', clientType: client?.businessType || '', platforms: [], goals: [], ...(all[cid]?.clientProfile || {}) },
      }
      localStorage.setItem(KEY, JSON.stringify(all))
    }
  } catch {}
}

// ── Toast ───────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return { toasts, push }
}
function ToastBox({ toasts }) {
  if (!toasts.length) return null
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ padding: '12px 18px', borderRadius: 11, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit',sans-serif", color: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', background: t.type === 'error' ? '#C4503A' : GR, display: 'flex', alignItems: 'center', gap: 10 }}>
          {t.type === 'error'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Shared helpers ──────────────────────────────────────────────────────────────
const PLAT_COL = { Instagram: '#E1306C', TikTok: '#69C9D0', YouTube: '#FF0000', LinkedIn: '#0A66C2', Facebook: '#1877F2' }
const STAT_MAP = {
  Scheduled: { bg: `${PU}22`, c: PL },
  Draft: { bg: 'rgba(255,255,255,0.08)', c: MI },
  Live: { bg: 'rgba(74,124,92,0.15)', c: '#5DA875' },
  'Pending Approval': { bg: 'rgba(200,154,26,0.15)', c: YL },
  'Changes Requested': { bg: 'rgba(196,80,58,0.15)', c: '#C4503A' },
  Overdue: { bg: 'rgba(196,80,58,0.15)', c: '#C4503A' },
}

function SPill({ s, sm }) {
  const c = STAT_MAP[s] || { bg: 'rgba(255,255,255,0.08)', c: MI }
  return <span style={{ display: 'inline-block', padding: sm ? '2px 8px' : '3px 10px', borderRadius: 20, fontSize: sm ? 10 : 11, fontWeight: 700, background: c.bg, color: c.c, fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>{s}</span>
}
function PlatDot({ p, size = 9 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: PLAT_COL[p] || MI, display: 'inline-block', flexShrink: 0 }} />
}

function isoToday() { return new Date().toISOString().slice(0, 10) }
function thisMonth() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}` }
function fmtDate(iso) { if (!iso) return '—'; return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
function fmtMon(ym) { if (!ym || ym === 'no-date') return 'No Date'; const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
function offsetDate(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

// ── Micro-styles ────────────────────────────────────────────────────────────────
const H2   = { margin: 0, fontSize: 18, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }
const LBL  = { display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: "'Outfit',sans-serif" }
const INP  = { width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 13.5, fontFamily: "'Outfit',sans-serif", color: TX, background: BG, outline: 'none' }
const XBTN = { background: 'none', border: 'none', cursor: 'pointer', color: MI, fontSize: 18, lineHeight: 1, padding: 4 }
const PBtn = (bg = PU) => ({ padding: '11px', borderRadius: 11, border: 'none', background: bg, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", width: '100%' })

// ── Utility components ──────────────────────────────────────────────────────────
function Spin() { return <div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} /> }

function EmptyState({ icon, msg, sub }) {
  return (
    <div style={{ background: CARD, borderRadius: R, padding: '48px 24px', border: `1px solid ${BD}`, textAlign: 'center', boxShadow: SH }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{msg}</p>
      <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{sub}</p>
    </div>
  )
}
function RunBtn({ label, onClick, loading }) {
  return <button onClick={onClick} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", opacity: loading ? 0.65 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>{loading && <Spin />}{label}</button>
}
function OutlineBtn({ label, onClick }) {
  return <button onClick={onClick} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{label}</button>
}

function APIKeyModal({ open, onClose, onSaved }) {
  const [val, setVal] = useState('')
  const [saved, setSaved] = useState(false)
  if (!open) return null
  const save = () => {
    if (!val.trim()) return
    localStorage.setItem('pulse_anthropic_key', val.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onSaved?.(); onClose() }, 1200)
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div style={{ background: CARD, borderRadius: R, padding: 32, width: 380, boxShadow: '0 12px 48px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Add Anthropic API Key</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: MI, lineHeight: 1.5, fontFamily: "'Outfit',sans-serif" }}>Stored locally — never sent to our servers.</p>
        {saved
          ? <div style={{ padding: '12px 14px', background: 'rgba(74,124,92,0.15)', borderRadius: 10, color: '#5DA875', fontWeight: 600, fontSize: 14, textAlign: 'center', fontFamily: "'Outfit',sans-serif" }}>✓ Key saved!</div>
          : <><input type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="sk-ant-…" style={{ ...INP, marginBottom: 12 }} onKeyDown={e => e.key === 'Enter' && save()} autoFocus /><button onClick={save} style={PBtn()}>Save Key</button></>}
      </div>
    </div>
  )
}

function OutputRenderer({ data }) {
  if (!data) return null
  if (typeof data === 'string') return <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif", lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{data}</p>
  if (Array.isArray(data)) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((item, i) => (
        <div key={i} style={{ padding: '11px 14px', background: BG, borderRadius: 9, borderLeft: `3px solid ${PU}` }}>
          {typeof item === 'string'
            ? <span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif" }}>{item}</span>
            : Object.entries(item).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: PL, textTransform: 'capitalize', fontFamily: "'Outfit',sans-serif" }}>{k.replace(/([A-Z])/g, ' $1')}: </span>
                <span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif" }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <span style={{ fontSize: 11, fontWeight: 700, color: PL, textTransform: 'uppercase', letterSpacing: '.04em', fontFamily: "'Outfit',sans-serif", display: 'block', marginBottom: 4 }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
          {Array.isArray(v)
            ? <ul style={{ margin: '0 0 0 14px', padding: 0 }}>{v.map((x, i) => <li key={i} style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>{typeof x === 'string' ? x : JSON.stringify(x)}</li>)}</ul>
            : <span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>{String(v)}</span>}
        </div>
      ))}
    </div>
  )
}

function AIBlock({ title, desc, onRun, loading, output, hasKey }) {
  return (
    <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '18px 20px', marginBottom: 14 }}>
      <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{title}</h4>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>{desc}</p>
      <button onClick={onRun} disabled={loading || !hasKey} style={{ padding: '9px 20px', borderRadius: 9, border: `1.5px solid ${PU}`, background: loading || !hasKey ? BG : `${PU}18`, color: loading || !hasKey ? MI : PL, fontSize: 13, fontWeight: 600, cursor: loading || !hasKey ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, opacity: !hasKey ? 0.5 : 1 }}>
        {loading && <Spin />}{output ? 'Re-run' : 'Run Analysis'}
      </button>
      {output && (
        <div style={{ marginTop: 14, background: BG, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}` }}>
          <OutputRenderer data={output} />
        </div>
      )}
    </div>
  )
}

// ── PART 3: Drawers ─────────────────────────────────────────────────────────────
const PLATS  = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']
const CTYPES = ['Reel', 'Carousel', 'Static', 'Story']

function NewPostDrawer({ open, onClose, clientId, addContent, pushToast }) {
  const [plat, setPlat]     = useState('Instagram')
  const [ctype, setCtype]   = useState('Reel')
  const [caption, setCaption] = useState('')
  const [date, setDate]     = useState(isoToday())
  const [time, setTime]     = useState('09:00')
  const [status, setStatus] = useState('Scheduled')

  const reset = () => { setPlat('Instagram'); setCtype('Reel'); setCaption(''); setDate(isoToday()); setTime('09:00'); setStatus('Scheduled') }
  const save  = () => {
    if (!clientId) return
    addContent({ clientId, title: (caption || 'Untitled post').slice(0, 80), caption, platforms: [plat], contentType: ctype, status, scheduledDate: date, scheduledTime: time, createdAt: new Date().toISOString() })
    pushToast('Post saved!'); reset(); onClose()
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ width: 480, maxWidth: '95vw', background: CARD, overflowY: 'auto', padding: '28px 28px 40px', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={H2}>Create New Post</h2>
          <button onClick={onClose} style={XBTN}>✕</button>
        </div>
        <div>
          <label style={LBL}>Platform</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {PLATS.map(p => <button key={p} onClick={() => setPlat(p)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${plat === p ? PU : BD}`, background: plat === p ? `${PU}18` : 'transparent', color: plat === p ? PL : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{p}</button>)}
          </div>
        </div>
        <div><label style={LBL}>Content Type</label><select value={ctype} onChange={e => setCtype(e.target.value)} style={INP}>{CTYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <div><label style={LBL}>Caption</label><textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption here…" style={{ ...INP, resize: 'vertical', minHeight: 130 }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={LBL}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} style={INP} /></div>
        </div>
        <div><label style={LBL}>Status</label><select value={status} onChange={e => setStatus(e.target.value)} style={INP}><option>Draft</option><option>Scheduled</option></select></div>
        <button onClick={save} style={PBtn()}>Save Post</button>
      </div>
    </div>
  )
}

function BrandKitDrawer({ open, onClose, clientId }) {
  const [kit, setKit]               = useState(() => loadBrandKit(clientId))
  const [colorInput, setColorInput] = useState('#6C4CF1')
  const [colorHex, setColorHex]     = useState('')
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => { if (open) setKit(loadBrandKit(clientId)) }, [open, clientId])

  const upd = (changes) => { const next = { ...kit, ...changes }; setKit(next); saveBrandKit(clientId, next) }

  const addColor = () => {
    const val = (colorHex || colorInput).trim()
    if (!val) return
    upd({ colors: [...(kit.colors || []), val] })
    setColorHex('')
  }
  const addTopic = () => {
    if (!topicInput.trim()) return
    upd({ topics: [...(kit.topics || []), topicInput.trim()] })
    setTopicInput('')
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ width: 480, maxWidth: '95vw', background: CARD, overflowY: 'auto', padding: '28px 28px 40px', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={H2}>My Brand Kit</h2>
          <button onClick={onClose} style={XBTN}>✕</button>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Brand Colors</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {(kit.colors || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: BG, padding: '4px 10px', borderRadius: 8, border: `1px solid ${BD}` }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>{c}</span>
                <button onClick={() => upd({ colors: (kit.colors || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4503A', fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={colorInput} onChange={e => { setColorInput(e.target.value); setColorHex(e.target.value) }} style={{ width: 44, height: 40, padding: 2, border: `1.5px solid ${BD}`, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
            <input value={colorHex} onChange={e => setColorHex(e.target.value)} placeholder="#hex or colour name" style={{ ...INP, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addColor()} />
            <button onClick={addColor} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>Add</button>
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Voice & Tone</label>
          <textarea value={kit.voice || ''} onChange={e => upd({ voice: e.target.value })} placeholder="Describe your brand voice — warm, motivating, professional…" style={{ ...INP, resize: 'vertical', minHeight: 90 }} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={LBL}>Content Topics</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            {(kit.topics || []).map((t, i) => (
              <span key={i} style={{ padding: '4px 10px', borderRadius: 20, background: `${PU}18`, color: PL, fontSize: 12, fontWeight: 600, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                {t}
                <button onClick={() => upd({ topics: (kit.topics || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PL, fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={topicInput} onChange={e => setTopicInput(e.target.value)} placeholder="yoga, wellness, nutrition…" style={{ ...INP, flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') addTopic() }} />
            <button onClick={addTopic} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>Add</button>
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: 'rgba(74,124,92,0.15)', borderRadius: 10, color: '#5DA875', fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>
          Changes save automatically to this client's brand kit.
        </div>
      </div>
    </div>
  )
}

// ── PART 4: Intelligence Overlay ────────────────────────────────────────────────
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function IntelligenceOverlay({ open, onClose, clientId, client, addContent, pushToast }) {
  const [view, setView]       = useState('flow')
  const [hasPlan, setHasPlan] = useState(false)
  const [planData, setPlanData] = useState([])
  const [planSent, setPlanSent] = useState(false)

  useEffect(() => {
    if (!open || !clientId) return
    setView('flow'); setHasPlan(false); setPlanSent(false)
    const check = () => {
      const plan = getStoredPlan(clientId)
      if (plan.length > 0) { setHasPlan(true); setPlanData(plan) }
    }
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [open, clientId])

  const sendToCalendar = () => {
    planData.forEach((item, i) => {
      addContent({ clientId, title: (item.hookIdea || `Day ${item.day || i + 1}`).slice(0, 80), caption: item.hookIdea || '', platforms: ['Instagram'], contentType: item.contentType || 'Post', status: 'Draft', scheduledDate: offsetDate(i + 1), notes: item.description || '', createdAt: new Date().toISOString() })
    })
    setPlanSent(true)
    pushToast('7 days added to your calendar!')
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 200, overflowY: 'auto', fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: CARD, borderBottom: `1px solid ${BD}`, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Outfit',sans-serif" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        {client && <span style={{ fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif", fontWeight: 500, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{client.businessName} — Intelligence Flow</span>}
        <div style={{ display: 'flex', gap: 10 }}>
          {hasPlan && view === 'flow' && (
            <button onClick={() => setView('plan')} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>View Plan</button>
          )}
          {view === 'plan' && (
            <button onClick={() => setView('flow')} style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← Edit</button>
          )}
        </div>
      </div>

      {view === 'flow' && clientId && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 28px 60px' }}>
          <ClientIntelligence clientId={clientId} />
        </div>
      )}

      {view === 'plan' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ margin: '0 0 5px', fontSize: 26, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif" }}>Your 7-day plan is ready.</h2>
              <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: "'Outfit',sans-serif" }}>{client?.businessName} · Review and send to calendar.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setView('flow')} style={{ padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← Edit Plan</button>
              {planSent
                ? <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(74,124,92,0.15)', color: '#5DA875', fontSize: 13, fontWeight: 700, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Sent to Calendar
                  </div>
                : <button onClick={sendToCalendar} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Send to Calendar
                  </button>}
            </div>
          </div>
          {planData.length === 0
            ? <EmptyState icon="📅" msg="No plan generated yet." sub="Go back to the Intelligence Flow and run the Weekly Plan step." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 12, overflowX: 'auto' }}>
                {planData.map((item, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: R, padding: '18px 14px', border: `1px solid ${BD}`, boxShadow: SH, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: PL, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Outfit',sans-serif" }}>{DAY_NAMES[i] || `Day ${item.day || i + 1}`}</div>
                    <SPill s={item.contentType || 'Post'} sm />
                    <div style={{ fontSize: 13, fontWeight: 700, color: TX, lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>{item.hookIdea || '—'}</div>
                    {item.description && <p style={{ margin: 0, fontSize: 11.5, color: MI, lineHeight: 1.5, fontFamily: "'Outfit',sans-serif" }}>{item.description}</p>}
                  </div>
                ))}
              </div>}
        </div>
      )}
    </div>
  )
}

// ── PART 5: Home Tab ────────────────────────────────────────────────────────────
const IDEAS_BOARD = [
  { id: 1, topic: 'Morning Mindset',   emoji: '🌅', bg: `${PU}12` },
  { id: 2, topic: 'Quick Workout',     emoji: '💪', bg: 'rgba(245,114,42,0.12)' },
  { id: 3, topic: 'Transformation',    emoji: '✨', bg: 'rgba(74,124,92,0.12)' },
  { id: 4, topic: 'Client Story',      emoji: '❤️', bg: `${PU}10` },
  { id: 5, topic: 'Behind The Scenes', emoji: '🎬', bg: 'rgba(245,114,42,0.10)' },
  { id: 6, topic: 'Nutrition Tip',     emoji: '🥗', bg: 'rgba(200,154,26,0.12)' },
  { id: 7, topic: 'Motivation',        emoji: '🔥', bg: `${PU}12` },
  { id: 8, topic: 'Studio Tour',       emoji: '🏠', bg: 'rgba(74,124,92,0.12)' },
]

const QUICK_PLATS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']

function HomeTab({ client, content, addContent, onOpenNewPost, onOpenIntelligence, pushToast }) {
  const clientId = client?.id
  const [quickTopic,       setQuickTopic]       = useState('')
  const [quickPlatform,    setQuickPlatform]    = useState('Instagram')
  const [generating,       setGenerating]       = useState(false)
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [genError,         setGenError]         = useState('')

  const brandKit = useMemo(() => loadBrandKit(clientId), [clientId])
  const brandCtx = brandKit.voice ? `Brand voice: ${brandKit.voice}. ` : ''
  const topicCtx = brandKit.topics?.length ? `Content topics: ${brandKit.topics.join(', ')}. ` : ''

  const generate = async () => {
    if (!quickTopic.trim()) return
    if (!localStorage.getItem('pulse_anthropic_key')) { setGenError('NO_KEY'); return }
    setGenerating(true); setGenError(''); setGeneratedCaption('')
    try {
      const result = await callClaude([{ role: 'user', content: `${brandCtx}${topicCtx}Generate a ${quickPlatform} caption for ${client?.businessName || 'a brand'} about "${quickTopic}". Make it engaging, platform-appropriate, with hashtags. Return caption text only.` }], 600)
      setGeneratedCaption(typeof result === 'string' ? result : JSON.stringify(result))
    } catch (e) { setGenError(e.message === 'NO_KEY' ? 'NO_KEY' : e.message.slice(0, 120)) }
    setGenerating(false)
  }

  const saveAsDraft = () => {
    if (!generatedCaption || !clientId) return
    addContent({ clientId, title: (quickTopic || 'AI Post').slice(0, 80), caption: generatedCaption, platforms: [quickPlatform], contentType: 'Post', status: 'Draft', scheduledDate: isoToday(), createdAt: new Date().toISOString() })
    pushToast('Saved as draft!'); setGeneratedCaption(''); setQuickTopic('')
  }

  const copyText = (text) => navigator.clipboard?.writeText(text).then(() => pushToast('Copied!')).catch(() => pushToast('Copy failed', 'error'))

  const recentActivity = useMemo(() =>
    content.filter(c => c.clientId === clientId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 3),
    [content, clientId])

  return (
    <div>
      {/* Hero row — two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Hero: Create Weekly Plan */}
        <div
          onClick={onOpenIntelligence}
          style={{ background: `linear-gradient(135deg, ${PU} 0%, #3D27C0 100%)`, borderRadius: R, padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 190, boxShadow: `0 8px 32px ${PU}40`, transition: 'transform .15s, box-shadow .15s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${PU}55` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${PU}40` }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>🧠</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>Create Weekly Plan</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>Run the intelligence flow to generate a data-driven 7-day content strategy for this client.</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>
            Open Intelligence Flow
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        {/* Quick Content — inline AI */}
        <div style={{ background: CARD, borderRadius: R, padding: '22px 24px', border: `1px solid ${BD}`, boxShadow: SH }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Quick Content</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>Generate a caption instantly.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={quickTopic}
              onChange={e => { setQuickTopic(e.target.value); setGeneratedCaption(''); setGenError('') }}
              placeholder="What's the post about?"
              style={{ ...INP, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
            <select value={quickPlatform} onChange={e => setQuickPlatform(e.target.value)} style={{ ...INP, width: 118 }}>
              {QUICK_PLATS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={!quickTopic.trim() || generating} style={{ ...PBtn(PU), width: 'auto', padding: '9px 22px', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: (!quickTopic.trim() || generating) ? 0.55 : 1, marginBottom: (genError || generatedCaption) ? 12 : 0 }}>
            {generating ? <><Spin /> Generating…</> : '✦ Generate'}
          </button>
          {genError === 'NO_KEY' && (
            <div style={{ padding: '9px 12px', background: `${PU}12`, borderRadius: 9, color: PL, fontSize: 12, fontFamily: "'Outfit',sans-serif", marginTop: 10 }}>
              Add your Anthropic API key in <strong>Settings → Integrations</strong>.
            </div>
          )}
          {genError && genError !== 'NO_KEY' && <div style={{ padding: '9px 12px', background: 'rgba(196,80,58,0.15)', borderRadius: 9, color: '#C4503A', fontSize: 12, fontFamily: "'Outfit',sans-serif", marginTop: 10 }}>{genError}</div>}
          {generatedCaption && (
            <div style={{ marginTop: 10 }}>
              <textarea value={generatedCaption} onChange={e => setGeneratedCaption(e.target.value)} style={{ ...INP, resize: 'vertical', minHeight: 80, marginBottom: 8, fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveAsDraft} style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Save as Draft</button>
                <button onClick={() => copyText(generatedCaption)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Copy</button>
                <button onClick={() => setGeneratedCaption('')} style={{ padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creative Ideas Board */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 5px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Creative Ideas Board</h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Tap any card to auto-fill the topic above.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {IDEAS_BOARD.map(card => (
            <button
              key={card.id}
              onClick={() => { setQuickTopic(card.topic); setQuickPlatform('Instagram'); setGeneratedCaption(''); setGenError('') }}
              style={{ background: card.bg, borderRadius: 12, padding: '18px 16px', border: '1.5px solid transparent', cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit',sans-serif", transition: 'transform .15s, box-shadow .15s', boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${PU}28` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8, lineHeight: 1 }}>{card.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX, lineHeight: 1.3 }}>{card.topic}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Recent Activity</h3>
          <button onClick={onOpenNewPost} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${PU}`, background: 'transparent', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            + New Post
          </button>
        </div>
        {recentActivity.length === 0
          ? <EmptyState icon="📝" msg="No posts yet." sub="Create a post or generate content above to get started." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map(item => (
                <div key={item.id} style={{ background: CARD, borderRadius: 12, padding: '14px 18px', border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${PLAT_COL[item.platforms?.[0]] || PU}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlatDot p={item.platforms?.[0]} size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption || item.title || 'Untitled'}</div>
                    <div style={{ fontSize: 11.5, color: MI, marginTop: 3, fontFamily: "'Outfit',sans-serif" }}>{item.platforms?.[0]} · {fmtDate(item.scheduledDate)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <SPill s={item.contentType || 'Post'} sm />
                    <SPill s={item.status || 'Draft'} sm />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// ── PART 6: Analysis sub-tabs — Content Audit + Competitor Analysis ─────────────

function ContentAuditSubTab({ analysis, upd, client, pushToast }) {
  const [adding, setAdding]   = useState(false)
  const [form, setForm]       = useState({ description: '', platform: 'Instagram', contentType: 'Reel', views: '', likes: '', comments: '', saves: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [hasKey, setHasKey]   = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const savePost = () => {
    if (!form.description.trim()) return
    upd({ contentAudit: [...analysis.contentAudit, { id: `ca${Date.now()}`, ...form, views: Number(form.views) || 0, likes: Number(form.likes) || 0, comments: Number(form.comments) || 0, saves: Number(form.saves) || 0 }] })
    setForm({ description: '', platform: 'Instagram', contentType: 'Reel', views: '', likes: '', comments: '', saves: '', notes: '' })
    setAdding(false)
  }

  const runAnalysis = async () => {
    if (!hasKey) return
    setLoading(true)
    try {
      const prompt = `You are a social media analyst. Analyse only the data provided. Never give generic advice.\n\nReturn valid JSON only:\n{"patterns":"what content patterns exist","working":[{"finding":"observation","reasoning":"why it works"}],"notWorking":[{"finding":"observation","reasoning":"why it underperforms"}]}\n\nData: ${JSON.stringify({ client: client?.businessName, audit: analysis.contentAudit })}`
      const res = await callClaude([{ role: 'user', content: prompt }], 1000)
      upd({ contentResult: res })
      pushToast('Content analysis complete!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Content Audit</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Add your top posts, then run the analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasKey && analysis.contentAudit.length > 0 && <RunBtn label="Run Analysis" onClick={runAnalysis} loading={loading} />}
          <OutlineBtn label="+ Add Post" onClick={() => setAdding(true)} />
        </div>
      </div>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run AI analysis.</div>}
      {adding && (
        <div style={{ background: BG, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${BD}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Description / Caption</label><input value={form.description} onChange={e => f('description', e.target.value)} placeholder="What was this post about?" style={INP} /></div>
            <div><label style={LBL}>Platform</label><select value={form.platform} onChange={e => f('platform', e.target.value)} style={INP}>{PLATS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label style={LBL}>Content Type</label><select value={form.contentType} onChange={e => f('contentType', e.target.value)} style={INP}>{CTYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={LBL}>Views</label><input type="number" value={form.views} onChange={e => f('views', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Likes</label><input type="number" value={form.likes} onChange={e => f('likes', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Comments</label><input type="number" value={form.comments} onChange={e => f('comments', e.target.value)} placeholder="0" style={INP} /></div>
            <div><label style={LBL}>Saves</label><input type="number" value={form.saves} onChange={e => f('saves', e.target.value)} placeholder="0" style={INP} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Notes</label><input value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Any context about this post…" style={INP} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={savePost} style={{ ...PBtn(), width: 'auto', padding: '9px 22px' }}>Save Post</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
      {analysis.contentAudit.length === 0 && !adding
        ? <EmptyState icon="📊" msg="No posts added yet." sub="Add your top performing posts to run a content analysis." />
        : analysis.contentAudit.length > 0 && (
          <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit',sans-serif" }}>
              <thead><tr style={{ background: BG, borderBottom: `1px solid ${BD}` }}>{['Description', 'Platform', 'Type', 'Views', 'Likes', 'Comments', ''].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: MI, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>)}</tr></thead>
              <tbody>{analysis.contentAudit.map(post => (
                <tr key={post.id} style={{ borderBottom: `1px solid ${BD}` }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.description}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: MI }}>{post.platform}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: MI }}>{post.contentType}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX, fontWeight: 600 }}>{post.views?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX }}>{post.likes?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: TX }}>{post.comments?.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px' }}><button onClick={() => upd({ contentAudit: analysis.contentAudit.filter(p => p.id !== post.id) })} style={{ background: 'none', border: 'none', color: '#C4503A', cursor: 'pointer', fontSize: 13 }}>✕</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      {analysis.contentResult && (
        <div style={{ marginTop: 16, background: BG, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}` }}>
          <OutputRenderer data={analysis.contentResult} />
        </div>
      )}
    </div>
  )
}

function CompetitorAnalysisSubTab({ analysis, upd, pushToast }) {
  const [adding, setAdding]     = useState(false)
  const [compForm, setCompForm] = useState({ handle: '', platform: 'Instagram', niche: '' })
  const [postForms, setPostForms] = useState({})
  const [loading, setLoading]   = useState(false)
  const [hasKey, setHasKey]     = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const cf = (k, v) => setCompForm(p => ({ ...p, [k]: v }))

  const saveComp = () => {
    if (!compForm.handle.trim()) return
    upd({ competitors: [...analysis.competitors, { id: `comp${Date.now()}`, ...compForm, topPosts: [] }] })
    setCompForm({ handle: '', platform: 'Instagram', niche: '' }); setAdding(false)
  }

  const addPost = (compId) => {
    const pf = postForms[compId] || {}
    if (!pf.type) return
    upd({ competitors: analysis.competitors.map(c => c.id === compId ? { ...c, topPosts: [...(c.topPosts || []), { id: `tp${Date.now()}`, views: Number(pf.views) || 0, type: pf.type || '', hookStyle: pf.hookStyle || '' }] } : c) })
    setPostForms(p => ({ ...p, [compId]: {} }))
  }

  const runAnalysis = async () => {
    if (!hasKey) return
    setLoading(true)
    try {
      const prompt = `Analyse only the competitor data provided. Identify specific hook patterns, content formats and engagement triggers.\n\nReturn valid JSON only:\n{"formats":"common high-performing formats","hookPatterns":"hook patterns from top posts","videoStructure":"video structure trends","engagementTriggers":"what drives engagement"}\n\nData: ${JSON.stringify(analysis.competitors)}`
      const res = await callClaude([{ role: 'user', content: prompt }], 800)
      upd({ competitorResult: res })
      pushToast('Competitor analysis complete!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Competitor Analysis</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Add competitors and their top posts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasKey && analysis.competitors.length > 0 && <RunBtn label="Run Analysis" onClick={runAnalysis} loading={loading} />}
          <OutlineBtn label="+ Add Competitor" onClick={() => setAdding(true)} />
        </div>
      </div>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run AI analysis.</div>}
      {adding && (
        <div style={{ background: BG, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${BD}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={LBL}>Handle / Name</label><input value={compForm.handle} onChange={e => cf('handle', e.target.value)} placeholder="@handle" style={INP} /></div>
            <div><label style={LBL}>Platform</label><select value={compForm.platform} onChange={e => cf('platform', e.target.value)} style={INP}>{PLATS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label style={LBL}>Niche</label><input value={compForm.niche} onChange={e => cf('niche', e.target.value)} placeholder="e.g. yoga studio" style={INP} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveComp} style={{ ...PBtn(), width: 'auto', padding: '9px 22px' }}>Add Competitor</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
      {analysis.competitors.length === 0 && !adding
        ? <EmptyState icon="🔍" msg="No competitors added yet." sub="Add competitors to analyse their content strategy." />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {analysis.competitors.map(comp => (
              <div key={comp.id} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BD}`, background: BG }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PlatDot p={comp.platform} size={10} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{comp.handle}</span>
                    <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>{comp.platform} · {comp.niche}</span>
                  </div>
                  <button onClick={() => upd({ competitors: analysis.competitors.filter(c => c.id !== comp.id) })} style={{ background: 'none', border: 'none', color: '#C4503A', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>Remove</button>
                </div>
                <div style={{ padding: '14px 18px' }}>
                  {(comp.topPosts || []).map((post, i) => (
                    <div key={post.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6, padding: '7px 10px', background: BG, borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif", width: 20 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif" }}>{post.type}</span>
                      {post.hookStyle && <span style={{ fontSize: 11, color: PL, fontFamily: "'Outfit',sans-serif" }}>{post.hookStyle}</span>}
                      {post.views > 0 && <span style={{ fontSize: 11, color: MI, fontFamily: "'Outfit',sans-serif" }}>{post.views.toLocaleString()} views</span>}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <select value={postForms[comp.id]?.type || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), type: e.target.value } }))} style={{ ...INP, width: 110 }}><option value="">Type…</option>{CTYPES.map(t => <option key={t}>{t}</option>)}</select>
                    <input placeholder="Hook style" value={postForms[comp.id]?.hookStyle || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), hookStyle: e.target.value } }))} style={{ ...INP, width: 120 }} />
                    <input type="number" placeholder="Views" value={postForms[comp.id]?.views || ''} onChange={e => setPostForms(p => ({ ...p, [comp.id]: { ...(p[comp.id] || {}), views: e.target.value } }))} style={{ ...INP, width: 90 }} />
                    <button onClick={() => addPost(comp.id)} style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>Add Post</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {analysis.competitorResult && (
        <div style={{ marginTop: 16, background: BG, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}` }}>
          <OutputRenderer data={analysis.competitorResult} />
        </div>
      )}
    </div>
  )
}

// ── PART 7: Analysis sub-tabs — Strategy + Output + AnalysisTab wrapper ─────────

function StrategySubTab({ analysis, upd, pushToast }) {
  const [loadingMap, setLoadingMap] = useState({})
  const [hasKey, setHasKey]         = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const OBJECTIVES = ['Engagement', 'Reach', 'DMs', 'Testing Reels', 'Lead Gen', 'Brand Awareness']

  const run = async (key, prompt, maxTokens = 900) => {
    if (!hasKey) return
    setLoadingMap(l => ({ ...l, [key]: true }))
    try {
      const res = await callClaude([{ role: 'user', content: prompt }], maxTokens)
      upd({ [key]: res })
      pushToast('Generated!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoadingMap(l => ({ ...l, [key]: false }))
  }

  const ctx      = JSON.stringify({ contentPatterns: analysis.contentResult, competitorInsights: analysis.competitorResult, weeklyObjective: analysis.weeklyObjective })
  const mergeP   = `You are a social media strategist. Merge the content and competitor findings. Base everything strictly on the provided data.\n\nReturn valid JSON only:\n{"whatToDo":["action 1","action 2","action 3"],"whatToAvoid":["avoid 1","avoid 2"],"contentDirection":"recommended content direction"}\n\nData: ${ctx}`
  const formatP  = `Define format rules based on this client's brand and strategy data.\n\nReturn valid JSON only:\n{"formatType":"best content format","hookType":"best hook type","idealLength":"ideal length with reasoning","style":"visual style and why"}\n\nData: ${JSON.stringify({ strategy: analysis.strategyResult, weeklyObjective: analysis.weeklyObjective })}`
  const execP    = `Define execution rules for this client. No generic advice.\n\nReturn valid JSON only:\n{"postingFrequency":"recommended frequency with reasoning","contentMix":"content mix ratio","toneGuidance":"specific tone guidance","ctaStyle":"CTA style"}\n\nData: ${JSON.stringify({ strategy: analysis.strategyResult, formatRules: analysis.formatRules })}`

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Strategy</h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Merge your analysis into a clear strategic direction.</p>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to run strategy generation.</div>}
      <AIBlock title="Merge Insights" desc="What to do, what to avoid, and your content direction — merged from content and competitor findings." onRun={() => run('strategyResult', mergeP)} loading={!!loadingMap.strategyResult} output={analysis.strategyResult} hasKey={hasKey} />
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '18px 20px', marginBottom: 14 }}>
        <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Weekly Objective</h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>What are we focusing on this week?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
          {OBJECTIVES.map(o => <button key={o} onClick={() => upd({ weeklyObjective: analysis.weeklyObjective === o ? '' : o })} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", border: `1.5px solid ${analysis.weeklyObjective === o ? PU : BD}`, background: analysis.weeklyObjective === o ? `${PU}18` : 'transparent', color: analysis.weeklyObjective === o ? PL : MI }}>{o}</button>)}
        </div>
        <input value={!OBJECTIVES.includes(analysis.weeklyObjective) ? analysis.weeklyObjective : ''} onChange={e => upd({ weeklyObjective: e.target.value })} placeholder="Or type a custom objective…" style={{ ...INP, width: 280 }} />
      </div>
      <AIBlock title="Generate Format Rules" desc="Best format type, hook type, ideal length, and visual style based on your brand and strategy." onRun={() => run('formatRules', formatP)} loading={!!loadingMap.formatRules} output={analysis.formatRules} hasKey={hasKey} />
      <AIBlock title="Generate Execution Rules" desc="Posting frequency, content mix, tone guidance, and CTA style derived from your client's data." onRun={() => run('executionRules', execP)} loading={!!loadingMap.executionRules} output={analysis.executionRules} hasKey={hasKey} />
    </div>
  )
}

function OutputSubTab({ analysis, upd, clientId, addContent, pushToast, onGoToCalendar }) {
  const [loadingMap, setLoadingMap] = useState({})
  const [hasKey, setHasKey]         = useState(() => !!localStorage.getItem('pulse_anthropic_key'))
  const [planSent, setPlanSent]     = useState(false)

  const run = async (key, prompt, maxTokens = 1200) => {
    if (!hasKey) return
    setLoadingMap(l => ({ ...l, [key]: true }))
    try {
      const res = await callClaude([{ role: 'user', content: prompt }], maxTokens)
      upd({ [key]: res })
      pushToast('Generated!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast(e.message.slice(0, 80), 'error')
    }
    setLoadingMap(l => ({ ...l, [key]: false }))
  }

  const ctx     = JSON.stringify({ strategy: analysis.strategyResult, formatRules: analysis.formatRules, executionRules: analysis.executionRules, weeklyObjective: analysis.weeklyObjective })
  const pillarP = `Generate 4–6 content pillars for this client. Each must be tied to their brand, audience, and goals.\n\nReturn valid JSON array only:\n[{"name":"pillar name","description":"what this covers","whyItWorks":"why this works for THIS client","examples":["example 1","example 2"]}]\n\nData: ${ctx}`
  const ideasP  = `Generate 15 content ideas based strictly on the pillars, brand, and audience. Short and actionable.\n\nReturn valid JSON array only:\n[{"pillar":"pillar name","idea":"short actionable idea","contentType":"Reel or Carousel or Static or Story"}]\n\nData: ${JSON.stringify({ ...JSON.parse(ctx), pillars: analysis.pillars })}`
  const planP   = `Generate a 7-day content plan based strictly on the client's strategy and pillars.\n\nReturn valid JSON array of exactly 7 items:\n[{"day":1,"contentType":"Reel","hookIdea":"short hook","description":"brief description"}]\n\nData: ${JSON.stringify({ ...JSON.parse(ctx), pillars: analysis.pillars, ideas: analysis.ideas })}`

  const sendToCalendar = () => {
    if (!analysis.weeklyPlan?.length) return
    analysis.weeklyPlan.forEach((item, i) => {
      addContent({ clientId, title: (item.hookIdea || `Day ${item.day || i + 1}`).slice(0, 80), caption: item.hookIdea || '', platforms: ['Instagram'], contentType: item.contentType || 'Post', status: 'Draft', scheduledDate: offsetDate(i + 1), notes: item.description || '', createdAt: new Date().toISOString() })
    })
    setPlanSent(true)
    pushToast('7 days added to your calendar!')
    setTimeout(() => onGoToCalendar(), 800)
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Output</h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Turn your strategy into content pillars, ideas, and a 7-day plan.</p>
      {!hasKey && <div style={{ padding: '11px 14px', background: `${PU}12`, borderRadius: 10, color: PL, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>Add your Anthropic API key in Settings to generate output.</div>}
      <AIBlock title="Generate Content Pillars" desc="4–6 content pillars tied to your client's brand, audience, and goals." onRun={() => run('pillars', pillarP)} loading={!!loadingMap.pillars} output={analysis.pillars?.length ? analysis.pillars : null} hasKey={hasKey} />
      {analysis.pillars?.length > 0 && <AIBlock title="Generate Ideas Bank" desc="15 short, actionable content ideas mapped to your pillars." onRun={() => run('ideas', ideasP)} loading={!!loadingMap.ideas} output={analysis.ideas?.length ? analysis.ideas : null} hasKey={hasKey} />}
      {analysis.ideas?.length > 0 && (
        <>
          <AIBlock title="Generate 7-Day Plan" desc="A 7-day action plan — each day has a content type, hook idea, and short description." onRun={() => run('weeklyPlan', planP)} loading={!!loadingMap.weeklyPlan} output={null} hasKey={hasKey} />
          {analysis.weeklyPlan?.length > 0 && (
            <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>7-Day Plan</h4>
                {planSent
                  ? <span style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(74,124,92,0.15)', color: '#5DA875', fontSize: 13, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Sent to Calendar</span>
                  : <button onClick={sendToCalendar} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Send to Calendar →</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                {analysis.weeklyPlan.map((item, i) => (
                  <div key={i} style={{ background: BG, borderRadius: 10, padding: '12px 12px', border: `1px solid ${BD}` }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: PL, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>Day {item.day || i + 1}</div>
                    <SPill s={item.contentType || 'Post'} sm />
                    <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginTop: 8, lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>{item.hookIdea}</div>
                    {item.description && <p style={{ margin: '6px 0 0', fontSize: 10.5, color: MI, lineHeight: 1.45, fontFamily: "'Outfit',sans-serif" }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AnalysisTab({ analysis, upd, clientId, client, content, addContent, pushToast, onGoToCalendar }) {
  const [subTab, setSubTab] = useState('audit')
  const ANALYSIS_TABS = [
    { id: 'audit',       label: 'Content Audit' },
    { id: 'competitors', label: 'Competitor Analysis' },
    { id: 'strategy',    label: 'Strategy' },
    { id: 'output',      label: 'Output' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${BD}`, marginBottom: 28 }}>
        {ANALYSIS_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: '9px 20px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: subTab === t.id ? TX : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", borderBottom: subTab === t.id ? `2px solid ${PU}` : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'audit'       && <ContentAuditSubTab analysis={analysis} upd={upd} client={client} pushToast={pushToast} />}
      {subTab === 'competitors' && <CompetitorAnalysisSubTab analysis={analysis} upd={upd} pushToast={pushToast} />}
      {subTab === 'strategy'    && <StrategySubTab analysis={analysis} upd={upd} pushToast={pushToast} />}
      {subTab === 'output'      && <OutputSubTab analysis={analysis} upd={upd} clientId={clientId} addContent={addContent} pushToast={pushToast} onGoToCalendar={onGoToCalendar} />}
    </div>
  )
}

// ── PART 8: Calendar Tab ────────────────────────────────────────────────────────

function CalendarTab({ clientId, clients, content, updateContent, pushToast }) {
  const [editId, setEditId]     = useState(null)
  const [editForm, setEditForm] = useState({})

  const items = useMemo(() =>
    content.filter(c => c.clientId === clientId)
      .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || '')),
    [content, clientId])

  const grouped = useMemo(() => {
    const map = {}
    items.forEach(item => { const key = item.scheduledDate?.slice(0, 7) || 'no-date'; if (!map[key]) map[key] = []; map[key].push(item) })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  const startEdit = (item) => { setEditId(item.id); setEditForm({ status: item.status || 'Draft', scheduledDate: item.scheduledDate || isoToday(), scheduledTime: item.scheduledTime || '' }) }
  const saveEdit  = (id)   => { updateContent(id, editForm); pushToast('Post updated!'); setEditId(null) }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Content Calendar</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{clients.find(c => c.id === clientId)?.businessName || '—'}</p>
        </div>
      </div>
      {items.length === 0
        ? <EmptyState icon="📅" msg="No posts scheduled yet." sub="Create posts from the Home tab to see them here." />
        : grouped.map(([month, monthItems]) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: BD }} />{fmtMon(month)}<div style={{ flex: 1, height: 1, background: BD }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthItems.map(item => {
                const isEditing = editId === item.id
                return (
                  <div key={item.id} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 9, background: `${PLAT_COL[item.platforms?.[0]] || PU}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PlatDot p={item.platforms?.[0]} size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption || item.title || 'Untitled'}</div>
                        <div style={{ fontSize: 11.5, color: MI, marginTop: 3, fontFamily: "'Outfit',sans-serif" }}>{item.platforms?.[0]} · {fmtDate(item.scheduledDate)}{item.scheduledTime ? ` at ${item.scheduledTime}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <SPill s={item.contentType || 'Post'} sm />
                        <SPill s={item.status || 'Draft'} sm />
                        <button onClick={() => isEditing ? setEditId(null) : startEdit(item)} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{isEditing ? 'Cancel' : 'Edit'}</button>
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ borderTop: `1px solid ${BD}`, padding: '14px 18px', background: BG, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div><label style={LBL}>Status</label><select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...INP, width: 160 }}>{Object.keys(STAT_MAP).map(s => <option key={s}>{s}</option>)}</select></div>
                        <div><label style={LBL}>Date</label><input type="date" value={editForm.scheduledDate} onChange={e => setEditForm(f => ({ ...f, scheduledDate: e.target.value }))} style={{ ...INP, width: 160 }} /></div>
                        <div><label style={LBL}>Time</label><input type="time" value={editForm.scheduledTime} onChange={e => setEditForm(f => ({ ...f, scheduledTime: e.target.value }))} style={{ ...INP, width: 140 }} /></div>
                        <button onClick={() => saveEdit(item.id)} style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Save Changes</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}

// ── PART 9: Main SocialMediaPage ────────────────────────────────────────────────

export default function SocialMediaPage() {
  const { clients } = useClients()
  const { content, metrics, addContent, updateContent } = useSocialData()
  const { toasts, push: pushToast } = useToast()

  const [selectedId,       setSelectedId]       = useState(null)
  const [activeTab,        setActiveTab]         = useState('home')
  const [showNewPost,      setShowNewPost]       = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showBrandKit,     setShowBrandKit]      = useState(false)
  const [showCreateMenu,   setShowCreateMenu]    = useState(false)
  const [showKeyModal,     setShowKeyModal]      = useState(false)

  const activeClients = useMemo(() => clients.filter(c => c.status !== 'Churned'), [clients])
  const client        = useMemo(() => clients.find(c => c.id === selectedId) || null, [clients, selectedId])

  // Per-client analysis state
  const [analysis, setAnalysis] = useState(defAnalysis)
  useEffect(() => {
    setAnalysis(selectedId ? loadAnalysis(selectedId) : defAnalysis())
  }, [selectedId])

  const updAnalysis = useCallback((changes) => {
    setAnalysis(prev => {
      const next = { ...prev, ...changes }
      if (selectedId) saveAnalysis(selectedId, next)
      return next
    })
  }, [selectedId])

  // Stat cards
  const clientContent = useMemo(() => content.filter(c => c.clientId === selectedId), [content, selectedId])
  const clientMetrics = useMemo(() => metrics.filter(m => m.clientId === selectedId), [metrics, selectedId])
  const statScheduled = useMemo(() => clientContent.filter(c => c.status === 'Scheduled').length, [clientContent])
  const statLive      = useMemo(() => clientContent.filter(c => c.status === 'Live' && c.scheduledDate?.startsWith(thisMonth())).length, [clientContent])
  const statPending   = useMemo(() => clientContent.filter(c => c.status === 'Pending Approval').length, [clientContent])
  const statEngRate   = useMemo(() => {
    if (!clientMetrics.length) return null
    return (clientMetrics.reduce((s, m) => s + (m.engagementRate || 0), 0) / clientMetrics.length).toFixed(1)
  }, [clientMetrics])

  const openIntelligence = () => {
    if (selectedId && client) preFillIntelligence(selectedId, client)
    setShowIntelligence(true)
  }
  const goToCalendar = () => setActiveTab('calendar')

  const TABS = [
    { id: 'home',     label: 'Home' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'calendar', label: 'Calendar' },
  ]

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: BG, minHeight: '100vh' }}>
      <div style={{ padding: '28px 32px 0', maxWidth: 1300 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: '0 0 3px', fontFamily: "'Outfit',sans-serif" }}>Social Media Management</h1>
            <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          {selectedId && (
            <button onClick={() => setShowBrandKit(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'transparent', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
              🎨 My Brand Kit
            </button>
          )}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowCreateMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 16px ${PU}50` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create New
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showCreateMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowCreateMenu(false)} />
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: CARD, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: `1px solid ${BD}`, zIndex: 99, minWidth: 175, overflow: 'hidden' }}>
                  {[
                    { icon: '📝', label: 'New Post',   action: () => { setShowNewPost(true); setShowCreateMenu(false) } },
                    { icon: '🧠', label: 'New Plan',   action: () => { openIntelligence(); setShowCreateMenu(false) } },
                    { icon: '✅', label: 'New Task',   action: () => setShowCreateMenu(false) },
                    { icon: '📋', label: 'New Report', action: () => setShowCreateMenu(false) },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, color: TX, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = BG}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Client selector */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Select Client</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {activeClients.map(c => {
              const isSel       = selectedId === c.id
              const displayName = c.businessName || c.name || 'Client'
              const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, border: `2px solid ${isSel ? PU : BD}`, background: isSel ? `${PU}12` : CARD, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all .15s', boxShadow: isSel ? `0 0 0 3px ${PU}20` : SH, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSel ? PU : `${PU}20`, color: isSel ? '#fff' : PL, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isSel ? PL : TX }}>{displayName}</div>
                    <div style={{ fontSize: 11, color: MI, marginTop: 1 }}>{c.businessType}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {!selectedId && <p style={{ margin: '10px 0 0', fontSize: 13, color: `${PL}90`, fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>Select a client to get started</p>}
        </div>

        {/* Stat cards */}
        {selectedId && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            {[
              { label: 'Total Scheduled', value: statScheduled, color: PL, iconBg: `${PU}18`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PL} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { label: 'Live This Month', value: statLive, color: OR, iconBg: 'rgba(245,114,42,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
              { label: 'Avg Engagement', value: statEngRate != null ? `${statEngRate}%` : '—', color: '#5DA875', iconBg: 'rgba(74,124,92,0.1)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5DA875" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { label: 'Pending Approval', value: statPending, color: YL, iconBg: 'rgba(200,154,26,0.12)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={YL} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
            ].map(sc => (
              <div key={sc.label} style={{ background: CARD, borderRadius: R, padding: '16px 18px', boxShadow: SH, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{sc.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>{sc.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: sc.color, fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>{sc.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${BD}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 28px', borderRadius: '9px 9px 0 0', fontSize: 14, fontWeight: 600, border: 'none', background: 'transparent', color: activeTab === t.id ? TX : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", borderBottom: activeTab === t.id ? `2px solid ${PU}` : '2px solid transparent', marginBottom: -2 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '28px 32px 60px', maxWidth: 1280 }}>
        {!selectedId
          ? <div style={{ background: CARD, borderRadius: R, padding: '64px 32px', textAlign: 'center', boxShadow: SH, border: `1px solid ${BD}` }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📱</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif" }}>Select a client to get started</h2>
              <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: "'Outfit',sans-serif" }}>Choose a client from the selector above to view their social media workspace.</p>
            </div>
          : <>
              {activeTab === 'home' && (
                <HomeTab
                  client={client}
                  content={content}
                  addContent={addContent}
                  onOpenNewPost={() => setShowNewPost(true)}
                  onOpenIntelligence={openIntelligence}
                  pushToast={pushToast}
                />
              )}
              {activeTab === 'analysis' && (
                <AnalysisTab
                  analysis={analysis}
                  upd={updAnalysis}
                  clientId={selectedId}
                  client={client}
                  content={content}
                  addContent={addContent}
                  pushToast={pushToast}
                  onGoToCalendar={goToCalendar}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarTab
                  clientId={selectedId}
                  clients={clients}
                  content={content}
                  updateContent={updateContent}
                  pushToast={pushToast}
                />
              )}
            </>}
      </div>

      {/* Drawers & overlays */}
      <NewPostDrawer open={showNewPost} onClose={() => setShowNewPost(false)} clientId={selectedId} addContent={addContent} pushToast={pushToast} />
      <BrandKitDrawer open={showBrandKit} onClose={() => setShowBrandKit(false)} clientId={selectedId} />
      <IntelligenceOverlay open={showIntelligence} onClose={() => setShowIntelligence(false)} clientId={selectedId} client={client} addContent={addContent} pushToast={pushToast} />
      <APIKeyModal open={showKeyModal} onClose={() => setShowKeyModal(false)} />
      <ToastBox toasts={toasts} />

      <style>{`
        @keyframes tsIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin  { to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}
