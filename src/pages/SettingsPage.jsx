import React, { useState, useEffect, useCallback } from 'react'

const LS_BUFFER    = 'pulse_buffer_key'
const LS_UNSPLASH  = 'pulse_unsplash_key'
const LS_ANTHROPIC = 'pulse_anthropic_key'

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHead}>
        <h2 style={s.sectionTitle}>{title}</h2>
        {subtitle && <p style={s.sectionSub}>{subtitle}</p>}
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  )
}

function PlatformRow({ name, icon, description, storageKey, actionLabel }) {
  const [connected, setConnected] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [keyValue, setKeyValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) { setConnected(true); setKeyValue(stored) }
  }, [storageKey])

  const handleSave = () => {
    if (!keyValue.trim()) return
    setSaving(true)
    setTimeout(() => {
      localStorage.setItem(storageKey, keyValue.trim())
      setConnected(true)
      setShowInput(false)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 600)
  }

  const handleDisconnect = () => {
    localStorage.removeItem(storageKey)
    setConnected(false)
    setKeyValue('')
    setShowInput(false)
  }

  return (
    <div style={s.platformRow}>
      <div style={s.platformLeft}>
        <div style={s.platformIcon}>{icon}</div>
        <div style={s.platformInfo}>
          <span style={s.platformName}>{name}</span>
          <span style={s.platformDesc}>{description}</span>
        </div>
      </div>

      <div style={s.platformRight}>
        {saved && (
          <span style={s.savedTag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Saved
          </span>
        )}

        {connected ? (
          <div style={s.connectedRow}>
            <span style={s.connectedStatus}>
              <span style={s.connectedDot} />
              Connected
            </span>
            <button style={s.disconnectBtn} onClick={handleDisconnect}>Disconnect</button>
          </div>
        ) : showInput ? (
          <div style={s.inputRow}>
            <input
              type="text"
              style={s.keyInput}
              value={keyValue}
              onChange={e => setKeyValue(e.target.value)}
              placeholder={`Enter your ${name} API key…`}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button style={s.saveBtn} onClick={handleSave} disabled={saving || !keyValue.trim()}>
              {saving ? 'Saving…' : 'Save Connection'}
            </button>
            <button style={s.cancelBtn} onClick={() => setShowInput(false)}>Cancel</button>
          </div>
        ) : (
          <button style={s.connectBtn} onClick={() => setShowInput(true)}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

const NOTIF_TYPES = [
  { id: 'task-overdue',     label: 'Task Overdue',              desc: 'Fires when a task passes its due date.', inApp: true,  email: true  },
  { id: 'monthly-report',   label: 'Monthly Report Overdue',    desc: 'Report not generated within 30 days.', inApp: true,  email: true  },
  { id: 'content-pending',  label: 'Content Pending Approval',  desc: 'Content sits pending for 48+ hours.', inApp: true,  email: false },
  { id: 'response-time',    label: 'Response Time Critical',    desc: 'Client response time exceeds threshold.', inApp: true, email: false },
  { id: 'quarterly-review', label: 'Quarterly Review Due',      desc: 'Quarterly review window approaching.', inApp: true, email: false },
  { id: 'at-risk-member',   label: 'At-Risk Member Unactioned', desc: 'At-risk member not contacted within 7 days.', inApp: true, email: true },
  { id: 'survey-not-sent',  label: 'Survey Not Sent',           desc: 'Monthly NPS survey not dispatched.', inApp: true, email: false },
]

const NOTIF_KEY = 'pulse_notif_prefs_v1'

function NotificationPreferences() {
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || 'null') } catch { return null }
  })

  const defaults = NOTIF_TYPES.reduce((acc, t) => ({ ...acc, [t.id]: { inApp: t.inApp, email: t.email } }), {})
  const effective = prefs || defaults

  const toggle = (id, channel) => {
    const next = { ...effective, [id]: { ...effective[id], [channel]: !effective[id]?.[channel] } }
    setPrefs(next)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
  }

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: on ? 'var(--green)' : 'rgba(255,255,255,0.12)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
        display: 'flex', alignItems: 'center', padding: '2px 3px',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'transform 0.2s',
        transform: on ? 'translateX(16px)' : 'translateX(0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )

  return (
    <SectionCard
      title="Notification Preferences"
      subtitle="Choose which alert types trigger an in-app notification only, or also send an email."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 24px', alignItems: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Alert Type</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>In-App</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Email</div>
        {NOTIF_TYPES.map(t => (
          <React.Fragment key={t.id}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--mid-grey)' }}>{t.desc}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <Toggle on={effective[t.id]?.inApp} onToggle={() => toggle(t.id, 'inApp')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <Toggle on={effective[t.id]?.email} onToggle={() => toggle(t.id, 'email')} />
            </div>
          </React.Fragment>
        ))}
      </div>
      <p style={{ ...s.readonlyNote, marginTop: 12 }}>Email delivery requires Gmail integration — coming soon.</p>
    </SectionCard>
  )
}

function AIIntegrationSection() {
  const [key, setKey] = useState(() => localStorage.getItem(LS_ANTHROPIC) || '')
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [saved, setSaved] = useState(false)

  const connected = !!key

  const handleSave = () => {
    if (!input.trim()) return
    localStorage.setItem(LS_ANTHROPIC, input.trim())
    setKey(input.trim())
    setInput('')
    setShowInput(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleRemove = () => {
    localStorage.removeItem(LS_ANTHROPIC)
    setKey('')
    setShowInput(false)
  }

  return (
    <SectionCard
      title="AI Integration"
      subtitle="Connect your Anthropic API key to enable real AI-powered analysis in the Intelligence Flow."
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={s.fieldLabel}>Anthropic API Key</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            {connected ? (
              <span style={s.connectedStatus}>
                <span style={s.connectedDot} />
                Connected
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mid-grey)', flexShrink: 0, display: 'inline-block' }} />
                Not Connected
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {saved && (
            <span style={s.savedTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>
          )}

          {connected ? (
            <button style={s.disconnectBtn} onClick={handleRemove}>Remove Key</button>
          ) : showInput ? (
            <div style={s.inputRow}>
              <input
                type="password"
                style={s.keyInput}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="sk-ant-api03-…"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoComplete="off"
              />
              <button style={s.saveBtn} onClick={handleSave} disabled={!input.trim()}>Save</button>
              <button style={s.cancelBtn} onClick={() => setShowInput(false)}>Cancel</button>
            </div>
          ) : (
            <button style={s.connectBtn} onClick={() => setShowInput(true)}>Add API Key</button>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

export default function SettingsPage() {
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Settings</h1>
          <p style={s.subtitle}>Manage your agency profile, integrations, and platform preferences.</p>
        </div>
      </div>

      {/* AI Integration */}
      <AIIntegrationSection />

      {/* Agency Profile */}
      <SectionCard title="Agency Profile" subtitle="Your agency details used across client communications and reports.">
        <div style={s.fieldGrid}>
          <div style={s.field}>
            <label style={s.fieldLabel}>Agency Name</label>
            <input style={s.fieldInput} defaultValue="Strat Insight Digital" readOnly />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Admin Email</label>
            <input style={s.fieldInput} defaultValue="admin@stratinsightdigital.com" readOnly />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Timezone</label>
            <select style={s.fieldInput}>
              <option>UTC+0 — London</option>
              <option>UTC+10 — Sydney (AEST)</option>
              <option>UTC+11 — Sydney (AEDT)</option>
              <option>UTC-5 — New York (EST)</option>
              <option>UTC-8 — Los Angeles (PST)</option>
            </select>
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Default Currency</label>
            <select style={s.fieldInput}>
              <option>AUD — Australian Dollar</option>
              <option>USD — US Dollar</option>
              <option>GBP — British Pound</option>
              <option>EUR — Euro</option>
            </select>
          </div>
        </div>
        <p style={s.readonlyNote}>
          Profile editing will be available when the backend is connected.
        </p>
      </SectionCard>

      {/* Connected Platforms */}
      <SectionCard
        title="Connected Platforms"
        subtitle="Connect third-party tools to enable publishing, image search, and automation within Pulse."
      >
        <PlatformRow
          name="Buffer"
          storageKey={LS_BUFFER}
          actionLabel="Connect to Buffer"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4874A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          }
          description="Queue approved content directly to Buffer for scheduling across your social channels."
        />
        <PlatformRow
          name="Unsplash"
          storageKey={LS_UNSPLASH}
          actionLabel="Connect to Unsplash"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A7C5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          }
          description="Search Unsplash's library of 3M+ free images directly in the AI Studio image library."
        />
      </SectionCard>

      {/* Alert Thresholds */}
      <SectionCard
        title="Alert Thresholds"
        subtitle="Configure when the system automatically raises alerts for each trigger type."
      >
        <div style={s.thresholdList}>
          {[
            { label: 'Content pending approval',     value: '48 hours' },
            { label: 'Response time threshold',      value: '6 hours' },
            { label: 'Quarterly review window',      value: '75 days' },
            { label: 'Monthly report overdue after', value: '30 days' },
            { label: 'At-risk member action window', value: '3 days' },
          ].map(({ label, value }) => (
            <div key={label} style={s.thresholdRow}>
              <span style={s.thresholdLabel}>{label}</span>
              <span style={s.thresholdValue}>{value}</span>
            </div>
          ))}
        </div>
        <p style={s.readonlyNote}>Threshold editing will be available in a future build.</p>
      </SectionCard>

      {/* Notification Preferences */}
      <NotificationPreferences />
    </div>
  )
}

const s = {
  page: { padding: '32px', maxWidth: '860px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: 'var(--mid-grey)' },

  section: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    marginBottom: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)',
  },
  sectionHead: {
    padding: '20px 24px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--dark)', marginBottom: '3px' },
  sectionSub: { fontSize: '13px', color: 'var(--mid-grey)', lineHeight: 1.5 },
  sectionBody: { padding: '20px 24px' },

  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '11.5px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  fieldInput: {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13.5px', color: 'var(--dark)', background: 'var(--bg)',
    outline: 'none', fontFamily: "'Outfit', sans-serif",
  },
  readonlyNote: { fontSize: '12px', color: 'var(--mid-grey)', fontStyle: 'italic', marginTop: '4px' },

  platformRow: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '18px 0', borderBottom: '1px solid var(--border)', gap: '20px', flexWrap: 'wrap',
  },
  platformLeft: { display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '220px' },
  platformIcon: {
    width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg)',
    border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  platformInfo: { display: 'flex', flexDirection: 'column', gap: '3px' },
  platformName: { fontSize: '14px', fontWeight: 700, color: 'var(--dark)' },
  platformDesc: { fontSize: '12.5px', color: 'var(--mid-grey)', lineHeight: 1.4, maxWidth: '360px' },
  platformRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 },

  connectBtn: {
    padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  connectedRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  connectedStatus: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#4A7C5C' },
  connectedDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#4A7C5C', flexShrink: 0 },
  disconnectBtn: {
    padding: '5px 12px', background: 'none', color: 'var(--mid-grey)',
    border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '12px',
    fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  inputRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  keyInput: {
    padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13px', color: 'var(--dark)', background: 'var(--bg-card)',
    outline: 'none', fontFamily: "'Outfit', sans-serif", width: '220px',
  },
  saveBtn: {
    padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", opacity: 1,
  },
  cancelBtn: {
    padding: '8px 12px', background: 'none', color: 'var(--mid-grey)',
    border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '12.5px',
    fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  savedTag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: 600, color: '#4A7C5C',
  },

  thresholdList: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '12px' },
  thresholdRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid var(--border)',
  },
  thresholdLabel: { fontSize: '13.5px', color: 'var(--dark)', fontWeight: 500 },
  thresholdValue: {
    fontSize: '12.5px', fontWeight: 700, color: 'var(--accent)',
    background: 'rgba(196,135,74,0.1)', padding: '3px 10px', borderRadius: '20px',
  },

  notifList: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '12px' },
  notifRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid var(--border)', gap: '20px',
  },
  notifText: { display: 'flex', flexDirection: 'column', gap: '2px' },
  notifLabel: { fontSize: '13.5px', fontWeight: 600, color: 'var(--dark)' },
  notifDesc: { fontSize: '12.5px', color: 'var(--mid-grey)' },
  toggle: { flexShrink: 0 },
  toggleTrack: {
    width: '40px', height: '22px', borderRadius: '11px',
    background: 'rgba(196,135,74,0.3)', position: 'relative', cursor: 'pointer',
  },
  toggleThumb: {
    width: '16px', height: '16px', borderRadius: '50%',
    background: 'var(--accent)', position: 'absolute', top: '3px', left: '3px',
  },
}
