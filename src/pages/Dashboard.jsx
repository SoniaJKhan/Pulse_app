import React, { useState, useMemo } from 'react'
import { useAlerts } from '../contexts/AlertsContext'
import { useClients } from '../hooks/useClients'
import { useVATasks } from '../hooks/useVATasks'
import { useSocialData } from '../hooks/useSocialData'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG   = '#111010'
const CARD = '#161514'
const PU   = '#C4874A'
const OR   = '#C4874A'
const YL   = '#C4874A'
const GR   = '#5DA875'
const TX   = '#FFFFFF'
const MI   = 'rgba(255,255,255,0.6)'
const BD   = 'rgba(255,255,255,0.08)'
const R    = '14px'
const SH   = '0 2px 20px rgba(0,0,0,0.4)'
const FF   = "'Outfit', sans-serif"

// ── Helpers ───────────────────────────────────────────────────────────────────
function thisMonth() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hh = parseInt(h, 10)
  return `${hh > 12 ? hh - 12 : hh || 12}:${m} ${hh >= 12 ? 'pm' : 'am'}`
}

const PLAT_COL = { Instagram: '#E1306C', TikTok: '#010101', YouTube: '#FF0000', LinkedIn: '#0A66C2', Facebook: '#1877F2' }
const STAT_COL = {
  Scheduled: { bg: 'rgba(196,135,74,0.15)', c: PU },
  Draft: { bg: 'rgba(255,255,255,0.08)', c: MI },
  Live: { bg: 'rgba(93,168,117,0.15)', c: GR },
  'Pending Approval': { bg: 'rgba(200,154,26,0.15)', c: '#C89A1A' },
  'Changes Requested': { bg: 'rgba(196,80,58,0.15)', c: '#C4503A' },
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Wavy sparkline ───────────────────────────────────────────────────────────
function WaveLine({ color = PU, w = 72, h = 22 }) {
  const p = `M0,${h * 0.6} C${w * 0.18},${h * 0.15} ${w * 0.38},${h * 0.82} ${w * 0.58},${h * 0.4} C${w * 0.72},${h * 0.12} ${w * 0.86},${h * 0.72} ${w},${h * 0.38}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={p} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, iconBg, icon, change, waveColor }) {
  const isPos = typeof change === 'number' && change > 0
  const isNeg = typeof change === 'number' && change < 0
  return (
    <div style={{ background: CARD, borderRadius: R, padding: '20px 22px', boxShadow: SH, border: `1px solid ${BD}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: MI, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FF, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TX, fontFamily: FF, lineHeight: 1 }}>{value}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: isPos ? GR : isNeg ? '#C4503A' : MI, fontFamily: FF }}>
          {isPos ? '↑' : isNeg ? '↓' : '—'}&nbsp;
          {change != null ? `${Math.abs(change)}% vs last week` : 'No data yet'}
        </span>
        <WaveLine color={waveColor} />
      </div>
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function SPill({ s }) {
  const c = STAT_COL[s] || { bg: 'rgba(255,255,255,0.08)', c: MI }
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: c.bg, color: c.c, fontFamily: FF, whiteSpace: 'nowrap' }}>{s}</span>
  )
}

// ── Platform dot ──────────────────────────────────────────────────────────────
function PlatDot({ p, size = 9 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: PLAT_COL[p] || MI, display: 'inline-block', flexShrink: 0 }} />
}

// ── Hero illustration ─────────────────────────────────────────────────────────
function HeroIllus() {
  return (
    <svg width="180" height="150" viewBox="0 0 180 150" fill="none" style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', opacity: 0.22, pointerEvents: 'none' }}>
      <circle cx="130" cy="65" r="68" fill={YL} />
      <ellipse cx="105" cy="108" rx="52" ry="28" fill="white" />
      <rect x="72" y="24" width="68" height="8" rx="4" fill="white" opacity="0.7" transform="rotate(-16 72 24)" />
      <rect x="52" y="58" width="88" height="6" rx="3" fill="white" opacity="0.45" transform="rotate(-10 52 58)" />
      <circle cx="88" cy="88" r="18" fill="white" opacity="0.15" />
      <rect x="78" y="80" width="20" height="14" rx="4" fill="white" opacity="0.2" />
    </svg>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ onViewAlerts, onGoToClient, onNavigate }) {
  const { alerts, unresolved } = useAlerts()
  const { clients } = useClients()
  const { tasks, updateTask } = useVATasks()
  const { content } = useSocialData()
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

  const activeClients = useMemo(() => clients.filter(c => c.status !== 'Churned'), [clients])
  const tasksDueToday = useMemo(() => tasks.filter(t => t.due === todayStr && t.status !== 'done'), [tasks, todayStr])
  const unresolvedAlerts = useMemo(() => alerts.filter(a => !a.resolved), [alerts])

  // Stat card data
  const postsScheduled = useMemo(() => content.filter(c => c.status === 'Scheduled').length, [content])
  const newLeads = useMemo(() => clients.filter(c => c.status === 'Active' || c.status === 'Prospect').length, [clients])
  const pendingApprovals = useMemo(() => content.filter(c => c.status === 'Pending Approval').length, [content])
  const messagesCount = unresolvedAlerts.length

  // Upcoming content (next 6 posts)
  const upcomingContent = useMemo(() => {
    return [...content]
      .filter(c => c.scheduledDate >= todayStr || c.status === 'Scheduled')
      .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''))
      .slice(0, 6)
  }, [content, todayStr])

  // Streak: days this week with content
  const dayDots = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - now.getDay() + i)
      const key = d.toISOString().slice(0, 10)
      const hasContent = content.some(c => c.scheduledDate === key || c.createdAt?.startsWith(key))
      days.push({ label: DAY_LABELS[i], key, hasContent, isToday: key === todayStr, isPast: d < now && key !== todayStr })
    }
    return days
  }, [content, todayStr])

  const streakCount = useMemo(() => {
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const hasActivity = content.some(c => c.scheduledDate === key || c.createdAt?.startsWith(key))
      if (hasActivity) count++
      else if (i > 0) break
    }
    return Math.max(1, count)
  }, [content])

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FF }}>
      <div style={{ padding: '28px 32px', maxWidth: 1400 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          {/* Greeting */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: '0 0 3px', fontSize: 24, fontWeight: 800, color: TX, fontFamily: FF, display: 'flex', alignItems: 'center', gap: 8 }}>
              {greeting} {greetEmoji}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: FF }}>
              Here's what's happening with your content today.
            </p>
          </div>

          {/* Search */}
          <div style={{ flex: '0 1 320px', position: 'relative', minWidth: 200 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MI} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search anything…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 38px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 14, fontFamily: FF, color: TX, background: CARD, outline: 'none', boxShadow: SH }}
            />
          </div>

          {/* Bell */}
          <button
            onClick={onViewAlerts}
            style={{ width: 42, height: 42, borderRadius: 10, background: CARD, border: `1.5px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', boxShadow: SH, flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MI} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unresolvedAlerts.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#C4503A', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unresolvedAlerts.length}
              </span>
            )}
          </button>

          {/* Create New */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowCreateMenu(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, boxShadow: `0 4px 16px ${PU}40` }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create New
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showCreateMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowCreateMenu(false)} />
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: CARD, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: `1px solid ${BD}`, zIndex: 99, minWidth: 180, overflow: 'hidden' }}>
                  {[
                    { icon: '👤', label: 'New Client', action: () => { onGoToClient && onGoToClient(null); setShowCreateMenu(false) } },
                    { icon: '📝', label: 'New Post', action: () => { onNavigate && onNavigate('social'); setShowCreateMenu(false) } },
                    { icon: '✅', label: 'New Task', action: () => { onNavigate && onNavigate('va-support'); setShowCreateMenu(false) } },
                    { icon: '📋', label: 'New Report', action: () => { onNavigate && onNavigate('reports'); setShowCreateMenu(false) } },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FF, fontSize: 14, color: TX, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = BG}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard
            label="New Leads"
            value={newLeads}
            iconBg="rgba(245,114,42,0.12)"
            waveColor={OR}
            change={null}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard
            label="Messages"
            value={messagesCount}
            iconBg="rgba(74,124,92,0.12)"
            waveColor={GR}
            change={null}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          />
          <StatCard
            label="Posts Scheduled"
            value={postsScheduled}
            iconBg="rgba(108,76,241,0.10)"
            waveColor={PU}
            change={null}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PU} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <StatCard
            label="Pending Approvals"
            value={pendingApprovals}
            iconBg="rgba(245,197,66,0.15)"
            waveColor={YL}
            change={null}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C89A1A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
        </div>

        {/* Main two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start', marginBottom: 28 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Hero banner */}
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #161514 100%)', borderRadius: R, padding: '36px 40px', color: '#fff', boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, position: 'relative', overflow: 'hidden', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${BD}` }}>
              <HeroIllus />
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 360 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', opacity: 0.6, marginBottom: 10, fontFamily: FF }}>Your workspace</div>
                <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: '#fff', fontFamily: FF }}>
                  What's the plan today, creator 😎
                </h2>
                <p style={{ margin: '0 0 24px', fontSize: 14, opacity: 0.8, lineHeight: 1.6, fontFamily: FF, color: '#fff' }}>
                  Craft content, manage clients, close deals — you got this.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onNavigate && onNavigate('social')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: 'none', background: OR, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, boxShadow: `0 4px 16px ${OR}50` }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Create New Post
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('social')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}
                  >
                    View Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TX, fontFamily: FF }}>Upcoming Content</h2>
                <button onClick={() => onNavigate && onNavigate('social')} style={{ background: 'none', border: 'none', color: OR, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>View Calendar →</button>
              </div>
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
                {upcomingContent.map(item => {
                  const platColor = PLAT_COL[item.platforms?.[0]] || PU
                  return (
                    <div key={item.id} style={{ background: CARD, borderRadius: 12, minWidth: 160, maxWidth: 180, flexShrink: 0, overflow: 'hidden', boxShadow: SH, border: `1px solid ${BD}` }}>
                      <div style={{ height: 80, background: `linear-gradient(135deg, ${platColor}22 0%, ${platColor}44 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <PlatDot p={item.platforms?.[0]} size={24} />
                        <div style={{ position: 'absolute', top: 8, right: 8 }}><SPill s={item.status || 'Draft'} /></div>
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: TX, fontFamily: FF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                          {item.title || item.caption?.slice(0, 40) || 'Untitled'}
                        </div>
                        <div style={{ fontSize: 11, color: MI, fontFamily: FF }}>{fmtDate(item.scheduledDate)}{item.scheduledTime ? ` · ${fmtTime(item.scheduledTime)}` : ''}</div>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => onNavigate && onNavigate('social')}
                  style={{ background: `${PU}08`, border: `1.5px dashed ${PU}50`, borderRadius: 12, minWidth: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', padding: '20px 16px' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${PU}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PU} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: PU, fontFamily: FF, textAlign: 'center' }}>Create New Post</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Today's Tasks */}
            <div style={{ background: CARD, borderRadius: R, padding: '20px', boxShadow: SH, border: `1px solid ${BD}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: FF }}>Today's Tasks</h3>
                <button onClick={() => onNavigate && onNavigate('va-support')} style={{ background: 'none', border: 'none', color: OR, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>View All</button>
              </div>
              {tasksDueToday.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 12px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: FF }}>All caught up for today!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tasksDueToday.slice(0, 5).map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: BG, borderRadius: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${PU}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PU} strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TX, fontFamily: FF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                        {task.clientName && <div style={{ fontSize: 11, color: MI, fontFamily: FF, marginTop: 1 }}>{task.clientName}</div>}
                      </div>
                      <button
                        onClick={() => updateTask(task.id, { status: 'done' })}
                        style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 7, background: `${GR}15`, border: `1px solid ${GR}30`, color: GR, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: FF, whiteSpace: 'nowrap' }}
                      >Done</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak */}
            <div style={{ background: CARD, borderRadius: R, padding: '20px', boxShadow: SH, border: `1px solid ${BD}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: TX, fontFamily: FF }}>You're on a roll!</div>
                  <div style={{ fontSize: 12, color: MI, fontFamily: FF, marginTop: 2 }}>
                    <strong style={{ fontSize: 20, color: OR, fontWeight: 800 }}>{streakCount}</strong> day streak
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                {dayDots.map(d => (
                  <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: d.hasContent ? PU : d.isPast ? `${PU}20` : BD,
                      border: d.isToday ? `2px solid ${PU}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: d.isToday ? 'pulse 2s infinite' : 'none',
                    }}>
                      {d.hasContent && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span style={{ fontSize: 10, color: d.isToday ? PU : MI, fontWeight: d.isToday ? 700 : 500, fontFamily: FF }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Overview */}
            <div style={{ background: CARD, borderRadius: R, padding: '20px', boxShadow: SH, border: `1px solid ${BD}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: FF }}>Performance</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: MI, fontFamily: FF, padding: '3px 9px', background: BG, borderRadius: 20, border: `1px solid ${BD}` }}>This Week</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '📅', label: 'Posts Scheduled', value: postsScheduled, color: PU },
                  { icon: '✅', label: 'Tasks Completed', value: tasks.filter(t => t.status === 'done' && t.due >= todayStr.slice(0, 7) + '-01').length, color: GR },
                  { icon: '⚠️', label: 'Active Alerts', value: unresolvedAlerts.length, color: OR },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{m.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF, fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: FF }}>{m.value}</span>
                    <WaveLine color={m.color} w={50} h={18} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tip strip */}
        <div style={{ background: '#161514', borderRadius: R, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${BD}` }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>😊</span>
          <p style={{ margin: 0, flex: 1, fontSize: 14, color: TX, fontFamily: FF, lineHeight: 1.5 }}>
            <strong>Pro tip:</strong> Schedule your content in batches at the start of each week — you'll save hours and stay consistent effortlessly.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('social')}
            style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 9, border: 'none', background: OR, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF, whiteSpace: 'nowrap' }}
          >
            Keep the streak alive →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 ${PU}50 } 50% { box-shadow: 0 0 0 5px ${PU}00 } }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}
