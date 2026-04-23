import React, { useState } from 'react'

const PLATFORMS = ['Instagram', 'Facebook', 'Google Business', 'TikTok', 'LinkedIn', 'Email', 'YouTube', 'Other']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CURRENT_MONTH = '2026-04'

const MAX_COMPETITORS = 5

const EMPTY_COMP = {
  name: '',
  strongestPlatform: 'Instagram',
  whatWorking: '',
  whatNotWorking: '',
  contentThemes: '',
  notes: '',
}

function fmtMonthDisplay(m) {
  const [y, mo] = m.split('-')
  return `${MONTHS[parseInt(mo) - 1]} ${y}`
}

function CompetitorCard({ comp, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fff', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '12px 16px', borderBottom: expanded ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(196,135,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{comp.name.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.name}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--mid-grey)' }}>Strongest: {comp.strongestPlatform}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onEdit(comp) }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 8px', fontSize: '11.5px', fontWeight: 600, color: 'var(--mid-grey)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(comp.id) }}
            style={{ background: 'none', border: 'none', color: 'var(--mid-grey)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            title="Remove competitor"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--mid-grey)', flexShrink: 0 }}>
            {expanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Field label="What's Working" value={comp.whatWorking} color="var(--green)" />
          <Field label="What's Not Working" value={comp.whatNotWorking} color="var(--red)" />
          <Field label="Content Themes" value={comp.contentThemes} color="var(--accent)" />
          {comp.notes && <Field label="Notes" value={comp.notes} color="var(--mid-grey)" />}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, color }) {
  if (!value) return (
    <div>
      <div style={{ fontSize: '10.5px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '12.5px', color: 'var(--border)', fontStyle: 'italic' }}>Not yet recorded</div>
    </div>
  )
  return (
    <div>
      <div style={{ fontSize: '10.5px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

function CompetitorForm({ item, clientId, month, onSave, onClose }) {
  const isNew = !item
  const [form, setForm] = useState(item ? { ...item } : { ...EMPTY_COMP })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({ ...form, clientId, month })
    onClose()
  }

  const fields = [
    { key: 'whatWorking',    label: "What's Working This Month",    placeholder: 'e.g. Reels with transformation stories getting 15–20% engagement...', rows: 3 },
    { key: 'whatNotWorking', label: "What's Not Working",           placeholder: 'e.g. Low engagement on static posts, inconsistent schedule...', rows: 3 },
    { key: 'contentThemes',  label: 'Content Themes',               placeholder: 'e.g. Personal transformation, instructor spotlights, BTS...', rows: 2 },
    { key: 'notes',          label: 'Notes',                        placeholder: 'Any other observations worth tracking...', rows: 2 },
  ]

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', background: '#fff', borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
          {isNew ? 'Add Competitor' : 'Edit Competitor'}
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
        <div>
          <label style={fLabel}>Competitor Name <span style={{ color: 'var(--red)' }}>*</span></label>
          <input type="text" style={fInput} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Flow & Breathe Studio" />
        </div>
        <div>
          <label style={fLabel}>Strongest Platform</label>
          <select style={fInput} value={form.strongestPlatform} onChange={e => set('strongestPlatform', e.target.value)}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {fields.map(f => (
          <div key={f.key}>
            <label style={fLabel}>{f.label}</label>
            <textarea
              style={{ ...fInput, minHeight: `${f.rows * 28}px`, resize: 'vertical' }}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--mid-grey)', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!form.name.trim()}
          style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif", opacity: !form.name.trim() ? 0.5 : 1 }}
        >
          {isNew ? 'Add Competitor' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const fLabel = { fontSize: '11.5px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }
const fInput = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', fontSize: '13px', color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", background: '#fff', boxSizing: 'border-box', outline: 'none' }

const navBtn = { background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--mid-grey)' }

function monthOffset(base, delta) {
  const [y, m] = base.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function CompetitorTracker({ clientId, competitors, onAdd, onUpdate, onDelete }) {
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH)
  const [formItem, setFormItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const monthComps = competitors.filter(c => c.clientId === clientId && c.month === viewMonth)
  const canAdd = monthComps.length < MAX_COMPETITORS

  const openAdd = () => { setFormItem(null); setShowForm(true) }
  const openEdit = (comp) => { setFormItem(comp); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setFormItem(null) }

  const handleSave = (form) => {
    if (form.id) { onUpdate(form.id, form) } else { onAdd(form) }
    closeForm()
  }

  return (
    <div>
      {/* Header with month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" onClick={() => setViewMonth(m => monthOffset(m, -1))} style={navBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', minWidth: '130px', textAlign: 'center' }}>
            {fmtMonthDisplay(viewMonth)}
          </span>
          <button type="button" onClick={() => setViewMonth(m => monthOffset(m, 1))} style={navBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--mid-grey)' }}>
            {monthComps.length} / {MAX_COMPETITORS} competitors
          </span>
          {canAdd && (
            <button
              type="button"
              onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Competitor
            </button>
          )}
        </div>
      </div>

      {/* Competitor cards */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {monthComps.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--mid-grey)', fontSize: '13px', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            No competitors tracked for {fmtMonthDisplay(viewMonth)}.
            {canAdd && <><br /><span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={openAdd}> Add your first competitor</span></>}
          </div>
        ) : (
          monthComps.map(comp => (
            <CompetitorCard key={comp.id} comp={comp} onEdit={openEdit} onDelete={onDelete} />
          ))
        )}
        {!canAdd && (
          <p style={{ fontSize: '12px', color: 'var(--mid-grey)', textAlign: 'center', margin: '4px 0 0' }}>
            Maximum of {MAX_COMPETITORS} competitors per month reached.
          </p>
        )}
      </div>

      {showForm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 199 }} onClick={closeForm} />
          <CompetitorForm
            item={formItem}
            clientId={clientId}
            month={viewMonth}
            onSave={handleSave}
            onClose={closeForm}
          />
        </>
      )}
    </div>
  )
}
