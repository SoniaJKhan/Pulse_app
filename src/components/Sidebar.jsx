import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useClients } from '../hooks/useClients'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
  { id: 'clients', label: 'Clients', emoji: '👥' },
  { id: 'social', label: 'Social Media', emoji: '📱' },
  { id: 'operations', label: 'Operations', emoji: '⚡' },
  { id: 'reports', label: 'Reports', emoji: '📊' },
  { id: 'messages', label: 'Messages', emoji: '💬' },
  { id: 'alerts', label: 'Alerts', emoji: '🔔' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
]

const PU = '#C4874A'
const OR = '#C4874A'
const PL = 'rgba(196,135,74,0.15)'
const PH = 'rgba(255,255,255,0.06)'

const QUOTES = [
  'Consistency beats perfection every time.',
  'Create content that helps people, not just content.',
  'Small actions compound into big results.',
  'Show up, create, repeat.',
  'Your story is your strategy.',
  'Done is better than perfect.',
  'Progress over perfection.',
]

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, alertBadge, messageBadge }) {
  const { user, logout } = useAuth()
  const { clients } = useClients()
  const [hoveredId, setHoveredId] = useState(null)
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  const handleNav = (id) => {
    onNavigate(id)
    if (mobileOpen) onCloseMobile()
  }

  return (
    <>
      {mobileOpen && <div style={s.overlay} onClick={onCloseMobile} />}
      <aside
        style={{
          ...s.sidebar,
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className={mobileOpen ? 'sidebar--mobile-open' : ''}
      >
        {/* Brand */}
        <div style={{ ...s.brand, justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed ? (
            <div style={s.brandInner}>
              <span style={s.brandName}>Pulse</span>
              <span style={s.brandDot}>.</span>
            </div>
          ) : (
            <div style={s.logoMark}>P</div>
          )}
          <button
            style={{ ...s.collapseBtn, marginLeft: collapsed ? 0 : undefined }}
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {NAV_ITEMS.map(item => {
            const isActive = activePage === item.id
            const isHovered = hoveredId === item.id && !isActive
            const badge = item.id === 'alerts' ? (alertBadge || 0) : item.id === 'messages' ? (messageBadge || 0) : item.id === 'clients' ? (clients.length || 0) : 0
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                title={collapsed ? item.label : undefined}
                style={{
                  ...s.navItem,
                  background: isActive ? PL : isHovered ? PH : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  borderLeft: `3px solid ${isActive ? PU : 'transparent'}`,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '10px 12px',
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
                {!collapsed && (
                  <>
                    <span style={{ ...s.navLabel, color: isActive ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </span>
                    {badge > 0 && <span style={{ ...s.badge, background: item.id === 'clients' ? PU : '#C4503A' }}>{badge}</span>}
                  </>
                )}
                {collapsed && badge > 0 && <span style={s.badgeDot} />}
              </button>
            )
          })}
        </nav>

        {/* Quote card */}
        {!collapsed && (
          <div style={s.quoteCard}>
            <div style={s.quoteIllus}>
              <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
                <circle cx="26" cy="19" r="13" fill={PU} opacity="0.1" />
                <circle cx="44" cy="8" r="7" fill={OR} opacity="0.13" />
                <circle cx="8" cy="30" r="5" fill="#F5C542" opacity="0.18" />
                <rect x="18" y="13" width="16" height="10" rx="3" fill={PU} opacity="0.08" />
              </svg>
            </div>
            <p style={s.quoteText}>"{quote}"</p>
          </div>
        )}

        {/* User profile */}
        <div style={{ ...s.userArea, padding: collapsed ? '14px 0' : '12px 14px' }}>
          {!collapsed && <div style={s.userDivider} />}
          <div style={{ ...s.userInner, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={s.avatar}>{user?.initials || 'SK'}</div>
            {!collapsed && (
              <>
                <div style={s.userInfo}>
                  <span style={s.userName}>{user?.name || 'Sonia Khan'}</span>
                  <span style={s.userRole}>Content Creator</span>
                </div>
                <button onClick={logout} style={s.signOutBtn} title="Sign out">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button onClick={logout} style={{ ...s.signOutBtn, marginTop: 10, display: 'flex', justifyContent: 'center', width: '100%' }} title="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 49,
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0, height: '100vh',
    background: '#0D0C0C',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column',
    transition: 'width var(--transition)',
    zIndex: 50, overflow: 'hidden',
    boxShadow: '2px 0 20px rgba(0,0,0,0.4)',
  },
  brand: {
    display: 'flex', alignItems: 'center',
    padding: '18px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    minHeight: 64, flexShrink: 0,
  },
  brandInner: { display: 'flex', alignItems: 'center', gap: 1 },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1,
  },
  brandDot: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 26, fontWeight: 900, color: OR, lineHeight: 1, marginLeft: 1,
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    background: PU, color: '#fff',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  collapseBtn: {
    background: PH, border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 7, width: 26, height: 26,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: PU, cursor: 'pointer', flexShrink: 0,
  },
  nav: {
    flex: 1, overflowY: 'auto', overflowX: 'hidden',
    padding: '10px 8px',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: 'none', borderRadius: 10, width: '100%',
    cursor: 'pointer', transition: 'background 0.12s',
    position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap',
    fontFamily: "'Outfit', sans-serif",
  },
  navLabel: { fontSize: 14, flex: 1, textAlign: 'left', fontFamily: "'Outfit', sans-serif" },
  badge: {
    background: '#C4503A', color: '#fff', fontSize: 10, fontWeight: 700,
    padding: '2px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, background: '#C4503A', borderRadius: '50%',
  },
  quoteCard: {
    margin: '8px 10px 6px', padding: '14px 14px',
    background: '#161514',
    borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`,
    flexShrink: 0, position: 'relative', overflow: 'hidden',
  },
  quoteIllus: { position: 'absolute', bottom: 4, right: 4, opacity: 0.4 },
  quoteText: {
    margin: 0, fontSize: 11.5, lineHeight: 1.6,
    color: 'rgba(255,255,255,0.6)', fontWeight: 500,
    fontFamily: "'Outfit', sans-serif", fontStyle: 'italic',
    maxWidth: '85%',
  },
  userArea: {
    borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
  },
  userDivider: { marginBottom: 8 },
  userInner: { display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: `linear-gradient(135deg, ${PU} 0%, #C4874A 100%)`,
    color: '#fff', fontSize: 11, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif",
  },
  userInfo: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  userName: {
    fontSize: 13, fontWeight: 700, color: '#FFFFFF',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    fontFamily: "'Outfit', sans-serif",
  },
  userRole: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)',
    fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap',
  },
  signOutBtn: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
    padding: '4px', borderRadius: 6,
    display: 'flex', alignItems: 'center', flexShrink: 0,
  },
}
