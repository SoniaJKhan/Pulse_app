import React, { useState, useMemo } from 'react'
import { useAlerts } from '../contexts/AlertsContext'
import { ALERT_META } from '../data/alertEngine'
import { timeAgo, timeOutstanding } from '../utils/time'

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

const PRIORITY_STYLE = {
  High:   { bg: 'rgba(196,80,58,0.14)',   color: '#C4503A', border: '#C4503A' },
  Medium: { bg: 'rgba(196,135,74,0.14)', color: '#C4874A', border: '#C4874A' },
  Low:    { bg: 'rgba(74,124,92,0.14)',   color: '#4A7C5C', border: '#4A7C5C' },
}

const TYPE_ICONS = {
  'task-overdue':     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  'monthly-report':   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  'content-pending':  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  'response-time':    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  'quarterly-review': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  'day7-checkin':     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  'at-risk-member':   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  'survey-not-sent':  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
}

const SNOOZE_OPTIONS = [
  { label: '24 hours', hours: 24 },
  { label: '3 days',   hours: 72 },
  { label: '7 days',   hours: 168 },
]

function AlertCard({ alert, onResolve, onUnresolve, onSnooze, onGoToClient }) {
  const meta = ALERT_META[alert.type] || {}
  const ps = PRIORITY_STYLE[alert.priority] || PRIORITY_STYLE.Medium
  const [showSnooze, setShowSnooze] = useState(false)

  return (
    <div style={{
      ...s.card,
      borderLeftColor: alert.resolved ? 'var(--border)' : ps.border,
      opacity: alert.resolved ? 0.65 : 1,
    }}>
      <div style={s.cardTop}>
        <div style={s.cardTopLeft}>
          <span style={{ ...s.priorityBadge, background: ps.bg, color: ps.color }}>
            {alert.priority}
          </span>
          <span style={{ color: alert.resolved ? 'var(--mid-grey)' : ps.color, display: 'flex', alignItems: 'center' }}>
            {TYPE_ICONS[alert.type]}
          </span>
          <span style={s.alertTitle}>{meta.label || alert.title}</span>
        </div>
        <span style={s.outstanding}>
          {alert.resolved
            ? `Resolved ${timeAgo(alert.resolvedAt)}`
            : `${timeOutstanding(alert.createdAt)} outstanding`}
        </span>
      </div>

      <div style={s.clientRow}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span style={s.clientName}>{alert.clientName}</span>
      </div>

      <p style={s.description}>{alert.description}</p>

      <div style={s.actions}>
        {alert.resolved ? (
          <>
            <span style={s.resolvedTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Resolved
            </span>
            {alert.resolvedBy && (
              <span style={s.resolvedMeta}>
                by {alert.resolvedBy} · {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            )}
            <button style={s.undoBtn} onClick={() => onUnresolve(alert.id)}>Undo</button>
          </>
        ) : (
          <>
            <button style={s.resolveBtn} onClick={() => onResolve(alert.id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Resolve
            </button>
            <div style={{ position: 'relative' }}>
              <button style={s.snoozeBtn} onClick={() => setShowSnooze(v => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12"/><path d="M8 16h8"/></svg>
                Snooze
              </button>
              {showSnooze && (
                <div style={s.snoozeMenu}>
                  {SNOOZE_OPTIONS.map(opt => (
                    <button key={opt.hours} style={s.snoozeOption} onClick={() => { onSnooze(alert.id, opt.hours); setShowSnooze(false) }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button style={s.goToBtn} onClick={() => onGoToClient(alert.clientId)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Record
            </button>
          </>
        )}
        <span style={s.timeAgo}>{timeAgo(alert.createdAt)}</span>
      </div>
    </div>
  )
}

export default function AlertsPage({ onGoToClient }) {
  const { alerts, unresolved, todayAlerts, snoozed, highPriorityCount, resolveAlert, unresolveAlert, snoozeAlert } = useAlerts()
  const [filter, setFilter] = useState('All')

  const counts = useMemo(() => ({
    Today:    todayAlerts.length,
    All:      alerts.filter(a => !a.resolved).length,
    High:     alerts.filter(a => !a.resolved && a.priority === 'High').length,
    Medium:   alerts.filter(a => !a.resolved && a.priority === 'Medium').length,
    Low:      alerts.filter(a => !a.resolved && a.priority === 'Low').length,
    Snoozed:  snoozed.length,
    Resolved: alerts.filter(a => a.resolved).length,
  }), [alerts, todayAlerts, snoozed])

  const visible = useMemo(() => {
    let list
    if (filter === 'Today') list = todayAlerts
    else if (filter === 'Resolved') list = alerts.filter(a => a.resolved)
    else if (filter === 'Snoozed') list = snoozed
    else if (filter === 'All') list = alerts.filter(a => !a.resolved)
    else list = alerts.filter(a => !a.resolved && a.priority === filter)

    return [...list].sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
      const pa = PRIORITY_ORDER[a.priority] ?? 9
      const pb = PRIORITY_ORDER[b.priority] ?? 9
      if (pa !== pb) return pa - pb
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [alerts, filter, todayAlerts, snoozed])

  const FILTERS = ['Today', 'All', 'High', 'Medium', 'Low', 'Snoozed', 'Resolved']

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Alerts</h1>
          <p style={s.subtitle}>Monitor and resolve client alerts before they escalate.</p>
        </div>
        {unresolved.length > 0 && (
          <button style={s.resolveAllBtn} onClick={() => unresolved.forEach(a => resolveAlert(a.id))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Resolve All
          </button>
        )}
      </div>

      <div style={s.summaryRow}>
        {[
          { label: 'High Priority',   count: counts.High,     bg: 'rgba(196,80,58,0.12)',   color: '#C4503A' },
          { label: 'Medium Priority', count: counts.Medium,   bg: 'rgba(196,135,74,0.12)', color: '#C4874A' },
          { label: 'Snoozed',         count: counts.Snoozed,  bg: 'rgba(74,140,140,0.12)', color: '#4A8C8C' },
          { label: 'Resolved',        count: counts.Resolved, bg: 'rgba(74,124,92,0.12)',  color: '#4A7C5C' },
        ].map(({ label, count, bg, color }) => (
          <div key={label} style={{ ...s.summaryCard, background: bg }}>
            <span style={{ ...s.summaryCount, color, fontFamily: "'DM Mono', monospace" }}>{count}</span>
            <span style={{ ...s.summaryLabel, color }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={s.filterBar}>
        {FILTERS.map(f => (
          <button
            key={f}
            style={{ ...s.filterTab, ...(filter === f ? s.filterTabActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f}
            {counts[f] > 0 && (
              <span style={{
                ...s.filterCount,
                background: filter === f ? 'rgba(196,135,74,0.15)' : 'rgba(255,255,255,0.07)',
                color: filter === f ? 'var(--accent)' : 'var(--mid-grey)',
              }}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>
            {filter === 'Today' ? '🌅' : filter === 'Resolved' ? '✅' : filter === 'Snoozed' ? '⏰' : '✅'}
          </span>
          <p style={s.emptyTitle}>
            {filter === 'Today' ? 'No urgent alerts today'
              : filter === 'Resolved' ? 'No resolved alerts yet'
              : filter === 'Snoozed' ? 'No snoozed alerts'
              : filter === 'All' ? 'All clear'
              : `No ${filter.toLowerCase()} priority alerts`}
          </p>
          <p style={s.emptySub}>
            {filter === 'Today'
              ? 'Your clients are all on track right now.'
              : filter === 'All' && unresolved.length === 0
              ? 'All systems clear — nothing requires attention right now.'
              : 'Try a different filter to see more alerts.'}
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {visible.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={resolveAlert}
              onUnresolve={unresolveAlert}
              onSnooze={snoozeAlert}
              onGoToClient={onGoToClient}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '32px', maxWidth: '960px' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '24px', gap: '16px', flexWrap: 'wrap',
  },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--dark)', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: 'var(--mid-grey)' },
  resolveAllBtn: {
    display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
    background: 'rgba(74,124,92,0.12)', color: 'var(--green)',
    border: '1.5px solid rgba(74,124,92,0.3)', borderRadius: 'var(--radius)',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' },
  summaryCard: {
    borderRadius: 'var(--radius)', padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: '4px',
    border: '1px solid var(--border)',
  },
  summaryCount: { fontSize: '28px', fontWeight: 500, lineHeight: 1 },
  summaryLabel: { fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 },
  filterBar: {
    display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)',
    marginBottom: '20px', overflowX: 'auto',
  },
  filterTab: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
    background: 'none', border: 'none', borderBottom: '2px solid transparent',
    fontSize: '13px', fontWeight: 500, color: 'var(--mid-grey)',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  filterTabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)', fontWeight: 600 },
  filterCount: { fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderLeft: '4px solid', borderRadius: 'var(--radius)',
    padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px',
    boxShadow: 'var(--shadow-card)',
  },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  cardTopLeft: { display: 'flex', alignItems: 'center', gap: '9px' },
  priorityBadge: {
    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  alertTitle: { fontSize: '14px', fontWeight: 700, color: 'var(--dark)' },
  outstanding: { fontSize: '12px', color: 'var(--mid-grey)', whiteSpace: 'nowrap', fontWeight: 500 },
  clientRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  clientName: { fontSize: '13px', fontWeight: 600, color: 'var(--accent)' },
  description: { fontSize: '13.5px', color: 'var(--mid-grey)', lineHeight: 1.55 },
  actions: {
    display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px',
    borderTop: '1px solid var(--border)', flexWrap: 'wrap',
  },
  resolveBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
    background: 'rgba(74,124,92,0.12)', color: 'var(--green)',
    border: '1.5px solid rgba(74,124,92,0.3)', borderRadius: '8px',
    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
  },
  snoozeBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
    background: 'rgba(74,140,140,0.12)', color: '#4A8C8C',
    border: '1.5px solid rgba(74,140,140,0.25)', borderRadius: '8px',
    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
  },
  snoozeMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
    minWidth: '120px',
  },
  snoozeOption: {
    display: 'block', width: '100%', padding: '9px 14px',
    background: 'none', border: 'none', textAlign: 'left',
    fontSize: '13px', color: 'var(--dark)', cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
  },
  goToBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
    background: 'none', color: 'var(--dark)', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
  },
  resolvedTag: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12.5px', fontWeight: 600, color: 'var(--green)',
  },
  resolvedMeta: {
    fontSize: '12px', color: 'var(--mid-grey)', fontStyle: 'italic',
  },
  undoBtn: {
    background: 'none', border: 'none', color: 'var(--mid-grey)', fontSize: '12px',
    cursor: 'pointer', textDecoration: 'underline',
  },
  timeAgo: { marginLeft: 'auto', fontSize: '12px', color: 'var(--mid-grey)' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-card)',
  },
  emptyTitle: { fontSize: '17px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '6px' },
  emptySub: { fontSize: '13.5px', color: 'var(--mid-grey)', maxWidth: '320px', lineHeight: 1.6 },
}
