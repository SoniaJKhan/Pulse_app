import React, { useState, useEffect, useCallback } from 'react'
import { BG, CARD, PU, PL, MI, BD, TX, R, SH, LBL, INP, PLATS } from './socialUtils.jsx'

const BIZ_TYPES = [
  'Yoga Studio', 'Pilates Studio', 'Gym', 'Spa', 'Wellness Clinic',
  'Mindfulness Centre', 'Retreat Centre', 'Personal Training Studio',
  'Nutrition Coaching', 'Beauty & Aesthetics', 'Dental Clinic',
  'Chiropractic', 'Physiotherapy', 'Dance Studio', 'Other',
]
const CONTENT_GOALS    = ['Growth', 'Engagement', 'Leads', 'Sales', 'Brand Awareness', 'Community Building']
const FREQUENCIES      = ['Daily', '5x per week', '3x per week', '2x per week', 'Weekly', 'Bi-weekly']
const PACKAGES         = ['Starter', 'Growth', 'Full Service']
const CONTRACT_TYPES   = ['Monthly Retainer', 'Project Based', 'Trial']
const BUDGETS          = ['Under $500', '$500-$1,000', '$1,000-$3,000', '$3,000+']
const TIMEZONES        = [
  'GMT-8 Pacific', 'GMT-7 Mountain', 'GMT-6 Central', 'GMT-5 Eastern',
  'GMT+0 London', 'GMT+1 Europe', 'GMT+4 Dubai', 'GMT+5 Pakistan',
  'GMT+5:30 India', 'GMT+8 Singapore', 'GMT+10 Sydney', 'GMT+12 Auckland',
]

const EMPTY = {
  clientName: '', businessType: '', platforms: [], handles: {},
  contentGoal: '', postingFrequency: '', primaryObjective: '',
  package: '', contractType: '', monthlyBudget: '', contractStartDate: '',
  primaryContactName: '', primaryContactWhatsApp: '', timezone: '', websiteURL: '',
  followers: {},
  notes: '',
}

function Section({ title }) {
  return (
    <div style={{ margin: '28px 0 18px', paddingBottom: 8, borderBottom: `1.5px solid ${BD}` }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: PL, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'Outfit',sans-serif" }}>{title}</span>
    </div>
  )
}

function Field({ label, children, half }) {
  return (
    <div style={{ marginBottom: 18, ...(half ? { flex: '1 1 220px', minWidth: 0 } : {}) }}>
      <label style={LBL}>{label}</label>
      {children}
    </div>
  )
}

export default function ClientTab({ client, saveClient, onClientSaved, pushToast }) {
  const [form, setForm]         = useState(EMPTY)
  const [photo, setPhoto]       = useState(null)
  const [igHandle, setIgHandle] = useState('')
  const [fetching, setFetching] = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    if (client) {
      setForm({
        clientName:            client.name || client.businessName || '',
        businessType:          client.businessType || '',
        platforms:             client.platforms || [],
        handles:               client.handles || {},
        contentGoal:           client.contentGoal || '',
        postingFrequency:      client.postingFrequency || '',
        primaryObjective:      client.primaryObjective || '',
        package:               client.package || '',
        contractType:          client.contractType || '',
        monthlyBudget:         client.monthlyBudget || '',
        contractStartDate:     client.contractStartDate || client.startDate || '',
        primaryContactName:    client.primaryContactName || '',
        primaryContactWhatsApp: client.primaryContactWhatsApp || '',
        timezone:              client.timezone || '',
        websiteURL:            client.websiteURL || '',
        followers:             client.followers || {},
        notes:                 client.notes || '',
      })
      setPhoto(client.profilePhoto || null)
    } else {
      setForm(EMPTY)
      setPhoto(null)
    }
  }, [client])

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
    const clientObj = {
      id:           client ? client.id : Date.now(),
      createdAt:    client ? client.createdAt : new Date().toISOString(),
      name: form.clientName.trim(),
      businessName: form.clientName.trim(),
      businessType: form.businessType,
      platforms: form.platforms,
      handles: form.handles,
      contentGoal: form.contentGoal,
      postingFrequency: form.postingFrequency,
      primaryObjective: form.primaryObjective,
      package: form.package,
      contractType: form.contractType,
      monthlyBudget: form.monthlyBudget,
      contractStartDate: form.contractStartDate,
      startDate: form.contractStartDate,
      primaryContactName: form.primaryContactName,
      primaryContactWhatsApp: form.primaryContactWhatsApp,
      timezone: form.timezone,
      websiteURL: form.websiteURL,
      followers: form.followers,
      notes: form.notes,
      profilePhoto: photo,
      brandKit: client?.brandKit ?? null, audit: client?.audit ?? null, competitors: client?.competitors ?? null, analysis: client?.analysis ?? null, strategy: client?.strategy ?? null,
    }
    saveClient?.(clientObj)
    onClientSaved?.(clientObj)
    setSaved(true)
    pushToast?.('Client saved successfully')
    setTimeout(() => setSaved(false), 2500)
  }

  const sel = (v) => ({ ...INP, color: v ? TX : MI })

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ background: CARD, borderRadius: R, padding: '28px 32px', boxShadow: SH, border: `1px solid ${BD}` }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>{client ? 'Edit Client Profile' : 'New Client Profile'}</h3>

        {/* ── Profile Photo ── */}
        <div style={{ marginBottom: 18 }}>
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

        {/* ── Client Name ── */}
        <Field label="Client / Business Name *">
          <input value={form.clientName} onChange={e => upd('clientName', e.target.value)} placeholder="e.g. Pulse Fitness Studio" style={INP} />
        </Field>

        {/* ── Business Type ── */}
        <Field label="Business Type">
          <select value={form.businessType} onChange={e => upd('businessType', e.target.value)} style={sel(form.businessType)}>
            <option value="">Select business type…</option>
            {BIZ_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>

        {/* ── Platforms ── */}
        <div style={{ marginBottom: 18 }}>
          <label style={LBL}>Platforms</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATS.map(p => {
              const on = form.platforms.includes(p)
              return (
                <button key={p} onClick={() => togglePlat(p)} style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${on ? PU : BD}`, background: on ? `${PU}15` : BG, color: on ? PL : MI, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Handles ── */}
        {form.platforms.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label style={LBL}>Social Handles</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.platforms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: MI, width: 100, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{p}</span>
                  <input value={form.handles[p] || ''} onChange={e => upd('handles', { ...form.handles, [p]: e.target.value })} placeholder={`@${p.toLowerCase()}handle`} style={{ ...INP, flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Content Goal + Posting Frequency (row) ── */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="Content Goal" half>
            <select value={form.contentGoal} onChange={e => upd('contentGoal', e.target.value)} style={sel(form.contentGoal)}>
              <option value="">Select goal…</option>
              {CONTENT_GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Posting Frequency" half>
            <select value={form.postingFrequency} onChange={e => upd('postingFrequency', e.target.value)} style={sel(form.postingFrequency)}>
              <option value="">Select frequency…</option>
              {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
            </select>
          </Field>
        </div>

        {/* ── Primary Objective ── */}
        <Field label="Primary Objective">
          <textarea value={form.primaryObjective} onChange={e => upd('primaryObjective', e.target.value)} placeholder="What is the main goal for this client's social media presence?" style={{ ...INP, resize: 'vertical', minHeight: 80 }} />
        </Field>

        {/* ── CONTRACT DETAILS ── */}
        <Section title="Contract Details" />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="Package" half>
            <select value={form.package} onChange={e => upd('package', e.target.value)} style={sel(form.package)}>
              <option value="">Select package…</option>
              {PACKAGES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Contract Type" half>
            <select value={form.contractType} onChange={e => upd('contractType', e.target.value)} style={sel(form.contractType)}>
              <option value="">Select type…</option>
              {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="Monthly Budget" half>
            <select value={form.monthlyBudget} onChange={e => upd('monthlyBudget', e.target.value)} style={sel(form.monthlyBudget)}>
              <option value="">Select budget…</option>
              {BUDGETS.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Contract Start Date" half>
            <input type="date" value={form.contractStartDate} onChange={e => upd('contractStartDate', e.target.value)} style={INP} />
          </Field>
        </div>

        {/* ── CONTACT DETAILS ── */}
        <Section title="Contact Details" />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="Primary Contact Name" half>
            <input value={form.primaryContactName} onChange={e => upd('primaryContactName', e.target.value)} placeholder="Full name" style={INP} />
          </Field>
          <Field label="Primary Contact WhatsApp" half>
            <input value={form.primaryContactWhatsApp} onChange={e => upd('primaryContactWhatsApp', e.target.value)} placeholder="+1 555 000 0000" style={INP} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="Timezone" half>
            <select value={form.timezone} onChange={e => upd('timezone', e.target.value)} style={sel(form.timezone)}>
              <option value="">Select timezone…</option>
              {TIMEZONES.map(z => <option key={z}>{z}</option>)}
            </select>
          </Field>
          <Field label="Website URL" half>
            <input value={form.websiteURL} onChange={e => upd('websiteURL', e.target.value)} placeholder="https://example.com" style={INP} />
          </Field>
        </div>

        {/* ── SOCIAL BASELINE ── */}
        {form.platforms.length > 0 && (
          <>
            <Section title="Social Baseline" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.platforms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: MI, width: 110, fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{p}</span>
                  <input
                    type="number"
                    min="0"
                    value={form.followers[p] || ''}
                    onChange={e => upd('followers', { ...form.followers, [p]: e.target.value })}
                    placeholder={`Current followers on ${p}`}
                    style={{ ...INP, flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── NOTES ── */}
        <Section title="Notes" />
        <Field label="Additional Notes">
          <textarea value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Any additional context, special instructions, or notes about this client…" style={{ ...INP, resize: 'vertical', minHeight: 100 }} />
        </Field>

        <button onClick={save} style={{ padding: '12px 28px', borderRadius: 11, border: 'none', background: saved ? '#4A7C5C' : PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 16px ${PU}40`, transition: 'background .2s' }}>
          {saved ? '✓ Client Saved!' : 'Save Client'}
        </button>
      </div>
    </div>
  )
}
