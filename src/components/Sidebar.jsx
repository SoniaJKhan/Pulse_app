import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    id: 'operations',
    label: 'Growth & Retention',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'research',
    label: 'Research',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    id: 'va-support',
    label: 'VA Support',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
  },
  {
    id: 'websites',
    label: 'Website Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, alertBadge, messageBadge }) {
  const { user, logout } = useAuth()

  const handleNav = (id) => {
    onNavigate(id)
    if (mobileOpen) onCloseMobile()
  }

  return (
    <>
      {mobileOpen && (
        <div style={styles.overlay} onClick={onCloseMobile} />
      )}

      <aside
        style={{
          ...styles.sidebar,
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar${mobileOpen ? ' sidebar--mobile-open' : ''}`}
      >
        {/* Brand */}
        <div style={{ ...styles.brand, justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={styles.brandInner}>
            <div style={styles.logoMark}>P</div>
            {!collapsed && (
              <div style={styles.brandText}>
                <span style={styles.brandName}>Pulse</span>
                <span style={styles.brandSub}>Agency</span>
              </div>
            )}
          </div>
          <button
            style={{ ...styles.collapseBtn, marginLeft: collapsed ? 0 : undefined }}
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {collapsed ? (
                <polyline points="9 18 15 12 9 6"/>
              ) : (
                <polyline points="15 18 9 12 15 6"/>
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => {
            const isActive = activePage === item.id
            const badge = item.id === 'alerts' ? (alertBadge || 0) : item.id === 'messages' ? (messageBadge || 0) : 0
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '10px 14px',
                }}
              >
                <span style={{ ...styles.navIcon, color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.45)' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ ...styles.navLabel, color: isActive ? '#fff' : 'rgba(255,255,255,0.65)' }}>{item.label}</span>
                    {badge > 0 && (
                      <span style={styles.badge}>{badge}</span>
                    )}
                  </>
                )}
                {collapsed && badge > 0 && (
                  <span style={styles.badgeDot} />
                )}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ ...styles.userArea, padding: collapsed ? '16px 0' : '16px' }}>
          {!collapsed && <div style={styles.userDivider} />}
          <div style={{ ...styles.userInner, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={styles.avatar}>{user?.initials || 'U'}</div>
            {!collapsed && (
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user?.name}</span>
                <span style={styles.userRole}>{user?.role === 'admin' ? 'Agency Admin' : 'Client'}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={logout} style={styles.logoutBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          )}
          {collapsed && (
            <button onClick={logout} style={{ ...styles.logoutBtn, justifyContent: 'center', padding: '6px 0', marginTop: '8px', width: '100%' }} title="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,26,26,0.55)',
    zIndex: 49,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: '#1A1A1A',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition)',
    zIndex: 50,
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    minHeight: '64px',
    flexShrink: 0,
  },
  brandInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '17px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  brandName: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
  },
  brandSub: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: '1px',
  },
  collapseBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background var(--transition)',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    width: '100%',
    cursor: 'pointer',
    transition: 'background var(--transition)',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(196, 135, 74, 0.18)',
  },
  navIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
  },
  navLabel: {
    fontSize: '13.5px',
    fontWeight: 500,
    flex: 1,
    textAlign: 'left',
  },
  badge: {
    background: 'var(--red)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '7px',
    height: '7px',
    background: 'var(--red)',
    borderRadius: '50%',
  },
  userArea: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  userDivider: {
    marginBottom: '12px',
  },
  userInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    letterSpacing: '0.03em',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '6px 0',
    marginTop: '8px',
    transition: 'color var(--transition)',
    fontWeight: 500,
  },
}
