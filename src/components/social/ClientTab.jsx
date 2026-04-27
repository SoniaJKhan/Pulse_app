import React, { useState } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, R, SH, LBL, INP, PLATS } from './socialUtils.jsx'

const EMPTY = {
  clientName: '', businessType: '', platforms: [], handles: {},
  contentGoal: '', postingFrequency: '', primaryObjective: '',
}

export default function ClientTab({ onClientSaved, pushToast }) {
  const [form, setForm]         = useState(EMPTY)
  const [photo, setPhoto]       = useState(null)
  const [igHandle, setIgHandle] = useState('')
  const [fetching, setFetching] = useState(false)
  const [saved, setSaved]       = useState(false)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const togglePlat = (p) =>
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }))

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const fetchPhoto = () => {
    const handle = igHandle.trim().replace(/^@/, '')
    if (!handle) return
    setFetching(true)
    setPhoto(`https://unavatar.io/instagram/${handle}`)
    setFetching(false)
  }

  const save = () => {
    if (!form.clientName.trim()) { pushToast?.('Client name is required', 'error'); return }
    const existing = (() => { try { return JSON.parse(localStorage.getItem('pulse_clients') || '[]') } catch { return [] } })()
    const client = {
      id: Date.now(),
      name: form.clientName.trim(),
      businessName: form.clientName.trim(),
      businessType: form.businessType,
      platforms: form.platforms,
      handles: form.handles,
      contentGoal: form.contentGoal,
      postingFrequency: form.postingFrequency,
      primaryObjective: form.primaryObjective,
      profilePhoto: photo,
      brandKit: null, audit: null, competitors: null, analysis: null, strategy: null,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('pulse_clients', JSON.stringify([...existing, client]))
    onClientSaved?.(client)
    setSaved(true)
    pushToast?.('Client saved successfully')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ background: CARD, borderRadius: R, padding: '28px 32px', boxShadow: SH, border: `1px solid ${BD}` }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>New Client Profile</h3>

        {/* Profile photo */}
        <div style={{ marginBottom: 24 }}>
          <label style={LBL}>Profile Photo</label>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${PU}20`, border: `2px solid ${BD}`, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photo
                ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setPhoto(null)} />
                : <span style={{ fontSize: 28 }}>👤</span>}
            </div>
            <div style={{ display: 'flex', gap: 20, flex: 1, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MI, marginBottom: 7, fontFamily: "'Outfit',sans-serif", letterSpacing: '.05em' }}>UPLOAD PHOTO</div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${BD}`, background: BG, color: PL, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MI, marginBottom: 7, fontFamily: "'Outfit',sans-serif", letterSpacing: '.05em' }}>FETCH FROM INSTAGRAM</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={igHandle} onChange={e => setIgHandle(e.target.value)} placeholder="@handle" style={{ ...INP, flex: 1 }} onKeyDown={e => e.key === 'Enter' && fetchPhoto()} />
                  <button onClick={fetchPhoto} disabled={fetching} style={{ padding: '8px 13px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>
                    {fetching ? '…' : 'Fetch Photo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client name */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Client / Business Name *</label>
          <input value={form.clientName} onChange={e => upd('clientName', e.target.value)} placeholder="e.g. Pulse Fitness Studio" style={INP} />
        </div>

        {/* Business type */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Business Type</label>
          <input value={form.businessType} onChange={e => upd('businessType', e.target.value)} placeholder="e.g. Fitness Studio, Restaurant, Boutique…" style={INP} />
        </div>

        {/* Platforms */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Platforms</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATS.map(p => {
              const sel = form.platforms.includes(p)
              return (
                <button key={p} onClick={() => togglePlat(p)} style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${sel ? PU : BD}`, background: sel ? `${PU}15` : BG, color: sel ? PL : MI, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Handles per platform */}
        {form.platforms.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label style={LBL}>Social Handles</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.platforms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: MI, width: 90, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{p}</span>
                  <input value={form.handles[p] || ''} onChange={e => upd('handles', { ...form.handles, [p]: e.target.value })} placeholder={`@${p.toLowerCase()}handle`} style={{ ...INP, flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content goal */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Content Goal</label>
          <input value={form.contentGoal} onChange={e => upd('contentGoal', e.target.value)} placeholder="e.g. Grow brand awareness, increase bookings…" style={INP} />
        </div>

        {/* Posting frequency */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Posting Frequency</label>
          <select value={form.postingFrequency} onChange={e => upd('postingFrequency', e.target.value)} style={INP}>
            <option value="">Select frequency…</option>
            {['Daily', '5× per week', '3× per week', '2× per week', 'Weekly', 'Bi-weekly'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        {/* Primary objective */}
        <div style={{ marginBottom: 28 }}>
          <label style={LBL}>Primary Objective</label>
          <textarea value={form.primaryObjective} onChange={e => upd('primaryObjective', e.target.value)} placeholder="What is the main goal for this client's social media presence?" style={{ ...INP, resize: 'vertical', minHeight: 80 }} />
        </div>

        <button onClick={save} style={{ padding: '12px 28px', borderRadius: 11, border: 'none', background: saved ? '#4A7C5C' : PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 16px ${PU}40`, transition: 'background .2s' }}>
          {saved ? '✓ Client Saved!' : 'Save Client'}
        </button>
      </div>
    </div>
  )
}
