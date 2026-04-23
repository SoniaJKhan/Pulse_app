import React, { useState } from 'react'

const BUSINESS_TYPES = [
  'Yoga Studio', 'Pilates Studio', 'Gym', 'Spa',
  'Wellness Clinic', 'Retreat Centre', 'Personal Training Studio', 'Other',
]
const BOOKING_PLATFORMS = ['WellnessLiving', 'Mindbody', 'Vagaro', 'Other', 'None']
const PACKAGES = ['Starter', 'Growth', 'Full Service', 'Custom']

const EMPTY = {
  businessName: '', ownerName: '', email: '', phone: '',
  country: '', businessType: '', bookingPlatform: '',
  package: '', monthlyMemberCount: '',
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function AddClientDrawer({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.ownerName.trim()) e.ownerName = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!form.businessType) e.businessType = 'Required'
    if (!form.package) e.package = 'Required'
    if (!form.startDate) e.startDate = 'Required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    onAdd(form)
  }

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <aside style={s.drawer}>
        <div style={s.drawerHead}>
          <div>
            <h2 style={s.drawerTitle}>Add New Client</h2>
            <p style={s.drawerSub}>Fill in the details below to create a client record and generate the onboarding checklist.</p>
          </div>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.section}>
            <p style={s.sectionLabel}>Business Information</p>
            <Field label="Business Name *" error={errors.businessName}>
              <input style={s.input} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Bloom Wellness Studio" />
            </Field>
            <Field label="Owner / Contact Name *" error={errors.ownerName}>
              <input style={s.input} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="e.g. Sarah Mitchell" />
            </Field>
            <Row>
              <Field label="Email *" error={errors.email}>
                <input style={s.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="owner@business.com" />
              </Field>
              <Field label="Phone">
                <input style={s.input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555-0100" />
              </Field>
            </Row>
            <Field label="Country">
              <input style={s.input} value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. United States" />
            </Field>
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <p style={s.sectionLabel}>Business Details</p>
            <Row>
              <Field label="Business Type *" error={errors.businessType}>
                <select style={s.input} value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Booking Platform">
                <select style={s.input} value={form.bookingPlatform} onChange={e => set('bookingPlatform', e.target.value)}>
                  <option value="">Select platform</option>
                  {BOOKING_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </Row>
            <Field label="Monthly Member Count">
              <input style={s.input} type="number" min="0" value={form.monthlyMemberCount} onChange={e => set('monthlyMemberCount', e.target.value)} placeholder="e.g. 150" />
            </Field>
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <p style={s.sectionLabel}>Account</p>
            <Row>
              <Field label="Package *" error={errors.package}>
                <select style={s.input} value={form.package} onChange={e => set('package', e.target.value)}>
                  <option value="">Select package</option>
                  {PACKAGES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Start Date *" error={errors.startDate}>
                <input style={s.input} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </Field>
            </Row>
            <Field label="Notes">
              <textarea style={{ ...s.input, ...s.textarea }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any relevant context, goals, or notes..." />
            </Field>
          </div>

          <div style={s.checklist}>
            <div style={s.checklistIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <p style={s.checklistTitle}>Onboarding checklist will be auto-generated</p>
              <p style={s.checklistSub}>8 tasks due 7 days from today will be created automatically when you save.</p>
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.saveBtn} disabled={saving}>
              {saving
                ? <span style={s.spinner} />
                : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create Client
                  </>
                )
              }
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}

function Field({ label, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
      <label style={s.label}>{label}</label>
      {children}
      {error && <span style={s.fieldError}>{error}</span>}
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: '12px' }}>{children}</div>
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(26,26,26,0.4)',
    zIndex: 100,
  },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: '480px', maxWidth: '100vw',
    background: 'var(--bg-card)',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(26,26,26,0.12)',
  },
  drawerHead: {
    padding: '24px 24px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexShrink: 0,
  },
  drawerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '4px',
  },
  drawerSub: {
    fontSize: '13px',
    color: 'var(--mid-grey)',
    lineHeight: 1.5,
    maxWidth: '340px',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--mid-grey)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  form: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--mid-grey)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '2px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    flexShrink: 0,
  },
  label: {
    fontSize: '12.5px',
    fontWeight: 500,
    color: 'var(--dark)',
  },
  input: {
    padding: '9px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '13.5px',
    color: 'var(--dark)',
    background: 'var(--bg)',
    width: '100%',
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px',
  },
  fieldError: {
    fontSize: '11.5px',
    color: 'var(--red)',
    fontWeight: 500,
  },
  checklist: {
    margin: '0 24px 4px',
    padding: '14px 16px',
    background: 'rgba(196,135,74,0.07)',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(196,135,74,0.2)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  checklistIcon: {
    color: 'var(--accent)',
    marginTop: '1px',
    flexShrink: 0,
  },
  checklistTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--dark)',
    marginBottom: '3px',
  },
  checklistSub: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    lineHeight: 1.45,
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexShrink: 0,
    marginTop: 'auto',
  },
  cancelBtn: {
    padding: '9px 18px',
    background: 'none',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '13.5px',
    fontWeight: 500,
    color: 'var(--mid-grey)',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 20px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    minWidth: '130px',
    justifyContent: 'center',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
}
