import React, { useState, useEffect, useCallback } from 'react'
import ClientIntelligence from '../research/ClientIntelligence'
import {
  BG, CARD, PU, PL, MI, BD, TX, R, SH, INP, PBtn, XBTN, H2, LBL,
  Spin, EmptyState, SPill, PlatDot,
  callClaude, loadBrandKit, isoToday, fmtDate, offsetDate,
  PLATS, CTYPES, DAY_NAMES, getStoredPlan,
} from './socialUtils.jsx'
import { safeGet, getBrandBrain } from '../../utils/storage'

// ── Local constants ──────────────────────────────────────────────────────────────
const OR  = '#F97316'
const PUR = '#7C3AED'
const FF  = "'Outfit', sans-serif"

const PLATFORMS    = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube']
const CTYPES_EXT   = ['Reel', 'Carousel', 'Static Post', 'Story', 'LinkedIn Post', 'TikTok Video']
const GOALS        = ['Get Followers', 'Drive Engagement', 'Generate Leads', 'Make Sales', 'Build Trust', 'Go Viral']
const TONES        = ['Auto from Brand Kit', 'Funny', 'Inspiring', 'Educational', 'Promotional', 'Controversial', 'Storytelling']
const HOOK_STYLES  = ['Curiosity', 'Controversial', 'Story opener', 'Bold statement', 'Question', 'Shocking fact', 'Relatable']
const HASH_STYLES  = ['Broad', 'Niche', 'Mixed', 'Viral only']
const CTA_GOALS    = ['Follow', 'Save this post', 'Comment below', 'DM us', 'Book now', 'Click link in bio', 'Share with a friend', 'Tag someone']
const CTA_TONES    = ['Soft', 'Direct', 'Urgent', 'Playful']
const MOODS        = ['Energetic', 'Calm', 'Emotional', 'Funny', 'Trending']
const REEL_PLATS   = ['Instagram Reels', 'TikTok']
const COLLAB_TYPES = ['Duet', 'Joint Reel', 'Takeover', 'Shoutout', 'Challenge']
const CAP_LENGTHS  = ['Short 50w', 'Medium 100w', 'Long 150w', 'Thread']
const CAP_STYLES   = ['Single caption', 'Caption with emojis', 'Minimal no emoji', 'Story format']

const EFFECT_LABELS = ['Stops scroll', 'Drives comments', 'Gets saves', 'Stops scroll', 'Drives comments', 'Gets saves', 'Stops scroll', 'Drives comments', 'Gets saves', 'Stops scroll']

const IDEAS = [
  { id: 1,  emoji: '🌅', title: 'Morning Mindset',    desc: 'Start the day with intention',    goal: 'Build Trust',      tone: 'Inspiring',      topic: 'morning mindset and daily rituals' },
  { id: 2,  emoji: '💪', title: 'Quick Workout',       desc: 'Fast moves, big results',          goal: 'Get Followers',    tone: 'Inspiring',      topic: 'quick workout tips' },
  { id: 3,  emoji: '✨', title: 'Transformation Story', desc: 'Real results, real people',       goal: 'Generate Leads',   tone: 'Storytelling',   topic: 'client transformation story' },
  { id: 4,  emoji: '❤️', title: 'Client Story',        desc: 'Success from your community',      goal: 'Build Trust',      tone: 'Storytelling',   topic: 'client success story' },
  { id: 5,  emoji: '🎬', title: 'Behind The Scenes',   desc: 'Show how you really work',         goal: 'Build Trust',      tone: 'Funny',          topic: 'behind the scenes at the studio' },
  { id: 6,  emoji: '🥗', title: 'Nutrition Tip',       desc: 'Simple tips that stick',           goal: 'Drive Engagement', tone: 'Educational',    topic: 'nutrition tip' },
  { id: 7,  emoji: '🔥', title: 'Motivation',          desc: 'Spark action in your audience',    goal: 'Get Followers',    tone: 'Inspiring',      topic: 'motivational content' },
  { id: 8,  emoji: '🏠', title: 'Studio Tour',         desc: 'Invite them inside your world',    goal: 'Build Trust',      tone: 'Storytelling',   topic: 'studio tour walkthrough' },
  { id: 9,  emoji: '🧠', title: 'Myth vs Truth',       desc: 'Bust common misconceptions',       goal: 'Drive Engagement', tone: 'Educational',    topic: 'fitness wellness myth vs truth' },
  { id: 10, emoji: '💬', title: 'Hot Take',             desc: 'Share a bold opinion',             goal: 'Go Viral',         tone: 'Controversial',  topic: 'hot take opinion' },
  { id: 11, emoji: '📱', title: 'Day In My Life',       desc: 'Build parasocial connection',      goal: 'Build Trust',      tone: 'Storytelling',   topic: 'day in my life' },
  { id: 12, emoji: '❓', title: 'Poll or Question',     desc: 'Get your audience talking',        goal: 'Drive Engagement', tone: 'Auto from Brand Kit', topic: 'engaging question for audience' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────────
function copy(text, pushToast) {
  navigator.clipboard?.writeText(text).then(() => pushToast('Copied!')).catch(() => pushToast('Copy failed', 'error'))
}

function loadStrategy(clientId) { return safeGet(`pulse_strategy_${clientId}`, null) }

function brainCtx(clientId) {
  const b = getBrandBrain(clientId)
  if (!b) return ''
  const parts = []
  if (b.brandSummary)              parts.push(`Brand: ${b.brandSummary.slice(0, 200)}`)
  if (b.toneDescription)           parts.push(`Tone: ${b.toneDescription}`)
  if (b.pillars?.length)           parts.push(`Pillars: ${b.pillars.map(p => p.name).join(', ')}`)
  if (b.vocabularyRules?.use?.length)   parts.push(`Use words: ${b.vocabularyRules.use.join(', ')}`)
  if (b.vocabularyRules?.avoid?.length) parts.push(`Avoid words: ${b.vocabularyRules.avoid.join(', ')}`)
  if (b.contentRules?.do?.length)  parts.push(`Content do: ${b.contentRules.do.join('; ')}`)
  if (b.contentRules?.dont?.length) parts.push(`Content avoid: ${b.contentRules.dont.join('; ')}`)
  return parts.length ? `\nBrand Intelligence: ${parts.join('. ')}` : ''
}

// ── Shared micro-components ───────────────────────────────────────────────────────
function Lbl({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5, fontFamily: FF }}>{children}</label>
}

function Field({ label, children }) {
  return <div><Lbl>{label}</Lbl>{children}</div>
}

function Inp({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 13, fontFamily: FF, color: TX, background: '#fff', outline: 'none' }} />
}

function Sel({ value, onChange, options }) {
  return <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 13, fontFamily: FF, color: TX, background: '#fff', outline: 'none' }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
}

function OrangeBtn({ label, onClick, disabled, loading, fullWidth }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: disabled || loading ? '#ccc' : OR, color: '#fff', fontSize: 13, fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer', fontFamily: FF, display: 'inline-flex', alignItems: 'center', gap: 8, width: fullWidth ? '100%' : 'auto', justifyContent: 'center', boxShadow: disabled || loading ? 'none' : `0 4px 12px ${OR}40` }}>
      {loading && <Spin />}{label}
    </button>
  )
}

function CopyBtn({ text, pushToast, small }) {
  return (
    <button onClick={() => copy(text, pushToast)}
      style={{ padding: small ? '4px 10px' : '7px 14px', borderRadius: 8, border: `1.5px solid ${BD}`, background: 'transparent', color: MI, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FF, whiteSpace: 'nowrap', flexShrink: 0 }}>
      Copy
    </button>
  )
}

function OutputCard({ label, value, pushToast, accent }) {
  if (!value) return null
  const display = Array.isArray(value) ? value.join(' ') : String(value)
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${BD}`, borderTop: `3px solid ${accent || OR}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: FF }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{display}</span>
        <CopyBtn text={display} pushToast={pushToast} small />
      </div>
    </div>
  )
}

function NoKeyBanner() {
  return (
    <div style={{ padding: '11px 14px', borderRadius: 10, background: `${PUR}12`, border: `1px solid ${PUR}30`, color: PUR, fontSize: 13, fontWeight: 600, fontFamily: FF, marginBottom: 16 }}>
      Add your Anthropic API key in Settings to use AI features.
    </div>
  )
}

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
            {PLATS.map(p => <button key={p} onClick={() => setPlat(p)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${plat === p ? PU : BD}`, background: plat === p ? `${PU}18` : 'transparent', color: plat === p ? PL : MI, cursor: 'pointer', fontFamily: FF }}>{p}</button>)}
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
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 200, overflowY: 'auto', fontFamily: FF }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: CARD, borderBottom: `1px solid ${BD}`, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: FF }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        {client && <span style={{ fontSize: 13, color: MI, fontFamily: FF, fontWeight: 500, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{client.businessName} — Intelligence Flow</span>}
        <div style={{ display: 'flex', gap: 10 }}>
          {hasPlan && view === 'flow' && <button onClick={() => setView('plan')} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: PU, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>View Plan</button>}
          {view === 'plan' && <button onClick={() => setView('flow')} style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>← Edit</button>}
        </div>
      </div>
      {view === 'flow' && clientId && <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 28px 60px' }}><ClientIntelligence clientId={clientId} /></div>}
      {view === 'plan' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ margin: '0 0 5px', fontSize: 26, fontWeight: 800, color: TX, fontFamily: FF }}>Your 7-day plan is ready.</h2>
              <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: FF }}>{client?.businessName} · Review and send to calendar.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setView('flow')} style={{ padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${PU}`, background: 'none', color: PL, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>← Edit Plan</button>
              {planSent
                ? <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(74,124,92,0.15)', color: '#5DA875', fontSize: 13, fontWeight: 700, fontFamily: FF, display: 'flex', alignItems: 'center', gap: 7 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>Sent to Calendar</div>
                : <button onClick={sendToCalendar} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: PU, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, display: 'flex', alignItems: 'center', gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Send to Calendar</button>}
            </div>
          </div>
          {planData.length === 0
            ? <EmptyState icon="📅" msg="No plan generated yet." sub="Go back to the Intelligence Flow and run the Weekly Plan step." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 12, overflowX: 'auto' }}>
                {planData.map((item, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: R, padding: '18px 14px', border: `1px solid ${BD}`, boxShadow: SH, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: PL, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF }}>{DAY_NAMES[i] || `Day ${item.day || i + 1}`}</div>
                    <SPill s={item.contentType || 'Post'} sm />
                    <div style={{ fontSize: 13, fontWeight: 700, color: TX, lineHeight: 1.4, fontFamily: FF }}>{item.hookIdea || '—'}</div>
                    {item.description && <p style={{ margin: 0, fontSize: 11.5, color: MI, lineHeight: 1.5, fontFamily: FF }}>{item.description}</p>}
                  </div>
                ))}
              </div>}
        </div>
      )}
    </div>
  )
}

// ── AI Tool Panels ───────────────────────────────────────────────────────────────

function CaptionWriter({ clientId, pushToast }) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [length, setLength] = useState('Medium 100w')
  const [style, setStyle] = useState('Single caption')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    const bk = loadBrandKit(clientId)
    const voice = bk.voice || ''
    try {
      const res = await callClaude([{ role: 'user', content: `Write a ${platform} caption about "${topic}". Length: ${length}. Style: ${style}. Brand voice: ${voice || 'engaging and authentic'}.${brainCtx(clientId)} Return caption text only, no JSON.` }], 600)
      setResult(typeof res === 'string' ? res : JSON.stringify(res))
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Topic"><Inp value={topic} onChange={setTopic} placeholder="What is this about?" /></Field>
        <Field label="Platform"><Sel value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
        <Field label="Length"><Sel value={length} onChange={setLength} options={CAP_LENGTHS} /></Field>
        <Field label="Style"><Sel value={style} onChange={setStyle} options={CAP_STYLES} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Writing…' : 'Generate Caption'} onClick={generate} disabled={!topic.trim() || !hasKey} loading={loading} />
      {result && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: `1px solid ${BD}`, borderTop: `3px solid ${OR}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF }}>Caption</span>
            <CopyBtn text={result} pushToast={pushToast} small />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result}</p>
        </div>
      )}
    </div>
  )
}

function HookGenerator({ clientId, pushToast }) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [hookStyle, setHookStyle] = useState('Curiosity')
  const [loading, setLoading] = useState(false)
  const [hooks, setHooks] = useState([])
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Generate 10 ${hookStyle} hooks for a ${platform} post about "${topic}".${brainCtx(clientId)} Return ONLY a JSON array of strings, no other text. Example: ["hook 1", "hook 2"]` }], 700)
      const arr = Array.isArray(res) ? res : []
      setHooks(arr.slice(0, 10))
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Topic"><Inp value={topic} onChange={setTopic} placeholder="Post topic" /></Field>
        <Field label="Platform"><Sel value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
        <Field label="Hook Style"><Sel value={hookStyle} onChange={setHookStyle} options={HOOK_STYLES} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Generating…' : 'Generate 10 Hooks'} onClick={generate} disabled={!topic.trim() || !hasKey} loading={loading} />
      {hooks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hooks.map((h, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '11px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${OR}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: OR, background: `${OR}15`, padding: '2px 8px', borderRadius: 20, fontFamily: FF, whiteSpace: 'nowrap', flexShrink: 0 }}>{EFFECT_LABELS[i]}</span>
              <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.45 }}>{h}</span>
              <CopyBtn text={h} pushToast={pushToast} small />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HashtagBuilder({ clientId, pushToast }) {
  const bk = loadBrandKit(clientId)
  const [niche, setNiche] = useState(bk.topics?.join(', ') || '')
  const [platform, setPlatform] = useState('Instagram')
  const [style, setStyle] = useState('Mixed')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    if (!niche.trim()) return
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Generate 30 ${platform} hashtags for niche: "${niche}". Style: ${style}. Return ONLY valid JSON: {"highReach": ["10 broad hashtags"], "mediumReach": ["10 medium hashtags"], "niche": ["10 niche hashtags"]}` }], 600)
      setResult(typeof res === 'object' && res !== null ? res : null)
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  const PillGroup = ({ label, tags, accent }) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF }}>{label}</span>
        <CopyBtn text={tags?.join(' ') || ''} pushToast={pushToast} small />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(tags || []).map((t, i) => <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${accent}18`, color: accent, fontFamily: FF }}>{t}</span>)}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Niche"><Inp value={niche} onChange={setNiche} placeholder="yoga, fitness, wellness" /></Field>
        <Field label="Platform"><Sel value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
        <Field label="Style"><Sel value={style} onChange={setStyle} options={HASH_STYLES} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Building…' : 'Generate 30 Hashtags'} onClick={generate} disabled={!niche.trim() || !hasKey} loading={loading} />
      {result && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: `1px solid ${BD}`, borderTop: `3px solid ${OR}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CopyBtn text={[...(result.highReach || []), ...(result.mediumReach || []), ...(result.niche || [])].join(' ')} pushToast={pushToast} small />
          </div>
          <PillGroup label="High Reach (10)"   tags={result.highReach}   accent={OR}  />
          <PillGroup label="Medium Reach (10)" tags={result.mediumReach} accent={PUR} />
          <PillGroup label="Niche (10)"        tags={result.niche}       accent={MI}  />
        </div>
      )}
    </div>
  )
}

function CTAGenerator({ pushToast }) {
  const [goal, setGoal] = useState('Follow')
  const [tone, setTone] = useState('Soft')
  const [loading, setLoading] = useState(false)
  const [ctas, setCtas] = useState([])
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Generate 6 call-to-action phrases for goal: "${goal}". Tone: ${tone}. Return ONLY a JSON array of 6 strings. Example: ["cta 1", "cta 2"]` }], 400)
      setCtas(Array.isArray(res) ? res.slice(0, 6) : [])
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Goal"><Sel value={goal} onChange={setGoal} options={CTA_GOALS} /></Field>
        <Field label="Tone"><Sel value={tone} onChange={setTone} options={CTA_TONES} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Generating…' : 'Generate 6 CTAs'} onClick={generate} disabled={!hasKey} loading={loading} />
      {ctas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ctas.map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '11px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${PUR}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF }}>{c}</span>
              <CopyBtn text={c} pushToast={pushToast} small />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContentBrief({ clientId, pushToast }) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [contentType, setContentType] = useState('Reel')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Create a content brief for a ${platform} ${contentType} about "${topic}".${brainCtx(clientId)} Return ONLY valid JSON: {"hookIdea": "string", "visualConcept": "string", "captionAngle": "string", "ctaSuggestion": "string", "bestTimeToPost": "string", "performancePrediction": "string"}` }], 700)
      setResult(typeof res === 'object' && res !== null ? res : null)
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  const BRIEF_FIELDS = [
    { key: 'hookIdea',             label: 'Hook Idea',              accent: OR  },
    { key: 'visualConcept',        label: 'Visual Concept',         accent: PUR },
    { key: 'captionAngle',         label: 'Caption Angle',          accent: OR  },
    { key: 'ctaSuggestion',        label: 'CTA Suggestion',         accent: PUR },
    { key: 'bestTimeToPost',       label: 'Best Time To Post',      accent: '#16A34A' },
    { key: 'performancePrediction',label: 'Performance Prediction', accent: MI  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Topic"><Inp value={topic} onChange={setTopic} placeholder="What is this content about?" /></Field>
        <Field label="Platform"><Sel value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
        <Field label="Content Type"><Sel value={contentType} onChange={setContentType} options={CTYPES_EXT} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Building Brief…' : 'Generate Brief'} onClick={generate} disabled={!topic.trim() || !hasKey} loading={loading} />
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CopyBtn text={BRIEF_FIELDS.map(f => `${f.label}: ${result[f.key] || ''}`).join('\n')} pushToast={pushToast} small />
          </div>
          {BRIEF_FIELDS.map(f => result[f.key] ? (
            <div key={f.key} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${f.accent}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5, fontFamily: FF }}>{f.label}</span>
              <span style={{ fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.55 }}>{result[f.key]}</span>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  )
}

function ViralAudio({ clientId, pushToast }) {
  const bk = loadBrandKit(clientId)
  const [niche, setNiche] = useState(bk.topics?.join(', ') || '')
  const [mood, setMood] = useState('Energetic')
  const [platform, setPlatform] = useState('Instagram Reels')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Suggest 5 audio styles for a ${platform} creator in the "${niche || 'wellness'}" niche. Mood: ${mood}. Return ONLY a JSON array: [{"audioStyle": "string", "whyItWorks": "string", "howToUse": "string"}]` }], 700)
      setSuggestions(Array.isArray(res) ? res.slice(0, 5) : [])
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Niche"><Inp value={niche} onChange={setNiche} placeholder="yoga, fitness, wellness" /></Field>
        <Field label="Mood"><Sel value={mood} onChange={setMood} options={MOODS} /></Field>
        <Field label="Platform"><Sel value={platform} onChange={setPlatform} options={REEL_PLATS} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Generating…' : 'Suggest 5 Audio Styles'} onClick={generate} disabled={!hasKey} loading={loading} />
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${BD}`, borderTop: `3px solid ${OR}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 8, fontFamily: FF }}>🎵 {s.audioStyle}</div>
              <div style={{ fontSize: 12, color: MI, marginBottom: 4, fontFamily: FF }}><strong style={{ color: TX }}>Why it works:</strong> {s.whyItWorks}</div>
              <div style={{ fontSize: 12, color: MI, fontFamily: FF }}><strong style={{ color: TX }}>How to use:</strong> {s.howToUse}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CollabIdeas({ clientId, pushToast }) {
  const bk = loadBrandKit(clientId)
  const [niche, setNiche] = useState(bk.topics?.join(', ') || '')
  const [collabType, setCollabType] = useState('Joint Reel')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const generate = async () => {
    setLoading(true)
    try {
      const res = await callClaude([{ role: 'user', content: `Generate collab ideas for a "${niche || 'wellness'}" creator. Collab type: ${collabType}. Return ONLY valid JSON: {"concepts": [{"title": "string", "description": "string"}], "idealCollabAccount": "string", "scriptIdea": "string", "expectedReachBenefit": "string"}` }], 800)
      setResult(typeof res === 'object' && res !== null ? res : null)
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hasKey && <NoKeyBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Your Niche"><Inp value={niche} onChange={setNiche} placeholder="yoga, wellness, fitness" /></Field>
        <Field label="Collab Type"><Sel value={collabType} onChange={setCollabType} options={COLLAB_TYPES} /></Field>
      </div>
      <OrangeBtn label={loading ? 'Generating…' : 'Generate Collab Ideas'} onClick={generate} disabled={!hasKey} loading={loading} />
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.concepts?.map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${OR}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 4, fontFamily: FF }}>{c.title}</div>
              <div style={{ fontSize: 12, color: MI, fontFamily: FF, lineHeight: 1.5 }}>{c.description}</div>
            </div>
          ))}
          {result.idealCollabAccount && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${PUR}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4, fontFamily: FF }}>Ideal Collab Account</span>
              <span style={{ fontSize: 13, color: TX, fontFamily: FF }}>{result.idealCollabAccount}</span>
            </div>
          )}
          {result.scriptIdea && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${BD}`, borderLeft: `3px solid ${OR}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4, fontFamily: FF }}>Script Idea</span>
              <span style={{ fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.5 }}>{result.scriptIdea}</span>
            </div>
          )}
          {result.expectedReachBenefit && (
            <div style={{ background: `${OR}12`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${OR}40` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4, fontFamily: FF }}>Expected Reach Benefit</span>
              <span style={{ fontSize: 13, color: TX, fontFamily: FF }}>{result.expectedReachBenefit}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WeeklyPlanner({ clientId, addContent, pushToast }) {
  const strategy = loadStrategy(clientId)

  const makeSlots = () => DAY_NAMES.map(day => ({ day, platform: 'Instagram', contentType: 'Reel', topic: '', caption: '' }))
  const [slots, setSlots] = useState(makeSlots)
  const [loadingSlot, setLoadingSlot] = useState({})
  const [sent, setSent] = useState(false)
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  const autoPlan = () => {
    const pp = strategy?.postingPlan || {}
    const reels    = Number(pp.reels)    || 2
    const posts    = Number(pp.posts)    || 2
    const stories  = Number(pp.stories)  || 2
    const types = [
      ...Array(reels).fill('Reel'),
      ...Array(posts).fill('Carousel'),
      ...Array(stories).fill('Story'),
    ].slice(0, 7)
    while (types.length < 7) types.push('Static Post')
    setSlots(prev => prev.map((s, i) => ({ ...s, contentType: types[i] || 'Static Post' })))
    pushToast?.('Plan auto-filled from strategy')
  }

  const generateSlot = async (day) => {
    const slot = slots.find(s => s.day === day)
    if (!slot || !hasKey) return
    setLoadingSlot(l => ({ ...l, [day]: true }))
    try {
      const res = await callClaude([{ role: 'user', content: `Write a short caption for a ${slot.platform} ${slot.contentType}${slot.topic ? ` about "${slot.topic}"` : ''}.${brainCtx(clientId)} Return caption text only.` }], 400)
      const cap = typeof res === 'string' ? res : JSON.stringify(res)
      setSlots(prev => prev.map(s => s.day === day ? { ...s, caption: cap } : s))
    } catch (e) { pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 60), 'error') }
    setLoadingSlot(l => ({ ...l, [day]: false }))
  }

  const sendAll = () => {
    const filled = slots.filter(s => s.topic || s.caption)
    if (!filled.length) { pushToast?.('Add topics or generate content first', 'error'); return }
    filled.forEach((s, i) => {
      addContent({ clientId, title: (s.topic || s.contentType).slice(0, 80), caption: s.caption || '', platforms: [s.platform], contentType: s.contentType, status: 'Draft', scheduledDate: offsetDate(i + 1), createdAt: new Date().toISOString() })
    })
    setSent(true)
    pushToast?.(`${filled.length} posts sent to calendar!`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!strategy && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${PUR}10`, border: `1px solid ${PUR}30`, color: PUR, fontSize: 13, fontWeight: 600, fontFamily: FF }}>
          Run Strategy first to enable Auto Plan — posting plan data will be used.
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {strategy && <OrangeBtn label="⚡ Auto Plan" onClick={autoPlan} />}
        <button onClick={sendAll} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: sent ? '#16A34A' : PUR, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF }}>
          {sent ? '✓ Sent to Calendar' : 'Send All to Calendar'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slots.map(slot => (
          <div key={slot.day} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${BD}`, display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 80, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: PUR, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF, marginBottom: 4 }}>{slot.day.slice(0, 3)}</div>
              <select value={slot.platform} onChange={e => setSlots(p => p.map(s => s.day === slot.day ? { ...s, platform: e.target.value } : s))}
                style={{ width: '100%', padding: '5px 7px', borderRadius: 7, border: `1px solid ${BD}`, fontSize: 11, fontFamily: FF, color: TX, background: '#fafafa' }}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ width: 110, flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: FF, marginBottom: 4 }}>Type</div>
              <select value={slot.contentType} onChange={e => setSlots(p => p.map(s => s.day === slot.day ? { ...s, contentType: e.target.value } : s))}
                style={{ width: '100%', padding: '5px 7px', borderRadius: 7, border: `1px solid ${BD}`, fontSize: 11, fontFamily: FF, color: TX, background: '#fafafa' }}>
                {CTYPES_EXT.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: FF, marginBottom: 4 }}>Topic</div>
              <input value={slot.topic} onChange={e => setSlots(p => p.map(s => s.day === slot.day ? { ...s, topic: e.target.value } : s))}
                placeholder="What is this post about?"
                style={{ width: '100%', boxSizing: 'border-box', padding: '6px 9px', borderRadius: 7, border: `1px solid ${BD}`, fontSize: 12, fontFamily: FF, color: TX, background: '#fafafa', outline: 'none' }} />
            </div>
            {slot.caption && (
              <div style={{ flex: 2, minWidth: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: FF, marginBottom: 4 }}>Generated</div>
                <div style={{ fontSize: 12, color: TX, fontFamily: FF, lineHeight: 1.45, background: `${OR}08`, borderRadius: 7, padding: '6px 8px', border: `1px solid ${OR}30` }}>{slot.caption.slice(0, 120)}{slot.caption.length > 120 ? '…' : ''}</div>
              </div>
            )}
            {hasKey && (
              <button onClick={() => generateSlot(slot.day)} disabled={!!loadingSlot[slot.day]}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${OR}`, background: 'transparent', color: OR, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, flexShrink: 0, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6 }}>
                {loadingSlot[slot.day] ? <><Spin /> …</> : '✦ Generate'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI Tools tab definitions ─────────────────────────────────────────────────────
const AI_TABS = [
  { label: 'Caption Writer' },
  { label: 'Hook Generator' },
  { label: 'Hashtag Builder' },
  { label: 'CTA Generator' },
  { label: 'Content Brief' },
  { label: 'Audio Suggester' },
  { label: 'Collab Ideas' },
  { label: 'Weekly Planner' },
]

// ── CreateTab (default export) ───────────────────────────────────────────────────
export default function CreateTab({ client, content, addContent, onOpenNewPost, onOpenIntelligence, pushToast }) {
  const clientId = client?.id

  // Quick Generate state
  const [qTopic,       setQTopic]       = useState('')
  const [qPlatform,    setQPlatform]    = useState('Instagram')
  const [qContentType, setQContentType] = useState('Reel')
  const [qGoal,        setQGoal]        = useState('Drive Engagement')
  const [qTone,        setQTone]        = useState('Auto from Brand Kit')
  const [qLoading,     setQLoading]     = useState(false)
  const [qResult,      setQResult]      = useState(null)
  const [qError,       setQError]       = useState('')
  const [aiTab,        setAiTab]        = useState(0)

  const hasKey = !!localStorage.getItem('pulse_anthropic_key')

  const generateWith = useCallback(async (topic, platform, contentType, goal, tone) => {
    if (!topic.trim() || !hasKey) return
    setQLoading(true); setQResult(null); setQError('')
    try {
      const bk    = loadBrandKit(clientId)
      const voice = tone === 'Auto from Brand Kit' ? (bk.voice || 'engaging and authentic') : tone
      const strat = loadStrategy(clientId)
      const dir   = strat?.contentDirection?.join(', ') || ''

      const prompt = `Generate a social media post for ${platform} about "${topic}".
Brand voice: ${voice}. Goal: ${goal}. Tone: ${tone}. Content direction: ${dir || 'engaging and relevant'}.${brainCtx(clientId)}
Return ONLY valid JSON:
{
  "caption": "string",
  "hook": "string",
  "hashtags": ["string"],
  "visualIdea": "string",
  "cta": "string",
  "bestTimeToPost": "string",
  "viralTip": "string"
}`
      const res = await callClaude([{ role: 'user', content: prompt }], 900)
      setQResult(typeof res === 'object' && res !== null ? res : null)
      if (!res || typeof res !== 'object') setQError('Unexpected response — please try again.')
    } catch (e) {
      if (e.message === 'NO_KEY') setQError('Add your Anthropic API key in Settings.')
      else setQError(e.message.slice(0, 100))
    }
    setQLoading(false)
  }, [clientId])

  const handleGenerate = () => generateWith(qTopic, qPlatform, qContentType, qGoal, qTone)

  const handleCardClick = (card) => {
    setQTopic(card.topic)
    setQGoal(card.goal)
    setQTone(card.tone)
    generateWith(card.topic, qPlatform, qContentType, card.goal, card.tone)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveToCalendar = () => {
    if (!qResult || !clientId) return
    addContent({ clientId, title: (qTopic || 'AI Post').slice(0, 80), caption: qResult.caption || '', platforms: [qPlatform], contentType: qContentType, status: 'Draft', scheduledDate: isoToday(), createdAt: new Date().toISOString() })
    pushToast?.('Saved to calendar!')
  }

  const CARD_STYLE = { background: '#fff', borderRadius: 16, padding: '18px 16px', border: `1px solid ${BD}`, cursor: 'pointer', textAlign: 'left', fontFamily: FF, transition: 'transform .15s, border-color .15s, box-shadow .15s', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }

  return (
    <div style={{ fontFamily: FF }}>

      {/* ── Section 1: Trending Banner ── */}
      <div style={{ background: '#FFF4ED', borderLeft: `4px solid ${OR}`, borderRadius: 10, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TX, fontFamily: FF, flexShrink: 0 }}>What's working right now:</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Reels under 7s 🔥', '10-slide Carousels 💾', 'Story Polls 💬', 'Text posts on LinkedIn 📈'].map(pill => (
            <span key={pill} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${OR}`, color: OR, background: 'transparent', fontFamily: FF }}>{pill}</span>
          ))}
        </div>
      </div>

      {/* ── Section 2: Quick Generate ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, marginBottom: 32 }}>

        {/* Left: inputs */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 20px', border: `1px solid ${BD}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 800, color: TX, fontFamily: FF }}>Quick Generate</h3>
            <p style={{ margin: 0, fontSize: 12, color: MI, fontFamily: FF }}>Generate full post content instantly.</p>
          </div>
          <Field label="Topic"><Inp value={qTopic} onChange={t => { setQTopic(t); setQResult(null); setQError('') }} placeholder="What is this post about?" /></Field>
          <Field label="Platform"><Sel value={qPlatform} onChange={setQPlatform} options={PLATFORMS} /></Field>
          <Field label="Content Type"><Sel value={qContentType} onChange={setQContentType} options={CTYPES_EXT} /></Field>
          <Field label="Goal"><Sel value={qGoal} onChange={setQGoal} options={GOALS} /></Field>
          <Field label="Tone Override"><Sel value={qTone} onChange={setQTone} options={TONES} /></Field>
          <OrangeBtn label={qLoading ? 'Generating…' : '✦ Generate'} onClick={handleGenerate} disabled={!qTopic.trim() || !hasKey || qLoading} loading={false} fullWidth />
          {!hasKey && <p style={{ margin: 0, fontSize: 12, color: MI, fontFamily: FF }}>Add your Anthropic API key in Settings to enable AI generation.</p>}
        </div>

        {/* Right: output */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 20px', border: `1px solid ${BD}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {qLoading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: MI, fontSize: 13, fontFamily: FF, padding: '60px 0' }}>
              <Spin /><span>Generating your content…</span>
            </div>
          )}
          {!qLoading && !qResult && !qError && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: `2px dashed ${BD}`, borderRadius: 12, gap: 10 }}>
              <span style={{ fontSize: 32 }}>✦</span>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: MI, fontFamily: FF }}>Your content appears here</p>
              <p style={{ margin: 0, fontSize: 12, color: MI, fontFamily: FF }}>Fill in the fields and click Generate</p>
            </div>
          )}
          {qError && !qLoading && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#DC2626', fontSize: 13, fontFamily: FF }}>{qError}</div>
          )}
          {qResult && !qLoading && (
            <>
              <OutputCard label="Caption"          value={qResult.caption}       pushToast={pushToast} />
              <OutputCard label="Hook"              value={qResult.hook}          pushToast={pushToast} />
              <OutputCard label="Hashtags"          value={qResult.hashtags?.join(' ')} pushToast={pushToast} />
              <OutputCard label="Visual Idea"       value={qResult.visualIdea}    pushToast={pushToast} accent={PUR} />
              <OutputCard label="CTA"               value={qResult.cta}           pushToast={pushToast} accent={PUR} />
              <OutputCard label="Best Time To Post" value={qResult.bestTimeToPost} pushToast={pushToast} accent="#16A34A" />
              {qResult.viralTip && (
                <div style={{ background: `${OR}12`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${OR}30`, borderTop: `3px solid ${OR}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5, fontFamily: FF }}>Viral Tip</div>
                  <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.5 }}>{qResult.viralTip}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={saveToCalendar} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: PUR, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF }}>
                  Save to Calendar
                </button>
                <button onClick={handleGenerate} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${OR}`, background: 'transparent', color: OR, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF }}>
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Section 3: Creative Ideas Board ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: TX, fontFamily: FF }}>Creative Ideas Board</h3>
          <p style={{ margin: 0, fontSize: 13, color: MI, fontFamily: FF }}>Click any card to generate content instantly.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {IDEAS.map(card => (
            <button key={card.id} onClick={() => handleCardClick(card)}
              style={CARD_STYLE}
              onMouseEnter={e => { e.currentTarget.style.borderColor = OR; e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 6px 24px ${OR}30` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>{card.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TX, marginBottom: 5, fontFamily: FF }}>{card.title}</div>
              <div style={{ fontSize: 11, color: MI, fontFamily: FF, lineHeight: 1.4 }}>{card.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 4: AI Tools ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${BD}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 16px 0', borderBottom: `1px solid ${BD}`, overflowX: 'auto' }}>
          {AI_TABS.map((t, i) => (
            <button key={i} onClick={() => setAiTab(i)}
              style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: FF, whiteSpace: 'nowrap', color: aiTab === i ? OR : MI, background: aiTab === i ? '#FFF4ED' : 'transparent', borderBottom: aiTab === i ? `2px solid ${OR}` : '2px solid transparent', marginBottom: -1, transition: 'color .15s, background .15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '22px 20px' }}>
          {aiTab === 0 && <CaptionWriter clientId={clientId} pushToast={pushToast} />}
          {aiTab === 1 && <HookGenerator clientId={clientId} pushToast={pushToast} />}
          {aiTab === 2 && <HashtagBuilder clientId={clientId} pushToast={pushToast} />}
          {aiTab === 3 && <CTAGenerator pushToast={pushToast} />}
          {aiTab === 4 && <ContentBrief clientId={clientId} pushToast={pushToast} />}
          {aiTab === 5 && <ViralAudio clientId={clientId} pushToast={pushToast} />}
          {aiTab === 6 && <CollabIdeas clientId={clientId} pushToast={pushToast} />}
          {aiTab === 7 && <WeeklyPlanner clientId={clientId} addContent={addContent} pushToast={pushToast} />}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
