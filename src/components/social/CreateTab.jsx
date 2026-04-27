import React, { useState, useEffect, useMemo } from 'react'
import ClientIntelligence from '../research/ClientIntelligence'
import {
  BG, CARD, PU, PL, MI, BD, TX, R, SH, INP, PBtn, XBTN, H2, LBL,
  Spin, EmptyState, SPill, PlatDot,
  callClaude, loadBrandKit, isoToday, fmtDate, offsetDate,
  PLATS, CTYPES, DAY_NAMES, getStoredPlan,
} from './socialUtils.jsx'

const IDEAS_BOARD = [
  { id: 1, topic: 'Morning Mindset',   emoji: '🌅', bg: `${PU}12` },
  { id: 2, topic: 'Quick Workout',     emoji: '💪', bg: 'rgba(245,114,42,0.12)' },
  { id: 3, topic: 'Transformation',    emoji: '✨', bg: 'rgba(74,124,92,0.12)' },
  { id: 4, topic: 'Client Story',      emoji: '❤️', bg: `${PU}10` },
  { id: 5, topic: 'Behind The Scenes', emoji: '🎬', bg: 'rgba(245,114,42,0.10)' },
  { id: 6, topic: 'Nutrition Tip',     emoji: '🥗', bg: 'rgba(200,154,26,0.12)' },
  { id: 7, topic: 'Motivation',        emoji: '🔥', bg: `${PU}12` },
  { id: 8, topic: 'Studio Tour',       emoji: '🏠', bg: 'rgba(74,124,92,0.12)' },
]

const QUICK_PLATS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']

// ── NewPostDrawer ───────────────────────────────────────────────────────────────
export function NewPostDrawer({ open, onClose, clientId, addContent, pushToast }) {
  const [plat, setPlat]     = useState('Instagram')
  const [ctype, setCtype]   = useState('Reel')
  const [caption, setCaption] = useState('')
  const [date, setDate]     = useState(isoToday())
  const [time, setTime]     = useState('09:00')
  const [status, setStatus] = useState('Scheduled')

  const reset = () => { setPlat('Instagram'); setCtype('Reel'); setCaption(''); setDate(isoToday()); setTime('09:00'); setStatus('Scheduled') }
  const save  = () => {
    if (!clientId) return
    addContent({ clientId, title: (caption || 'Untitled post').slice(0, 80), caption, platforms: [plat], contentType: ctype, status, scheduledDate: date, scheduledTime: time, createdAt: new Date().toISOString() })
    pushToast('Post saved!'); reset(); onClose()
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ width: 480, maxWidth: '95vw', background: CARD, overflowY: 'auto', padding: '28px 28px 40px', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={H2}>Create New Post</h2>
          <button onClick={onClose} style={XBTN}>✕</button>
        </div>
        <div>
          <label style={LBL}>Platform</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {PLATS.map(p => <button key={p} onClick={() => setPlat(p)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${plat === p ? PU : BD}`, background: plat === p ? `${PU}18` : 'transparent', color: plat === p ? PL : MI, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{p}</button>)}
          </div>
        </div>
        <div><label style={LBL}>Content Type</label><select value={ctype} onChange={e => setCtype(e.target.value)} style={INP}>{CTYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <div><label style={LBL}>Caption</label><textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption here…" style={{ ...INP, resize: 'vertical', minHeight: 130 }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={LBL}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} style={INP} /></div>
        </div>
        <div><label style={LBL}>Status</label><select value={status} onChange={e => setStatus(e.target.value)} style={INP}><option>Draft</option><option>Scheduled</option></select></div>
        <button onClick={save} style={PBtn()}>Save Post</button>
      </div>
    </div>
  )
}

// ── IntelligenceOverlay ─────────────────────────────────────────────────────────
export function IntelligenceOverlay({ open, onClose, clientId, client, addContent, pushToast }) {
  const [view, setView]       = useState('flow')
  const [hasPlan, setHasPlan] = useState(false)
  const [planData, setPlanData] = useState([])
  const [planSent, setPlanSent] = useState(false)

  useEffect(() => {
    if (!open || !clientId) return
    setView('flow'); setHasPlan(false); setPlanSent(false)
    const check = () => {
      const plan = getStoredPlan(clientId)
      if (plan.length > 0) { setHasPlan(true); setPlanData(plan) }
    }
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [open, clientId])

  const sendToCalendar = () => {
    planData.forEach((item, i) => {
      addContent({ clientId, title: (item.hookIdea || `Day ${item.day || i + 1}`).slice(0, 80), caption: item.hookIdea || '', platforms: ['Instagram'], contentType: item.contentType || 'Post', status: 'Draft', scheduledDate: offsetDate(i + 1), notes: item.description || '', createdAt: new Date().toISOString() })
    })
    setPlanSent(true)
    pushToast('7 days added to your calendar!')
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 200, overflowY: 'auto', fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: CARD, borderBottom: `1px solid ${BD}`, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Outfit',sans-serif" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        {client && <span style={{ fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif", fontWeight: 500, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{client.businessName} — Intelligence Flow</span>}
        <div style={{ display: 'flex', gap: 10 }}>
          {hasPlan && view === 'flow' && (
            <button onClick={() => setView('plan')} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>View Plan</button>
          )}
          {view === 'plan' && (
            <button onClick={() => setView('flow')} style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← Edit</button>
          )}
        </div>
      </div>

      {view === 'flow' && clientId && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 28px 60px' }}>
          <ClientIntelligence clientId={clientId} />
        </div>
      )}

      {view === 'plan' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ margin: '0 0 5px', fontSize: 26, fontWeight: 800, color: TX, fontFamily: "'Outfit',sans-serif" }}>Your 7-day plan is ready.</h2>
              <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: "'Outfit',sans-serif" }}>{client?.businessName} · Review and send to calendar.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setView('flow')} style={{ padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← Edit Plan</button>
              {planSent
                ? <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(74,124,92,0.15)', color: '#5DA875', fontSize: 13, fontWeight: 700, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Sent to Calendar
                  </div>
                : <button onClick={sendToCalendar} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Send to Calendar
                  </button>}
            </div>
          </div>
          {planData.length === 0
            ? <EmptyState icon="📅" msg="No plan generated yet." sub="Go back to the Intelligence Flow and run the Weekly Plan step." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 12, overflowX: 'auto' }}>
                {planData.map((item, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: R, padding: '18px 14px', border: `1px solid ${BD}`, boxShadow: SH, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: PL, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Outfit',sans-serif" }}>{DAY_NAMES[i] || `Day ${item.day || i + 1}`}</div>
                    <SPill s={item.contentType || 'Post'} sm />
                    <div style={{ fontSize: 13, fontWeight: 700, color: TX, lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>{item.hookIdea || '—'}</div>
                    {item.description && <p style={{ margin: 0, fontSize: 11.5, color: MI, lineHeight: 1.5, fontFamily: "'Outfit',sans-serif" }}>{item.description}</p>}
                  </div>
                ))}
              </div>}
        </div>
      )}
    </div>
  )
}

// ── HomeTab (CreateTab default export) ──────────────────────────────────────────
export default function CreateTab({ client, content, addContent, onOpenNewPost, onOpenIntelligence, pushToast }) {
  const clientId = client?.id
  const [quickTopic,       setQuickTopic]       = useState('')
  const [quickPlatform,    setQuickPlatform]    = useState('Instagram')
  const [generating,       setGenerating]       = useState(false)
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [genError,         setGenError]         = useState('')

  const brandKit = useMemo(() => loadBrandKit(clientId), [clientId])
  const brandCtx = brandKit.voice ? `Brand voice: ${brandKit.voice}. ` : ''
  const topicCtx = brandKit.topics?.length ? `Content topics: ${brandKit.topics.join(', ')}. ` : ''

  const generate = async () => {
    if (!quickTopic.trim()) return
    if (!localStorage.getItem('pulse_anthropic_key')) { setGenError('NO_KEY'); return }
    setGenerating(true); setGenError(''); setGeneratedCaption('')
    try {
      const result = await callClaude([{ role: 'user', content: `${brandCtx}${topicCtx}Generate a ${quickPlatform} caption for ${client?.businessName || 'a brand'} about "${quickTopic}". Make it engaging, platform-appropriate, with hashtags. Return caption text only.` }], 600)
      setGeneratedCaption(typeof result === 'string' ? result : JSON.stringify(result))
    } catch (e) { setGenError(e.message === 'NO_KEY' ? 'NO_KEY' : e.message.slice(0, 120)) }
    setGenerating(false)
  }

  const saveAsDraft = () => {
    if (!generatedCaption || !clientId) return
    addContent({ clientId, title: (quickTopic || 'AI Post').slice(0, 80), caption: generatedCaption, platforms: [quickPlatform], contentType: 'Post', status: 'Draft', scheduledDate: isoToday(), createdAt: new Date().toISOString() })
    pushToast('Saved as draft!'); setGeneratedCaption(''); setQuickTopic('')
  }

  const copyText = (text) => navigator.clipboard?.writeText(text).then(() => pushToast('Copied!')).catch(() => pushToast('Copy failed', 'error'))

  const recentActivity = useMemo(() =>
    content.filter(c => c.clientId === clientId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 3),
    [content, clientId])

  return (
    <div>
      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div
          onClick={onOpenIntelligence}
          style={{ background: `linear-gradient(135deg, ${PU} 0%, #3D27C0 100%)`, borderRadius: R, padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 190, boxShadow: `0 8px 32px ${PU}40`, transition: 'transform .15s, box-shadow .15s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${PU}55` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${PU}40` }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>🧠</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>Create Weekly Plan</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>Run the intelligence flow to generate a data-driven 7-day content strategy for this client.</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>
            Open Intelligence Flow
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        <div style={{ background: CARD, borderRadius: R, padding: '22px 24px', border: `1px solid ${BD}`, boxShadow: SH }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Quick Content</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: MI, fontFamily: "'Outfit',sans-serif" }}>Generate a caption instantly.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={quickTopic}
              onChange={e => { setQuickTopic(e.target.value); setGeneratedCaption(''); setGenError('') }}
              placeholder="What's the post about?"
              style={{ ...INP, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
            <select value={quickPlatform} onChange={e => setQuickPlatform(e.target.value)} style={{ ...INP, width: 118 }}>
              {QUICK_PLATS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={!quickTopic.trim() || generating} style={{ ...PBtn(PU), width: 'auto', padding: '9px 22px', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: (!quickTopic.trim() || generating) ? 0.55 : 1, marginBottom: (genError || generatedCaption) ? 12 : 0 }}>
            {generating ? <><Spin /> Generating…</> : '✦ Generate'}
          </button>
          {genError === 'NO_KEY' && (
            <div style={{ padding: '9px 12px', background: `${PU}12`, borderRadius: 9, color: PL, fontSize: 12, fontFamily: "'Outfit',sans-serif", marginTop: 10 }}>
              Add your Anthropic API key in <strong>Settings → Integrations</strong>.
            </div>
          )}
          {genError && genError !== 'NO_KEY' && <div style={{ padding: '9px 12px', background: 'rgba(196,80,58,0.15)', borderRadius: 9, color: '#C4503A', fontSize: 12, fontFamily: "'Outfit',sans-serif", marginTop: 10 }}>{genError}</div>}
          {generatedCaption && (
            <div style={{ marginTop: 10 }}>
              <textarea value={generatedCaption} onChange={e => setGeneratedCaption(e.target.value)} style={{ ...INP, resize: 'vertical', minHeight: 80, marginBottom: 8, fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveAsDraft} style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Save as Draft</button>
                <button onClick={() => copyText(generatedCaption)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Copy</button>
                <button onClick={() => setGeneratedCaption('')} style={{ padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${BD}`, background: 'none', color: MI, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creative Ideas Board */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 5px', fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Creative Ideas Board</h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: MI, fontFamily: "'Outfit',sans-serif" }}>Tap any card to auto-fill the topic above.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {IDEAS_BOARD.map(card => (
            <button
              key={card.id}
              onClick={() => { setQuickTopic(card.topic); setQuickPlatform('Instagram'); setGeneratedCaption(''); setGenError('') }}
              style={{ background: card.bg, borderRadius: 12, padding: '18px 16px', border: '1.5px solid transparent', cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit',sans-serif", transition: 'transform .15s, box-shadow .15s', boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${PU}28` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8, lineHeight: 1 }}>{card.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX, lineHeight: 1.3 }}>{card.topic}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TX, fontFamily: "'Outfit',sans-serif" }}>Recent Activity</h3>
          <button onClick={onOpenNewPost} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${PU}`, background: 'transparent', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            + New Post
          </button>
        </div>
        {recentActivity.length === 0
          ? <EmptyState icon="📝" msg="No posts yet." sub="Create a post or generate content above to get started." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map(item => (
                <div key={item.id} style={{ background: CARD, borderRadius: 12, padding: '14px 18px', border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${PU}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlatDot p={item.platforms?.[0]} size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: TX, fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption || item.title || 'Untitled'}</div>
                    <div style={{ fontSize: 11.5, color: MI, marginTop: 3, fontFamily: "'Outfit',sans-serif" }}>{item.platforms?.[0]} · {fmtDate(item.scheduledDate)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <SPill s={item.contentType || 'Post'} sm />
                    <SPill s={item.status || 'Draft'} sm />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
