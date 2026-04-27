import React, { useState, useCallback } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────────
export const BG   = '#F7F5FF'
export const CARD = '#FFFFFF'
export const PU   = '#F97316'
export const PL   = '#7C3AED'
export const GR   = '#4A7C5C'
export const OR   = '#F97316'
export const YL   = '#C89A1A'
export const TX   = '#1A1A1A'
export const MI   = '#6B7280'
export const BD   = '#F0EDFF'
export const R    = '14px'
export const SH   = '0 2px 20px rgba(0,0,0,0.07)'

// ── Anthropic API ──────────────────────────────────────────────────────────────
export async function callClaude(messages, maxTokens = 1400) {
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
export const defAnalysis = () => ({
  contentAudit: [], competitors: [], contentResult: null, competitorResult: null,
  strategyResult: null, formatRules: null, executionRules: null,
  pillars: [], ideas: [], weeklyPlan: [], weeklyObjective: '',
})
export const loadAnalysis = cid => { try { const r = localStorage.getItem(`pulse_analysis_${cid}`); return r ? JSON.parse(r) : defAnalysis() } catch { return defAnalysis() } }
export const saveAnalysis = (cid, d) => { try { localStorage.setItem(`pulse_analysis_${cid}`, JSON.stringify(d)) } catch {} }
export const loadBrandKit = cid => {
  try {
    const newKey = `pulse_brand_${cid}`
    const stored = localStorage.getItem(newKey)
    if (stored) return JSON.parse(stored)
    // migrate from old key
    const oldStored = localStorage.getItem(`pulse_brand_kit_${cid}`)
    if (oldStored) {
      const data = JSON.parse(oldStored)
      localStorage.setItem(newKey, JSON.stringify(data))
      localStorage.removeItem(`pulse_brand_kit_${cid}`)
      return data
    }
    return {}
  } catch { return {} }
}
export const saveBrandKit = (cid, d) => { try { localStorage.setItem(`pulse_brand_${cid}`, JSON.stringify(d)) } catch {} }

export function getStoredPlan(cid) {
  try { const r = localStorage.getItem('pulse_client_intelligence'); return r ? (JSON.parse(r)[cid]?.aiOutputs?.weeklyPlan || []) : [] } catch { return [] }
}
export function preFillIntelligence(cid, client) {
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
export function useToast() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return { toasts, push }
}
export function ToastBox({ toasts }) {
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
export const PLAT_COL = { Instagram: '#E1306C', TikTok: '#69C9D0', YouTube: '#FF0000', LinkedIn: '#0A66C2', Facebook: '#1877F2' }
export const STAT_MAP = {
  Scheduled: { bg: `${PU}22`, c: PL },
  Draft: { bg: 'rgba(255,255,255,0.08)', c: MI },
  Live: { bg: 'rgba(74,124,92,0.15)', c: '#5DA875' },
  'Pending Approval': { bg: 'rgba(200,154,26,0.15)', c: YL },
  'Changes Requested': { bg: 'rgba(196,80,58,0.15)', c: '#C4503A' },
  Overdue: { bg: 'rgba(196,80,58,0.15)', c: '#C4503A' },
}

export function SPill({ s, sm }) {
  const c = STAT_MAP[s] || { bg: 'rgba(255,255,255,0.08)', c: MI }
  return <span style={{ display: 'inline-block', padding: sm ? '2px 8px' : '3px 10px', borderRadius: 20, fontSize: sm ? 10 : 11, fontWeight: 700, background: c.bg, color: c.c, fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>{s}</span>
}
export function PlatDot({ p, size = 9 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: PLAT_COL[p] || MI, display: 'inline-block', flexShrink: 0 }} />
}

export function isoToday() { return new Date().toISOString().slice(0, 10) }
export function thisMonth() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}` }
export function fmtDate(iso) { if (!iso) return '—'; return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
export function fmtMon(ym) { if (!ym || ym === 'no-date') return 'No Date'; const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
export function offsetDate(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

// ── Micro-styles ────────────────────────────────────────────────────────────────
export const H2   = { margin: 0, fontSize: 18, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }
export const LBL  = { display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: "'Outfit',sans-serif" }
export const INP  = { width: '100%', boxSizing: 'border-box', padding: '10px 13px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 13.5, fontFamily: "'Outfit',sans-serif", color: TX, background: BG, outline: 'none' }
export const XBTN = { background: 'none', border: 'none', cursor: 'pointer', color: MI, fontSize: 18, lineHeight: 1, padding: 4 }
export const PBtn = (bg = PU) => ({ padding: '11px', borderRadius: 11, border: 'none', background: bg, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", width: '100%' })

// ── Utility components ──────────────────────────────────────────────────────────
export function Spin() { return <div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} /> }

export function EmptyState({ icon, msg, sub }) {
  return (
    <div style={{ background: CARD, borderRadius: R, padding: '48px 24px', border: `1px solid ${BD}`, textAlign: 'center', boxShadow: SH }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{msg}</p>
      <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{sub}</p>
    </div>
  )
}
export function RunBtn({ label, onClick, loading }) {
  return <button onClick={onClick} disabled={loading} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", opacity: loading ? 0.65 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>{loading && <Spin />}{label}</button>
}
export function OutlineBtn({ label, onClick }) {
  return <button onClick={onClick} style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{label}</button>
}

export function APIKeyModal({ open, onClose, onSaved }) {
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

export function OutputRenderer({ data }) {
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

export function AIBlock({ title, desc, onRun, loading, output, hasKey }) {
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

export const PLATS    = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']
export const CTYPES   = ['Reel', 'Carousel', 'Static', 'Story']
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
