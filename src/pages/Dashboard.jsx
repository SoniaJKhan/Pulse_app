import React, { useState, useMemo } from 'react'
import { useAlerts } from '../contexts/AlertsContext'
import { useClients } from '../hooks/useClients'
import { useVATasks } from '../hooks/useVATasks'
import { timeOutstanding, timeAgo } from '../utils/time'
import { ALERT_META } from '../data/alertEngine'
import DailyDigest from '../components/DailyDigest'

// ── Business type helpers ─────────────────────────────────────────────────────

const BIZ_EMOJI = {
  'Yoga Studio': '🧘',
  'Wellness Clinic': '🌿',
  'Personal Training Studio': '💪',
  'Spa': '💆',
  'Gym': '🏋️',
  'Nutrition': '🥗',
  'Pilates Studio': '🧘',
  'Gym / CrossFit': '🏋️',
  'Other': '✨',
}

const BIZ_GRADIENT = {
  'Yoga Studio':               'linear-gradient(135deg, #C4874A 0%, #9A6030 100%)',
  'Wellness Clinic':           'linear-gradient(135deg, #4A7C5C 0%, #2D5A3D 100%)',
  'Personal Training Studio':  'linear-gradient(135deg, #C4503A 0%, #8A3020 100%)',
  'Spa':                       'linear-gradient(135deg, #C4874A 0%, #7A5230 100%)',
  'Gym':                       'linear-gradient(135deg, #3A3430 0%, #1A1410 100%)',
  'Nutrition':                 'linear-gradient(135deg, #4A8C8C 0%, #2A6060 100%)',
  'Other':                     'linear-gradient(135deg, #8A7A6A 0%, #5A4A3A 100%)',
}

const getGradient = (bizType) =>
  BIZ_GRADIENT[bizType] || 'linear-gradient(135deg, #C4874A 0%, #8A5A2A 100%)'

const getEmoji = (bizType) => BIZ_EMOJI[bizType] || '✨'

// ── Service tags ──────────────────────────────────────────────────────────────

const PACKAGE_SERVICES = {
  'Starter':      ['Social Media'],
  'Growth':       ['Social Media', 'Operations'],
  'Full Service': ['Social Media', 'Operations', 'Research', 'Website'],
  'Custom':       ['Social Media', 'Operations', 'Research', 'VA Support', 'Website'],
}

const SERVICE_STYLE = {
  'Social Media': { bg: 'rgba(196,135,74,0.18)', color: '#C4874A', label: 'Social' },
  'Operations':   { bg: 'rgba(74,124,92,0.18)',  color: '#4A7C5C', label: 'Ops' },
  'Research':     { bg: 'rgba(74,140,140,0.18)', color: '#4A8C8C', label: 'Research' },
  'VA Support':   { bg: 'rgba(138,122,106,0.18)',color: '#8A7A6A', label: 'VA' },
  'Website':      { bg: 'rgba(58,52,48,0.18)',   color: '#3A3430', label: 'Website' },
}

function healthDotColor(score) {
  if (score >= 7) return '#4A7C5C'
  if (score >= 4) return '#C4874A'
  return '#C4503A'
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, warning, danger, icon }) {
  const bg    = danger ? 'rgba(196,80,58,0.08)'  : warning ? 'rgba(196,135,74,0.08)' : 'var(--bg-card)'
  const valColor = danger ? 'var(--red)' : warning ? 'var(--accent)' : 'var(--dark)'
  const borderColor = danger ? 'rgba(196,80,58,0.2)' : warning ? 'rgba(196,135,74,0.25)' : 'var(--border)'
  return (
    <div style={{ ...cs.card, background: bg, borderColor }}>
      <div style={cs.top}>
        <span style={cs.label}>{label}</span>
        <span style={{ color: 'var(--mid-grey)', opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ ...cs.value, color: valColor }}>{value}</div>
    </div>
  )
}

const cs = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'var(--shadow-card)' },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: '12px', fontWeight: 600, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  value: { fontSize: '32px', fontFamily: "'DM Mono', monospace", fontWeight: 500, lineHeight: 1 },
}

// ── Dashboard client card ─────────────────────────────────────────────────────

function ClientDashCard({ client, onClick }) {
  const services = PACKAGE_SERVICES[client.package] || ['Social Media']
  const emoji = getEmoji(client.businessType)
  const gradient = getGradient(client.businessType)
  const dotColor = healthDotColor(client.healthScore)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...cc.card,
        boxShadow: hovered ? '0 4px 20px rgba(26,26,26,0.12)' : 'var(--shadow-card)',
        borderColor: hovered ? 'rgba(196,135,74,0.35)' : 'var(--border)',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div style={{ ...cc.thumb, background: gradient }}>
        <span style={cc.emoji}>{emoji}</span>
        {/* Health dot */}
        <div style={{ ...cc.healthDot, background: dotColor }} title={`Health: ${client.healthScore}/10`} />
      </div>

      {/* Info */}
      <div style={cc.body}>
        <div style={cc.bizName}>{client.businessName}</div>
        <div style={cc.bizMeta}>
          {client.businessType}
          {client.country && <span style={cc.location}> · {client.country}</span>}
        </div>

        {/* Service tags */}
        <div style={cc.tags}>
          {services.map(svc => {
            const st = SERVICE_STYLE[svc]
            return (
              <span key={svc} style={{ ...cc.tag, background: st.bg, color: st.color }}>
                {st.label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const cc = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  thumb: {
    height: '96px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  emoji: {
    fontSize: '36px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  healthDot: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.8)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  body: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  bizName: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--dark)',
    fontFamily: "'Libre Baskerville', serif",
    lineHeight: 1.25,
  },
  bizMeta: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    lineHeight: 1.3,
  },
  location: {
    color: 'var(--mid-grey)',
  },
  tags: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  tag: {
    fontSize: '10.5px',
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: '20px',
    letterSpacing: '0.03em',
  },
}

// ── Alert grouped by client ───────────────────────────────────────────────────

function ClientAlertGroup({ clientId, clientName, clientBizType, alerts, onResolve, onGoToClient }) {
  const [open, setOpen] = useState(true)

  const high   = alerts.filter(a => a.priority === 'High').length
  const medium = alerts.filter(a => a.priority === 'Medium').length
  const badgeColor = high > 0 ? 'var(--red)' : medium > 0 ? 'var(--accent)' : 'var(--green)'
  const badgeBg    = high > 0 ? 'rgba(196,80,58,0.1)' : medium > 0 ? 'rgba(196,135,74,0.12)' : 'rgba(74,124,92,0.1)'

  const sorted = [...alerts].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 }
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
  })

  return (
    <div style={ag.group}>
      <button style={ag.header} onClick={() => setOpen(o => !o)}>
        <div style={ag.headerLeft}>
          <div style={ag.initials}>
            {clientName.charAt(0)}
          </div>
          <div style={ag.headerText}>
            <span style={ag.clientName}>{clientName}</span>
            <span style={ag.clientBiz}>{clientBizType}</span>
          </div>
        </div>
        <div style={ag.headerRight}>
          <span style={{ ...ag.countBadge, background: badgeBg, color: badgeColor }}>
            {alerts.length}
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--mid-grey)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {open && (
        <div style={ag.body}>
          {sorted.map(alert => {
            const meta = ALERT_META[alert.type] || {}
            const borderColor = alert.priority === 'High' ? 'var(--red)' : alert.priority === 'Medium' ? 'var(--accent)' : 'var(--green)'
            return (
              <div key={alert.id} style={{ ...ag.alertRow, borderLeftColor: borderColor }}>
                <div style={ag.alertMain}>
                  <span style={ag.alertTitle}>{meta.label || alert.type}</span>
                  <span style={ag.alertDesc}>{alert.description}</span>
                  <span style={ag.alertTime}>{timeOutstanding(alert.createdAt)} outstanding</span>
                </div>
                <button style={ag.resolveBtn} onClick={() => onResolve(alert.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Resolve
                </button>
              </div>
            )
          })}
          <button style={ag.viewBtn} onClick={() => onGoToClient(clientId)}>
            View client record →
          </button>
        </div>
      )}
    </div>
  )
}

const ag = {
  group: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontFamily: "'Outfit', sans-serif",
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  initials: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(196,135,74,0.12)',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: "'Libre Baskerville', serif",
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  },
  clientName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--dark)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clientBiz: {
    fontSize: '11px',
    color: 'var(--mid-grey)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  countBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '20px',
  },
  body: {
    borderTop: '1px solid var(--border)',
  },
  alertRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    borderLeft: '3px solid',
  },
  alertMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  alertTitle: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--dark)',
  },
  alertDesc: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    lineHeight: 1.4,
  },
  alertTime: {
    fontSize: '11px',
    color: 'var(--mid-grey)',
    fontWeight: 500,
  },
  resolveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(74,124,92,0.1)',
    color: 'var(--green)',
    border: '1.5px solid rgba(74,124,92,0.25)',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  viewBtn: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Outfit', sans-serif",
  },
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Dashboard({ onViewAlerts, onGoToClient }) {
  const { alerts, unresolved, highPriorityCount, resolveAlert } = useAlerts()
  const { clients } = useClients()
  const { tasks, updateTask } = useVATasks()

  const today = new Date().toISOString().slice(0, 10)
  const activeClients = useMemo(() => clients.filter(c => c.status !== 'Churned'), [clients])
  const tasksDueToday = useMemo(() => tasks.filter(t => t.due === today && t.status !== 'done' && t.status !== 'overdue'), [tasks, today])
  const overdueTasks = useMemo(() => tasks.filter(t => t.due < today && t.status !== 'done'), [tasks, today])
  const overdueCount = overdueTasks.length

  const alertsByClient = useMemo(() => {
    const groups = {}
    const unresolvedAlerts = alerts.filter(a => !a.resolved)
    unresolvedAlerts.forEach(alert => {
      if (!groups[alert.clientId]) {
        const client = clients.find(c => c.id === alert.clientId)
        groups[alert.clientId] = {
          clientId: alert.clientId,
          clientName: alert.clientName || 'Unknown Client',
          clientBizType: client?.businessType || '',
          alerts: [],
        }
      }
      groups[alert.clientId].alerts.push(alert)
    })
    return Object.values(groups).sort((a, b) => {
      const aHigh = a.alerts.some(x => x.priority === 'High') ? 0 : 1
      const bHigh = b.alerts.some(x => x.priority === 'High') ? 0 : 1
      return aHigh - bHigh
    })
  }, [alerts, clients])

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={s.page}>
      {/* Page header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>{todayLabel}</p>
        </div>
        <button style={s.actionBtn} onClick={onViewAlerts}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          View All Alerts
        </button>
      </div>

      {/* Daily Digest */}
      <DailyDigest onViewAlerts={onViewAlerts} />

      {/* Stat cards */}
      <div style={s.statGrid} data-layout="stat-grid">
        <StatCard
          label="Active Clients"
          value={clients.filter(c => c.status === 'Active').length}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Tasks Due Today"
          value={tasksDueToday.length}
          warning={tasksDueToday.length > 0}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Overdue Items"
          value={overdueCount}
          warning={overdueCount > 0}
          danger={overdueCount > 3}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
        <StatCard
          label="Unresolved Alerts"
          value={unresolved.length}
          danger={unresolved.length > 0}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
        />
      </div>

      {/* Main two-col */}
      <div style={s.twoCol} data-layout="dash-two-col">
        {/* Left: Client grid */}
        <div>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Clients</h2>
            <span style={s.sectionMeta}>{activeClients.length} active</span>
          </div>
          {activeClients.length === 0 ? (
            <div style={s.emptyState}>
              <span style={s.emptyEmoji}>🌱</span>
              <p style={s.emptyTitle}>No active clients yet</p>
              <p style={s.emptySub}>Add your first client to get started.</p>
            </div>
          ) : (
            <div style={s.clientGrid}>
              {activeClients.map(client => (
                <ClientDashCard
                  key={client.id}
                  client={client}
                  onClick={() => onGoToClient && onGoToClient(client.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Tasks + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Tasks due today */}
          <div>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Tasks Due Today</h2>
              {tasksDueToday.length > 0 && (
                <span style={{ ...s.sectionMeta, background: 'rgba(196,135,74,0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                  {tasksDueToday.length}
                </span>
              )}
            </div>
            {tasksDueToday.length === 0 ? (
              <div style={{ ...s.emptyState, padding: '24px 20px' }}>
                <span style={{ fontSize: '24px', marginBottom: '6px' }}>✅</span>
                <p style={{ ...s.emptyTitle, fontSize: '14px' }}>No tasks due today</p>
                <p style={s.emptySub}>You're all caught up for today.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasksDueToday.map(task => (
                  <div key={task.id} style={s.taskRow}>
                    <div style={s.taskInfo}>
                      <span style={s.taskTitle}>{task.title}</span>
                      {task.clientName && <span style={s.taskClient}>{task.clientName}</span>}
                    </div>
                    <button
                      style={s.completeBtn}
                      onClick={() => updateTask(task.id, { status: 'done' })}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Alerts */}
          <div>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Active Alerts</h2>
              {unresolved.length > 0 && (
                <span style={{ ...s.sectionMeta, background: 'rgba(196,80,58,0.12)', color: 'var(--red)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                  {unresolved.length}
                </span>
              )}
            </div>
            {alertsByClient.length === 0 ? (
              <div style={{ ...s.emptyState, padding: '24px 20px' }}>
                <span style={{ fontSize: '24px', marginBottom: '6px' }}>✅</span>
                <p style={{ ...s.emptyTitle, fontSize: '14px' }}>All clear</p>
                <p style={s.emptySub}>No active alerts.</p>
              </div>
            ) : (
              <div style={s.alertGroups}>
                {alertsByClient.map(group => (
                  <ClientAlertGroup
                    key={group.clientId}
                    {...group}
                    onResolve={resolveAlert}
                    onGoToClient={onGoToClient || (() => {})}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    padding: '32px',
    maxWidth: '1500px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--mid-grey)',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 18px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    alignItems: 'start',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--dark)',
    fontFamily: "'Libre Baskerville', serif",
  },
  sectionMeta: {
    fontSize: '12px',
    color: 'var(--mid-grey)',
    fontWeight: 500,
  },
  clientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  },
  alertGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    boxShadow: 'var(--shadow-card)',
    gap: '6px',
  },
  emptyEmoji: {
    fontSize: '40px',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--dark)',
  },
  emptySub: {
    fontSize: '13px',
    color: 'var(--mid-grey)',
    lineHeight: 1.5,
  },
  taskRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '10px 14px',
    boxShadow: 'var(--shadow-card)',
  },
  taskInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  taskTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  taskClient: { fontSize: '11.5px', color: 'var(--accent)', fontWeight: 500 },
  completeBtn: {
    display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
    background: 'rgba(74,124,92,0.12)', color: 'var(--green)',
    border: '1.5px solid rgba(74,124,92,0.3)', borderRadius: '7px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
}
