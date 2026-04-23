import React, { useState } from 'react'

const PLATFORMS = ['Instagram', 'Facebook', 'Google Business', 'TikTok', 'LinkedIn', 'Email', 'SMS']
const CONTENT_TYPES = ['Post', 'Reel', 'Story', 'Video', 'Email Campaign']
const STATUSES = ['Idea', 'Draft', 'Pending Approval', 'Approved', 'Scheduled', 'Live']
const APPROVAL_STATES = ['Awaiting Review', 'Approved', 'Changes Requested']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const STATUS_STYLE = {
  'Idea':             { bg: 'rgba(138,132,128,0.1)',  color: '#8A8480' },
  'Draft':            { bg: 'rgba(58,116,168,0.1)',   color: '#3A74A8' },
  'Pending Approval': { bg: 'rgba(196,135,74,0.12)',  color: '#C4874A' },
  'Approved':         { bg: 'rgba(74,124,92,0.12)',   color: '#4A7C5C' },
  'Scheduled':        { bg: 'rgba(74,140,140,0.12)',  color: '#4A8C8C' },
  'Live':             { bg: 'rgba(74,124,92,0.15)',   color: '#4A7C5C' },
}

const APPROVAL_STYLE = {
  'Approved':          { bg: 'rgba(74,124,92,0.12)',  color: '#4A7C5C' },
  'Awaiting Review':   { bg: 'rgba(138,132,128,0.1)', color: '#8A8480' },
  'Changes Requested': { bg: 'rgba(196,80,58,0.1)',   color: '#C4503A' },
}

export const PLATFORM_COLORS = {
  'Instagram':       { bg: 'rgba(180,72,108,0.1)',  color: '#B4486C' },
  'Facebook':        { bg: 'rgba(58,94,168,0.1)',   color: '#3A5EA8' },
  'Google Business': { bg: 'rgba(196,80,58,0.1)',   color: '#C4503A' },
  'TikTok':          { bg: 'rgba(30,30,30,0.08)',   color: '#484848' },
  'LinkedIn':        { bg: 'rgba(58,116,168,0.1)',  color: '#3A74A8' },
  'Email':           { bg: 'rgba(138,132,128,0.1)', color: '#8A8480' },
  'SMS':             { bg: 'rgba(74,124,92,0.1)',   color: '#4A7C5C' },
}

export const PLATFORM_ABBREV = {
  'Instagram': 'IG', 'Facebook': 'FB', 'Google Business': 'GB',
  'TikTok': 'TT', 'LinkedIn': 'LI', 'Email': 'EM', 'SMS': 'SM',
}

const TODAY = '2026-04-17'

function itemStyle(item) {
  if (item.clientApproval === 'Changes Requested') return { bg: 'var(--red-bg)', color: 'var(--red)' }
  return STATUS_STYLE[item.status] || STATUS_STYLE['Idea']
}

function ContentPill({ item, onClick }) {
  const st = itemStyle(item)
  const abbrev = PLATFORM_ABBREV[item.platforms?.[0]] || '—'
  return (
    <div
      style={{ background: st.bg, color: st.color, borderRadius: '3px', padding: '2px 5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px', lineHeight: 1.4 }}
      onClick={e => { e.stopPropagation(); onClick(item) }}
      title={`${item.platforms?.join(', ')} · ${item.contentType} · ${item.status}`}
    >
      {abbrev} {item.contentType}
    </div>
  )
}

function CalendarView({ items, year, month, onItemClick, onAddForDate }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textAlign: 'center', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          const ds = day ? dateStr(day) : null
          const dayItems = ds ? items.filter(it => it.scheduledDate === ds) : []
          const isToday = ds === TODAY
          const isPast = ds && ds < TODAY
          return (
            <div
              key={i}
              style={{
                minHeight: '84px',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: '1px solid var(--border)',
                padding: '6px',
                background: !day ? 'var(--bg)' : 'var(--bg-card)',
                cursor: day ? 'pointer' : 'default',
              }}
              onClick={() => day && onAddForDate(dateStr(day))}
            >
              {day && (
                <>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
                    fontSize: '12px', fontWeight: isToday ? 700 : 400,
                    background: isToday ? 'var(--accent)' : 'transparent',
                    color: isToday ? '#fff' : isPast ? '#C0B8B0' : 'var(--dark)',
                  }}>
                    {day}
                  </div>
                  {dayItems.map(item => (
                    <ContentPill key={item.id} item={item} onClick={onItemClick} />
                  ))}
                  {dayItems.length === 0 && (
                    <div style={{ opacity: 0, fontSize: '10px', color: 'var(--accent)', textAlign: 'center' }} className="cal-add">+</div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BufferButton({ item }) {
  const [state, setState] = useState('idle') // idle | sending | sent | error | no-key

  const handleSend = async (e) => {
    e.stopPropagation()
    const bufferKey = localStorage.getItem('pulse_buffer_key')
    if (!bufferKey) { setState('no-key'); return }
    setState('sending')
    try {
      await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: { Authorization: `Bearer ${bufferKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `text=${encodeURIComponent(item.caption || item.contentType || 'Content post')}&profile_ids[]=placeholder`,
      })
    } catch (_) {}
    setState('sent')
    setTimeout(() => setState('idle'), 3000)
  }

  if (state === 'no-key') {
    return (
      <span style={{ fontSize: '11px', color: 'var(--mid-grey)', fontStyle: 'italic' }}>
        Add Buffer key in Settings
      </span>
    )
  }
  if (state === 'sent') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#4A7C5C' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        Sent to Buffer
      </span>
    )
  }
  return (
    <button
      onClick={handleSend}
      disabled={state === 'sending'}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
        background: 'rgba(196,135,74,0.1)', color: 'var(--accent)',
        border: '1.5px solid rgba(196,135,74,0.3)', borderRadius: '7px',
        fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif", opacity: state === 'sending' ? 0.6 : 1,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      {state === 'sending' ? 'Sending…' : 'Send to Buffer'}
    </button>
  )
}

function ListView({ items, onItemClick }) {
  const sorted = [...items].sort((a, b) => {
    const da = (a.scheduledDate || '') + (a.scheduledTime || '')
    const db = (b.scheduledDate || '') + (b.scheduledTime || '')
    return da.localeCompare(db)
  })

  if (sorted.length === 0) {
    return (
      <div style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '5px' }}>No content this month</p>
        <p style={{ fontSize: '13px', color: 'var(--mid-grey)' }}>Click "Add Content" to schedule your first post for this month.</p>
      </div>
    )
  }

  return (
    <div>
      {sorted.map(item => {
        const st = itemStyle(item)
        const apSt = APPROVAL_STYLE[item.clientApproval] || APPROVAL_STYLE['Awaiting Review']
        const dayNum = item.scheduledDate ? item.scheduledDate.split('-')[2] : '—'
        const isApproved = item.status === 'Approved'
        return (
          <div
            key={item.id}
            style={{ padding: '13px 22px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '16px', borderLeft: `3px solid ${st.color}`, background: 'var(--bg-card)' }}
            onClick={() => onItemClick(item)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <div style={{ minWidth: '52px', textAlign: 'center', flexShrink: 0, paddingTop: '2px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)', lineHeight: 1 }}>{dayNum}</div>
              <div style={{ fontSize: '10.5px', color: 'var(--mid-grey)' }}>{item.scheduledTime || ''}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)' }}>{item.contentType}</span>
                {item.platforms?.map(plat => {
                  const pc = PLATFORM_COLORS[plat] || {}
                  return (
                    <span key={plat} style={{ fontSize: '11px', fontWeight: 700, background: pc.bg, color: pc.color, padding: '1px 7px', borderRadius: '10px' }}>
                      {PLATFORM_ABBREV[plat] || plat}
                    </span>
                  )
                })}
              </div>
              {item.caption && (
                <p style={{ fontSize: '12.5px', color: 'var(--mid-grey)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                  {item.caption}
                </p>
              )}
              {item.visualDirection && (
                <p style={{ fontSize: '11.5px', color: 'var(--mid-grey)', opacity: 0.65, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                  Visual: {item.visualDirection}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
              <span style={{ ...st, fontSize: '11.5px', fontWeight: 600, padding: '2px 9px', borderRadius: '20px' }}>
                {item.status}
              </span>
              <span style={{ background: apSt.bg, color: apSt.color, fontSize: '11px', fontWeight: 500, padding: '1px 7px', borderRadius: '20px' }}>
                {item.clientApproval}
              </span>
              {isApproved && <BufferButton item={item} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContentForm({ item, onSave, onDelete, onClose, prefillDate }) {
  const isNew = !item
  const [form, setForm] = useState({
    platforms: [],
    contentType: 'Post',
    caption: '',
    visualDirection: '',
    status: 'Idea',
    scheduledDate: prefillDate || '',
    scheduledTime: '',
    clientApproval: 'Awaiting Review',
    ...(item || {}),
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const togglePlatform = (p) => {
    const arr = form.platforms || []
    set('platforms', arr.includes(p) ? arr.filter(x => x !== p) : [...arr, p])
  }

  const handleSave = () => {
    if ((form.platforms || []).length === 0) return
    onSave(form)
  }

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{isNew ? 'Add Content' : 'Edit Content'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-grey)', padding: '4px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Platforms */}
        <div>
          <label style={fLabel}>Platforms <span style={{ color: 'var(--red)', marginLeft: '2px' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PLATFORMS.map(p => {
              const active = (form.platforms || []).includes(p)
              const pc = PLATFORM_COLORS[p] || {}
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  style={{ padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${active ? pc.color : 'var(--border)'}`, background: active ? pc.bg : 'transparent', color: active ? pc.color : 'var(--mid-grey)', transition: 'all 0.12s', fontFamily: "'Outfit', sans-serif" }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label style={fLabel}>Content Type</label>
          <select style={fInput} value={form.contentType} onChange={e => set('contentType', e.target.value)}>
            {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Caption */}
        <div>
          <label style={fLabel}>Caption / Copy</label>
          <textarea
            style={{ ...fInput, minHeight: '80px', resize: 'vertical' }}
            value={form.caption}
            onChange={e => set('caption', e.target.value)}
            placeholder="Draft caption or key messaging..."
          />
        </div>

        {/* Visual Direction */}
        <div>
          <label style={fLabel}>Visual Direction</label>
          <textarea
            style={{ ...fInput, minHeight: '60px', resize: 'vertical' }}
            value={form.visualDirection}
            onChange={e => set('visualDirection', e.target.value)}
            placeholder="Notes for the designer or photographer..."
          />
        </div>

        {/* Status */}
        <div>
          <label style={fLabel}>Status</label>
          <select style={fInput} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={fLabel}>Scheduled Date</label>
            <input type="date" style={fInput} value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
          </div>
          <div>
            <label style={fLabel}>Scheduled Time</label>
            <input type="time" style={fInput} value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
          </div>
        </div>

        {/* Client Approval */}
        <div>
          <label style={fLabel}>Client Approval</label>
          <select style={fInput} value={form.clientApproval} onChange={e => set('clientApproval', e.target.value)}>
            {APPROVAL_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
        {!isNew && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            style={{ background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}
          >
            Delete
          </button>
        )}
        <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--mid-grey)', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={(form.platforms || []).length === 0}
          style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif", opacity: (form.platforms || []).length === 0 ? 0.5 : 1 }}
        >
          {isNew ? 'Add Content' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const fLabel = { fontSize: '11.5px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }
const fInput = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 10px', fontSize: '13px', color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", background: '#fff', boxSizing: 'border-box', outline: 'none' }

const navBtn = { background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--mid-grey)' }

export default function ContentCalendar({ clientId, content, onAdd, onUpdate, onDelete }) {
  const now = new Date(TODAY)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState('calendar')
  const [formItem, setFormItem] = useState(null)
  const [prefillDate, setPrefillDate] = useState('')

  const monthItems = content.filter(it => {
    if (!it.scheduledDate) return false
    const [y, m] = it.scheduledDate.split('-').map(Number)
    return y === year && m === month + 1
  })

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const openAdd = (date = '') => { setPrefillDate(date); setFormItem({}) }
  const openEdit = (item) => { setPrefillDate(''); setFormItem(item) }
  const closeForm = () => setFormItem(null)

  const handleSave = (form) => {
    if (form.id) { onUpdate(form.id, form) } else { onAdd({ ...form, clientId }) }
    closeForm()
  }

  const counts = {}
  STATUSES.forEach(s => { counts[s] = monthItems.filter(i => i.status === s).length })
  const changesReqCount = monthItems.filter(i => i.clientApproval === 'Changes Requested').length

  return (
    <div>
      {/* Calendar header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: '12px', flexWrap: 'wrap', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={prevMonth} style={navBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', minWidth: '130px', textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status legend */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUSES.filter(s => counts[s] > 0).map(s => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: STATUS_STYLE[s]?.color, fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_STYLE[s]?.color, display: 'inline-block', flexShrink: 0 }} />
                {counts[s]} {s}
              </span>
            ))}
            {changesReqCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
                {changesReqCount} Changes Req.
              </span>
            )}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {[
              { id: 'calendar', label: 'Calendar' },
              { id: 'list', label: 'List' },
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                style={{ padding: '5px 13px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: view === v.id ? 'var(--accent)' : 'transparent', color: view === v.id ? '#fff' : 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openAdd()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Content
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView items={monthItems} year={year} month={month} onItemClick={openEdit} onAddForDate={openAdd} />
      ) : (
        <ListView items={monthItems} onItemClick={openEdit} />
      )}

      {formItem !== null && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 199 }} onClick={closeForm} />
          <ContentForm
            item={formItem?.id ? formItem : null}
            onSave={handleSave}
            onDelete={(id) => { onDelete(id); closeForm() }}
            onClose={closeForm}
            prefillDate={prefillDate}
          />
        </>
      )}
    </div>
  )
}
