import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useClients } from '../hooks/useClients'
import { useSocialData } from '../hooks/useSocialData'
import {
  BG, CARD, PU, PL, MI, BD, TX,
  defAnalysis, loadAnalysis, saveAnalysis, preFillIntelligence,
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

export default function SocialMediaPage() {
  const { clients } = useClients()
  const { content, metrics, addContent, updateContent } = useSocialData()
  const { toasts, push: pushToast } = useToast()

  const [selectedId,       setSelectedId]       = useState(null)
  const [activeTab,        setActiveTab]         = useState('client')
  const [showNewPost,      setShowNewPost]       = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showCreateMenu,   setShowCreateMenu]    = useState(false)
  const [showKeyModal,     setShowKeyModal]      = useState(false)

  const activeClients = useMemo(() => clients.filter(c => c.status !== 'Churned'), [clients])
  const client        = useMemo(() => clients.find(c => c.id === selectedId) || null, [clients, selectedId])

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

        <SocialClientBar activeClients={activeClients} selectedId={selectedId} onSelect={setSelectedId} />

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
        {!selectedId
          ? <SocialWelcome />
          : <>
              {activeTab === 'client'      && <ClientTab clientId={selectedId} client={client} />}
              {activeTab === 'brandkit'    && <BrandKitTab open={true} onClose={() => setActiveTab('client')} clientId={selectedId} />}
              {activeTab === 'audit'       && <AuditTab analysis={analysis} upd={updAnalysis} client={client} pushToast={pushToast} />}
              {activeTab === 'competitors' && <CompetitorsTab analysis={analysis} upd={updAnalysis} pushToast={pushToast} />}
              {activeTab === 'analysis'    && <AnalysisTab analysis={analysis} upd={updAnalysis} clientId={selectedId} client={client} content={content} addContent={addContent} pushToast={pushToast} onGoToCalendar={goToPublish} />}
              {activeTab === 'strategy'    && <StrategyTab analysis={analysis} upd={updAnalysis} pushToast={pushToast} />}
              {activeTab === 'create'      && <CreateTab client={client} content={content} addContent={addContent} onOpenNewPost={() => setShowNewPost(true)} onOpenIntelligence={openIntelligence} pushToast={pushToast} />}
              {activeTab === 'publish'     && <PublishTab clientId={selectedId} clients={clients} content={content} updateContent={updateContent} pushToast={pushToast} />}
              {activeTab === 'report'      && <ReportTab analysis={analysis} upd={updAnalysis} clientId={selectedId} addContent={addContent} pushToast={pushToast} onGoToCalendar={goToPublish} />}
            </>}
      </div>

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
  )
}
