import React, { useState } from 'react'
import { useAlerts } from '../contexts/AlertsContext'
import { ALERT_META } from '../data/alertEngine'
import { timeOutstanding } from '../utils/time'
import { useVATasks } from '../hooks/useVATasks'

const TYPE_ICONS = {
  'task-overdue':     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  'monthly-report':   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  'content-pending':  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  'response-time':    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  'quarterly-review': <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  'day7-checkin':     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  'at-risk-member':   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  'survey-not-sent':  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
}

export default function DailyDigest({ onViewAlerts }) {
  const { unresolved, highPriorityCount } = useAlerts()
  const { tasks } = useVATasks()
  const [expanded, setExpanded] = useState(true)
  const today = new Date().toISOString().slice(0, 10)

  const high = unresolved.filter(a => a.priority === 'High' && !a.snoozedUntil)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const medium = unresolved.filter(a => a.priority === 'Medium' && !a.snoozedUntil)
  const tasksDueToday = tasks.filter(t => t.due === today && t.status !== 'done' && t.status !== 'overdue')

  const totalAttention = unresolved.length + tasksDueToday.length

  if (totalAttention === 0) {
    return (
      <div style={d.card}>
        <div style={d.header}>
          <div style={d.headerLeft}>
            <div style={d.allClearDot} />
            <div>
              <h2 style={d.title}>Daily Digest</h2>
              <p style={d.sub}>Everything is on track today.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={d.card}>
      <div style={d.header}>
        <div style={d.headerLeft}>
          {highPriorityCount > 0 && <div style={d.urgentDot} />}
          <div>
            <h2 style={d.title}>Daily Digest</h2>
            <p style={d.sub}>
              {unresolved.length > 0 && (
                <span>
                  <span style={{ color: 'var(--red)', fontWeight: 600 }}>{high.length} high</span>
                  {medium.length > 0 && <span style={{ color: 'var(--mid-grey)' }}> · {medium.length} medium</span>}
                  <span style={{ color: 'var(--mid-grey)' }}> requiring attention</span>
                </span>
              )}
              {tasksDueToday.length > 0 && unresolved.length > 0 && <span style={{ color: 'var(--mid-grey)' }}> · </span>}
              {tasksDueToday.length > 0 && (
                <span style={{ color: 'var(--mid-grey)' }}>{tasksDueToday.length} task{tasksDueToday.length !== 1 ? 's' : ''} due today</span>
              )}
            </p>
          </div>
        </div>
        <div style={d.headerRight}>
          <button style={d.viewAllBtn} onClick={onViewAlerts}>
            View all alerts
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button style={d.collapseBtn} onClick={() => setExpanded(v => !v)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {expanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div style={d.body}>
          {/* High priority alerts */}
          {high.length > 0 && (
            <div style={d.section}>
              <div style={d.sectionHeader}>
                <span style={{ ...d.sectionDot, background: 'var(--red)' }} />
                <span style={{ ...d.sectionLabel, color: 'var(--red)' }}>HIGH PRIORITY</span>
              </div>
              {high.map(alert => (
                <div key={alert.id} style={d.item}>
                  <span style={{ ...d.itemIcon, color: 'var(--red)' }}>{TYPE_ICONS[alert.type]}</span>
                  <div style={d.itemContent}>
                    <span style={d.itemTitle}>{ALERT_META[alert.type]?.label || alert.title}</span>
                    <span style={d.itemSep}>—</span>
                    <span style={d.itemDesc}>{alert.description}</span>
                  </div>
                  <span style={d.itemClient}>{alert.clientName}</span>
                  <span style={d.itemTime}>{timeOutstanding(alert.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Medium priority alerts */}
          {medium.length > 0 && (
            <div style={d.section}>
              <div style={d.sectionHeader}>
                <span style={{ ...d.sectionDot, background: 'var(--amber)' }} />
                <span style={{ ...d.sectionLabel, color: 'var(--amber)' }}>MEDIUM PRIORITY</span>
              </div>
              {medium.map(alert => (
                <div key={alert.id} style={d.item}>
                  <span style={{ ...d.itemIcon, color: 'var(--amber)' }}>{TYPE_ICONS[alert.type]}</span>
                  <div style={d.itemContent}>
                    <span style={d.itemTitle}>{ALERT_META[alert.type]?.label || alert.title}</span>
                    <span style={d.itemSep}>—</span>
                    <span style={d.itemDesc}>{alert.description}</span>
                  </div>
                  <span style={d.itemClient}>{alert.clientName}</span>
                  <span style={d.itemTime}>{timeOutstanding(alert.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tasks due today */}
          {tasksDueToday.length > 0 && (
            <div style={d.section}>
              <div style={d.sectionHeader}>
                <span style={{ ...d.sectionDot, background: 'var(--accent)' }} />
                <span style={{ ...d.sectionLabel, color: 'var(--accent)' }}>DUE TODAY</span>
              </div>
              {tasksDueToday.map(task => (
                <div key={task.id} style={d.item}>
                  <span style={{ ...d.itemIcon, color: 'var(--accent)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <div style={d.itemContent}>
                    <span style={d.itemTitle}>Task due today</span>
                    <span style={d.itemSep}>—</span>
                    <span style={d.itemDesc}>{task.title}</span>
                  </div>
                  <span style={d.itemClient}>{task.client}</span>
                  <span style={{ ...d.itemTime, color: 'var(--accent)', fontWeight: 600 }}>Today</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const d = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    borderBottom: '1px solid var(--border)',
    gap: '12px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  urgentDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--red)',
    flexShrink: 0,
    animation: 'pulse 2s ease-in-out infinite',
  },
  allClearDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--green)',
    flexShrink: 0,
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '1px',
  },
  sub: {
    fontSize: '13px',
    lineHeight: 1.4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '6px 12px',
    fontSize: '12.5px',
    fontWeight: 600,
    color: 'var(--dark)',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  collapseBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--mid-grey)',
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    borderBottom: '1px solid var(--border)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 22px 6px',
  },
  sectionDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
  },
  item: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    padding: '8px 22px',
    borderTop: '1px solid rgba(26,26,26,0.04)',
    flexWrap: 'wrap',
  },
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  itemContent: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
    flex: 1,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--dark)',
    whiteSpace: 'nowrap',
  },
  itemSep: {
    fontSize: '13px',
    color: 'var(--border)',
  },
  itemDesc: {
    fontSize: '13px',
    color: 'var(--mid-grey)',
    flex: 1,
    minWidth: 0,
  },
  itemClient: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--accent)',
    background: 'rgba(196,135,74,0.1)',
    padding: '2px 8px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  itemTime: {
    fontSize: '11.5px',
    color: 'var(--mid-grey)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
}
