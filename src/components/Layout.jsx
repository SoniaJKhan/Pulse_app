import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Dashboard from '../pages/Dashboard'
import Clients from '../pages/Clients'
import AlertsPage from '../pages/AlertsPage'
import SocialMediaPage from '../pages/SocialMediaPage'
import SettingsPage from '../pages/SettingsPage'
import VASupport from '../pages/VASupport'
import ResearchPage from '../pages/ResearchPage'
import WebsiteProjectsPage from '../pages/WebsiteProjectsPage'
import ReportsPage from '../pages/ReportsPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import MessagesPage from '../pages/MessagesPage'
import { useAlerts } from '../contexts/AlertsContext'
import { useMessages } from '../hooks/useMessages'

const MOBILE_BP = 768

export default function Layout() {
  const [activePage, setActivePage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BP)
  const [pendingClientId, setPendingClientId] = useState(null)
  const [pendingTab, setPendingTab] = useState(null)

  const { highPriorityCount } = useAlerts()
  const { getTotalUnreadFromClients } = useMessages()
  const unreadMessages = getTotalUnreadFromClients()

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= MOBILE_BP
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const sidebarWidth = isMobile ? 0 : collapsed ? 64 : 248

  const goToClient = (clientId) => {
    setPendingClientId(clientId)
    setPendingTab(null)
    setActivePage('clients')
  }

  const goToClientSocial = (clientId) => {
    setPendingClientId(clientId)
    setPendingTab('Social Media')
    setActivePage('clients')
  }

  const goToClientResearch = (clientId) => {
    setPendingClientId(clientId)
    setPendingTab('Research')
    setActivePage('clients')
  }

  const goToClientWebsite = (clientId) => {
    setPendingClientId(clientId)
    setPendingTab('Website')
    setActivePage('clients')
  }

  const handleNavigate = (page) => {
    setActivePage(page)
    if (page !== 'clients') { setPendingClientId(null); setPendingTab(null) }
  }

  const renderPage = () => {
    if (activePage === 'dashboard') return (
      <Dashboard
        onViewAlerts={() => setActivePage('alerts')}
        onGoToClient={goToClient}
        onNavigate={handleNavigate}
      />
    )
    if (activePage === 'clients') return (
      <Clients
        initialClientId={pendingClientId}
        initialTab={pendingTab}
        onClearInitial={() => { setPendingClientId(null); setPendingTab(null) }}
      />
    )
    if (activePage === 'alerts') return <AlertsPage onGoToClient={goToClient} />
    if (activePage === 'social') return <SocialMediaPage onGoToClientSocial={goToClientSocial} />
    if (activePage === 'settings') return <SettingsPage />
    if (activePage === 'va-support') return <VASupport />
    if (activePage === 'research') return <ResearchPage onGoToClientResearch={goToClientResearch} />
    if (activePage === 'websites') return <WebsiteProjectsPage onGoToClientWebsite={goToClientWebsite} />
    if (activePage === 'reports') return <ReportsPage />
    if (activePage === 'messages') return <MessagesPage />
    return <PlaceholderPage page={activePage} />
  }

  return (
    <div style={styles.root}>
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={isMobile ? false : collapsed}
        onToggleCollapse={() => {
          if (isMobile) setMobileOpen(v => !v)
          else setCollapsed(v => !v)
        }}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        alertBadge={highPriorityCount}
        messageBadge={unreadMessages}
      />

      <div style={{ ...styles.main, marginLeft: isMobile ? 0 : sidebarWidth }}>
        {isMobile && (
          <div style={styles.mobileBar}>
            <button style={styles.hamburger} onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={styles.mobileBrand}>
              <div style={styles.mobileLogo}>P</div>
              <span style={styles.mobileName}>Pulse</span>
            </div>
            {highPriorityCount > 0 && (
              <button
                style={styles.mobileBell}
                onClick={() => setActivePage('alerts')}
                aria-label={`${highPriorityCount} alerts`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span style={styles.mobileBellBadge}>{highPriorityCount}</span>
              </button>
            )}
          </div>
        )}

        <div style={styles.content}>
          {renderPage()}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @media (max-width: 768px) {
          aside {
            transform: translateX(-100%);
            transition: transform 0.22s ease, width 0.22s ease !important;
            width: var(--sidebar-width) !important;
          }
          aside.sidebar--mobile-open {
            transform: translateX(0) !important;
          }
        }
        button:hover { opacity: 0.88; }
        input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(196,135,74,0.15);
          outline: none;
        }
        textarea:focus, select:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(196,135,74,0.12);
          outline: none;
        }
        @media (max-width: 1100px) {
          [data-layout="dash-two-col"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 960px) {
          [data-layout="two-col"] { grid-template-columns: 1fr !important; }
          [data-layout="portal-grid"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          [data-layout="overview-grid"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          [data-layout="client-grid"] { grid-template-columns: 1fr !important; }
          [data-layout="stat-grid"] { grid-template-columns: repeat(2, 1fr) !important; }
          [data-layout="portal-stats"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', background: 'var(--bg)' },
  main: {
    minHeight: '100vh',
    transition: 'margin-left var(--transition)',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileBar: {
    height: '56px',
    background: '#1A1A1A',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '14px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#fff',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  mobileBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  mobileLogo: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'var(--accent)',
    color: '#fff',
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileName: {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
  },
  mobileBell: {
    position: 'relative',
    background: 'none',
    border: 'none',
    color: '#fff',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  mobileBellBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'var(--red)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, overflowY: 'auto' },
}
