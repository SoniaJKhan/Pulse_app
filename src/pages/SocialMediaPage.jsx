import React, { useState, useEffect, useMemo, useCallback } from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', background: '#fff' }}>
          <h2>Social Media section crashed</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useClients } from '../hooks/useClients'
import { useSocialData } from '../hooks/useSocialData'
import {
  BG, CARD, PU, PL, MI, BD, TX, R, SH,
  defAnalysis, loadAnalysis, saveAnalysis, loadBrandKit, preFillIntelligence,
  useToast, ToastBox, APIKeyModal,
  thisMonth,
} from '../components/social/socialUtils.jsx'
import SocialWelcome      from '../components/social/SocialWelcome'
import SocialClientBar    from '../components/social/SocialClientBar'
import SocialClientPanel  from '../components/social/SocialClientPanel'
import SocialTabBar       from '../components/social/SocialTabBar'
import ClientTab          from '../components/social/ClientTab'
import BrandKitTab        from '../components/social/BrandKitTab'
import AuditTab           from '../components/social/AuditTab'
import CompetitorsTab     from '../components/social/CompetitorsTab'
import AnalysisTab        from '../components/social/AnalysisTab'
import StrategyTab        from '../components/social/StrategyTab'
import CreateTab, { NewPostDrawer, IntelligenceOverlay } from '../components/social/CreateTab'
import PublishTab         from '../components/social/PublishTab'
import ReportTab          from '../components/social/ReportTab'

const TABS = [
  { id: 'client',      label: 'Client' },
  { id: 'brandkit',    label: 'Brand Kit' },
  { id: 'audit',       label: 'Audit' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'analysis',    label: 'Analysis' },
  { id: 'strategy',    label: 'Strategy' },
  { id: 'create',      label: 'Create' },
  { id: 'publish',     label: 'Publish' },
  { id: 'report',      label: 'Report' },
]

function getCompletion(clientId) {
  const analysis = (() => { try { return JSON.parse(localStorage.getItem(`pulse_analysis_${clientId}`) || '{}') } catch { return {} } })()
  const brandKit = loadBrandKit(clientId)
  return {
    'Brand Kit':   !!(brandKit.colors?.length || brandKit.voice || brandKit.topics?.length),
    'Audit':       !!(analysis.contentAudit?.length),
    'Competitors': !!(analysis.competitors?.length),
    'Analysis':    !!(analysis.contentResult),
    'Strategy':    !!(analysis.strategyResult),
  }
}

export default function SocialMediaPage() {
  const { clients, saveClient } = useClients()
  const { content, metrics, addContent, updateContent } = useSocialData()
  const { toasts, push: pushToast } = useToast()

  const [selectedId,       setSelectedId]       = useState(null)
  const [activeTab,        setActiveTab]         = useState('client')
  const [clientFormKey,    setClientFormKey]     = useState(0)
  const [profileClient,    setProfileClient]     = useState(null)
  const [showNewPost,      setShowNewPost]       = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showCreateMenu,   setShowCreateMenu]    = useState(false)
  const [showKeyModal,     setShowKeyModal]      = useState(false)

  const client = useMemo(() => clients.find(c => c.id === selectedId) || null, [clients, selectedId])

  const handleClientSaved = useCallback((newClient) => {
    setSelectedId(newClient.id)
    setTimeout(() => setActiveTab('brandkit'), 1000)
  }, [])

  const handleAddNew = () => {
    setClientFormKey(k => k + 1)
    setActiveTab('client')
    setSelectedId(null)
  }

  const handleDeleteClient = useCallback((c) => {
    const displayName = c.name || c.businessName || 'Client'
    if (!window.confirm(`Delete ${displayName}? This cannot be undone.`)) return
    const stored = (() => { try { return JSON.parse(localStorage.getItem('pulse_clients') || '[]') } catch { return [] } })()
    localStorage.setItem('pulse_clients', JSON.stringify(stored.filter(x => x.id !== c.id)))
    ;['pulse_brandkit_', 'pulse_audit_', 'pulse_competitors_', 'pulse_analysis_', 'pulse_strategy_', 'pulse_calendar_'].forEach(prefix => localStorage.removeItem(prefix + c.id))
    window.dispatchEvent(new Event('pulse_clients_updated'))
    if (selectedId === c.id) {
      const remaining = stored.filter(x => x.id !== c.id)
      setSelectedId(remaining.length ? remaining[0].id : null)
    }
  }, [selectedId])

  const [analysis, setAnalysis] = useState(defAnalysis)
  useEffect(() => {
    setAnalysis(selectedId ? loadAnalysis(selectedId) : defAnalysis())
  }, [selectedId])

  const updAnalysis = useCallback((changes) => {
    setAnalysis(prev => {
      const next = { ...prev, ...changes }
      if (selectedId) saveAnalysis(selectedId, next)
      return next
    })
  }, [selectedId])

  const clientContent = useMemo(() => content.filter(c => c.clientId === selectedId), [content, selectedId])
  const clientMetrics = useMemo(() => metrics.filter(m => m.clientId === selectedId), [metrics, selectedId])
  const statScheduled = useMemo(() => clientContent.filter(c => c.status === 'Scheduled').length, [clientContent])
  const statLive      = useMemo(() => clientContent.filter(c => c.status === 'Live' && c.scheduledDate?.startsWith(thisMonth())).length, [clientContent])
  const statPending   = useMemo(() => clientContent.filter(c => c.status === 'Pending Approval').length, [clientContent])
  const statEngRate   = useMemo(() => {
    if (!clientMetrics.length) return null
    return (clientMetrics.reduce((s, m) => s + (m.engagementRate || 0), 0) / clientMetrics.length).toFixed(1)
  }, [clientMetrics])

  const openIntelligence = () => {
    if (selectedId && client) preFillIntelligence(selectedId, client)
    setShowIntelligence(true)
  }
  const goToPublish = () => setActiveTab('publish')

  return (
    <ErrorBoundary>
    <div style={{ fontFamily: "'Outfit',sans-serif", background: BG, minHeight: '100vh' }}>
      <div style={{ padding: '28px 32px 0', maxWidth: 1300 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: '0 0 3px', fontFamily: "'Outfit',sans-serif" }}>Social Media Management</h1>
            <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowCreateMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 16px ${PU}50` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create New
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showCreateMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowCreateMenu(false)} />
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: CARD, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: `1px solid ${BD}`, zIndex: 99, minWidth: 175, overflow: 'hidden' }}>
                  {[
                    { icon: '📝', label: 'New Post',   action: () => { setShowNewPost(true); setShowCreateMenu(false) } },
                    { icon: '🧠', label: 'New Plan',   action: () => { openIntelligence(); setShowCreateMenu(false) } },
                    { icon: '✅', label: 'New Task',   action: () => setShowCreateMenu(false) },
                    { icon: '📋', label: 'New Report', action: () => setShowCreateMenu(false) },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, color: TX, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = BG}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <SocialClientBar
          clients={clients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddNew={handleAddNew}
          onProfileClick={setProfileClient}
          onDeleteClient={handleDeleteClient}
        />

        {selectedId && (
          <SocialClientPanel
            statScheduled={statScheduled}
            statLive={statLive}
            statEngRate={statEngRate}
            statPending={statPending}
          />
        )}

        <SocialTabBar tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      {/* Tab content */}
      <div style={{ padding: '28px 32px 60px', maxWidth: 1280 }}>
        {!selectedId && activeTab !== 'client'
          ? <SocialWelcome />
          : <>
              {activeTab === 'client'      && <ClientTab key={clientFormKey} client={client} saveClient={saveClient} onClientSaved={handleClientSaved} pushToast={pushToast} />}
              {activeTab === 'brandkit'    && <BrandKitTab open={true} onClose={() => setActiveTab('client')} clientId={selectedId} />}
              {activeTab === 'audit'       && <AuditTab clientId={selectedId} pushToast={pushToast} />}
              {activeTab === 'competitors' && <CompetitorsTab clientId={selectedId} pushToast={pushToast} onAdvance={() => setActiveTab('analysis')} />}
              {activeTab === 'analysis'    && <AnalysisTab analysis={analysis} upd={updAnalysis} clientId={selectedId} client={client} content={content} addContent={addContent} pushToast={pushToast} onGoToCalendar={goToPublish} />}
              {activeTab === 'strategy'    && <StrategyTab analysis={analysis} upd={updAnalysis} pushToast={pushToast} />}
              {activeTab === 'create'      && <CreateTab client={client} content={content} addContent={addContent} onOpenNewPost={() => setShowNewPost(true)} onOpenIntelligence={openIntelligence} pushToast={pushToast} />}
              {activeTab === 'publish'     && <PublishTab clientId={selectedId} clients={clients} content={content} updateContent={updateContent} pushToast={pushToast} />}
              {activeTab === 'report'      && <ReportTab analysis={analysis} upd={updAnalysis} clientId={selectedId} addContent={addContent} pushToast={pushToast} onGoToCalendar={goToPublish} />}
              <TabNavButtons tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />
            </>}
      </div>

      {/* Client profile modal */}
      {profileClient && <ClientProfileModal client={profileClient} onClose={() => setProfileClient(null)} onSelectTab={(tab) => { setSelectedId(profileClient.id); setActiveTab(tab); setProfileClient(null) }} />}

      {/* Drawers & overlays */}
      <NewPostDrawer open={showNewPost} onClose={() => setShowNewPost(false)} clientId={selectedId} addContent={addContent} pushToast={pushToast} />
      <IntelligenceOverlay open={showIntelligence} onClose={() => setShowIntelligence(false)} clientId={selectedId} client={client} addContent={addContent} pushToast={pushToast} />
      <APIKeyModal open={showKeyModal} onClose={() => setShowKeyModal(false)} />
      <ToastBox toasts={toasts} />

      <style>{`
        @keyframes tsIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin  { to { transform:rotate(360deg) } }
      `}</style>
    </div>
    </ErrorBoundary>
  )
}

function TabNavButtons({ tabs, activeTab, onSelect }) {
  const idx  = tabs.findIndex(t => t.id === activeTab)
  const prev = tabs[idx - 1]
  const next = tabs[idx + 1]
  if (!prev && !next) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 32 }}>
      {prev && (
        <button onClick={() => onSelect(prev.id)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #555', background: 'transparent', color: '#ccc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
          ← {prev.label}
        </button>
      )}
      {next && (
        <button onClick={() => onSelect(next.id)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
          {next.label} →
        </button>
      )}
    </div>
  )
}

function ClientProfileModal({ client, onClose, onSelectTab }) {
  const displayName = client.name || client.businessName || 'Client'
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const completion  = getCompletion(client.id)
  const steps       = ['Brand Kit', 'Audit', 'Competitors', 'Analysis', 'Strategy']
  const TAB_MAP     = { 'Brand Kit': 'brandkit', 'Audit': 'audit', 'Competitors': 'competitors', 'Analysis': 'analysis', 'Strategy': 'strategy' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 380, maxWidth: '95vw', height: '100vh', background: CARD, overflowY: 'auto', padding: '32px 28px', boxShadow: '-8px 0 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer', color: MI, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, paddingTop: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${PU}20`, border: `3px solid ${BD}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            {client.profilePhoto
              ? <img src={client.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
              : <span style={{ fontSize: 28, fontWeight: 800, color: PL, fontFamily: "'Outfit',sans-serif" }}>{initials}</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif", textAlign: 'center' }}>{displayName}</div>
          {client.businessType && <div style={{ fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif", marginTop: 3 }}>{client.businessType}</div>}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {client.platforms?.length > 0 && (
            <ProfileRow label="Platforms">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {client.platforms.map(p => (
                  <span key={p} style={{ padding: '3px 10px', borderRadius: 20, background: `${PU}15`, color: PL, fontSize: 12, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>
                    {p}{client.handles?.[p] ? ` · ${client.handles[p]}` : ''}
                  </span>
                ))}
              </div>
            </ProfileRow>
          )}
          {client.contentGoal && <ProfileRow label="Content Goal"><span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif" }}>{client.contentGoal}</span></ProfileRow>}
          {client.postingFrequency && <ProfileRow label="Posting Frequency"><span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif" }}>{client.postingFrequency}</span></ProfileRow>}
          {client.primaryObjective && <ProfileRow label="Primary Objective"><span style={{ fontSize: 13, color: TX, fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>{client.primaryObjective}</span></ProfileRow>}
        </div>

        {/* Completion checklist */}
        <div style={{ background: BG, borderRadius: 12, padding: '16px 18px', border: `1px solid ${BD}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Outfit',sans-serif", marginBottom: 14 }}>Setup Progress</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map(step => {
              const done = completion[step]
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#4A7C5C' : `${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: done ? TX : MI, fontFamily: "'Outfit',sans-serif" }}>{step}</span>
                  </div>
                  {!done && (
                    <button onClick={() => onSelectTab(TAB_MAP[step])} style={{ fontSize: 11, fontWeight: 700, color: PL, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif', padding: 0" }}>
                      Set up →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Outfit',sans-serif", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}
