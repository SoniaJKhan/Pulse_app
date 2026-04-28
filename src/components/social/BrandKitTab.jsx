import React, { useState, useEffect, useRef } from 'react'
import { safeGet, safeSet } from '../../utils/storage'
import { callClaude } from './socialUtils.jsx'

// ── Tokens ─────────────────────────────────────────────────────────────────────
const BG   = '#F7F5FF'
const OR   = '#F97316'
const TX   = '#1A1A1A'
const MI   = '#6B7280'
const BD   = '#E5E7EB'
const FF   = "'Outfit', sans-serif"

const INP_S = {
  width: '100%', boxSizing: 'border-box', padding: '10px 13px',
  border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 13.5,
  fontFamily: FF, color: TX, background: '#FAFAFA', outline: 'none',
}

// ── Constants ──────────────────────────────────────────────────────────────────
const INDUSTRIES   = ['Yoga','Pilates','Gym','Spa','Wellness Clinic','Personal Training','Nutrition','Beauty','Dental','Chiropractic','Dance','Other']
const VOICES       = ['Professional','Friendly','Inspirational','Edgy','Conversational','Luxury']
const PERSONALITIES= ['Trustworthy','Fun','Bold','Caring','Expert','Relatable','Motivating']
const AGE_RANGES   = ['18-24','25-34','35-44','45-54','55+']
const GENDERS      = ['Mostly Female','Mostly Male','Mixed']
const LOCATIONS    = ['Local','National','Global']
const INTERESTS    = ['Fitness','Wellness','Beauty','Food','Travel','Business','Lifestyle','Education','Entertainment','Fashion']
const PAIN_POINTS  = ['No time','Low budget','Lack of motivation','Overwhelmed','Need community','Want results','Need guidance']
const FEELINGS     = ['Inspired','Motivated','Educated','Entertained','Understood','Trusted']
const FONT_STYLES  = ['Modern','Classic','Playful','Bold','Minimal']
const VISUAL_STYLES= ['Clean','Dark','Colorful','Minimal','Warm','Editorial']
const EMOJI_OPTS   = ['None','Minimal','Moderate','Heavy']
const CTA_STYLES   = ['Soft','Direct','Urgent','Question-based']
const PLATFORMS    = ['Instagram','TikTok','Facebook','LinkedIn','YouTube']
const PRICE_RANGES = ['Budget','Mid-range','Premium','Luxury']
const BOOK_METHODS = ['DM','Website','Phone','App','Walk-in']
const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STEP_FEEDBACK = [
  'Your brand identity is taking shape',
  'Your audience is now defined',
  'Your visual identity is set',
  'Your content direction is clear',
  'Your brand voice is defined',
  'Your platforms are set',
  'Your business context is ready',
  'Your brand guardrails are in place',
]

// ── Tone conflict map ──────────────────────────────────────────────────────────
const TONE_CONFLICTS = {
  'Luxury':       ['Fun', 'Edgy', 'Relatable'],
  'Professional': ['Fun', 'Edgy'],
  'Edgy':         ['Trustworthy', 'Expert'],
}

function defaultState() {
  return {
    brandName: '', industry: '', brandVoice: '', brandPersonality: [], uniqueSellingPoint: '',
    ageRange: '', genderFocus: '', locationFocus: '', topInterests: [], painPoints: [], desiredFeeling: [],
    primaryColor: '#6C4CF1', secondaryColor: '#F97316', accentColor: '#4A7C5C',
    fontStyle: '', visualStyle: [], logoUrl: '',
    contentThemes: [], alwaysCover: [], neverCover: [], competitorAdmire: '', contentHate: '',
    captionLove: '', captionHate: '', wordsAlwaysUse: [], wordsNeverUse: [], emojiUsage: '', ctaStyle: '',
    primaryPlatform: '', secondaryPlatform: '', postingGoals: {}, currentFollowers: {},
    mainOffer: '', priceRange: '', bookingMethod: '', seasonalPeaks: [], currentPromotions: '',
    neverSay: [], neverPost: [], notTargeting: [], biggestMistake: '',
  }
}

// ── Shared UI primitives ───────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase',
      letterSpacing: '.06em', marginBottom: 6, fontFamily: FF }}>
      {children}
    </div>
  )
}

function Sel({ value, onChange, options, placeholder = 'Select…' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...INP_S, appearance: 'none', cursor: 'pointer' }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function MultiPill({ options, selected, onToggle, variant = 'default' }) {
  const pillStyle = (active) => {
    if (variant === 'red')   return { background: active ? '#EF4444' : '#FEF2F2', color: active ? '#fff' : '#EF4444', border: `1px solid ${active ? '#EF4444' : '#FCA5A5'}` }
    if (variant === 'green') return { background: active ? '#22C55E' : '#F0FDF4', color: active ? '#fff' : '#22C55E', border: `1px solid ${active ? '#22C55E' : '#86EFAC'}` }
    return { background: active ? OR : '#fff', color: active ? '#fff' : MI, border: `1px solid ${active ? OR : BD}` }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = selected.includes(o)
        return (
          <button key={o} onClick={() => onToggle(o)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              fontFamily: FF, cursor: 'pointer', transition: 'all .15s', ...pillStyle(active) }}>
            {o}
          </button>
        )
      })}
    </div>
  )
}

function TagsInput({ tags, onAdd, onRemove, placeholder, variant = 'default' }) {
  const [val, setVal] = useState('')
  const submit = () => {
    const t = val.trim()
    if (t && !tags.includes(t)) onAdd(t)
    setVal('')
  }
  const pillStyle = () => {
    if (variant === 'red')   return { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5' }
    if (variant === 'green') return { background: '#F0FDF4', color: '#22C55E', border: '1px solid #86EFAC' }
    if (variant === 'grey')  return { background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }
    return { background: `${OR}18`, color: OR, border: `1px solid ${OR}44` }
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: tags.length ? 8 : 0 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            fontFamily: FF, display: 'flex', alignItems: 'center', gap: 5, ...pillStyle() }}>
            {t}
            <button onClick={() => onRemove(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
                fontSize: 12, padding: 0, lineHeight: 1, opacity: .7 }}>✕</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={val} onChange={e => setVal(e.target.value)}
          placeholder={placeholder} style={{ ...INP_S, flex: 1 }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} />
        <button onClick={submit}
          style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: OR,
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, flexShrink: 0 }}>
          Add
        </button>
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  const [hex, setHex] = useState(value)
  useEffect(() => { setHex(value) }, [value])
  const commit = (v) => { const c = v.trim(); if (c) onChange(c) }
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="color" value={hex.startsWith('#') && hex.length === 7 ? hex : '#000000'}
          onChange={e => { setHex(e.target.value); onChange(e.target.value) }}
          style={{ width: 48, height: 42, padding: 2, border: `1.5px solid ${BD}`,
            borderRadius: 9, cursor: 'pointer', flexShrink: 0 }} />
        <input value={hex} onChange={e => setHex(e.target.value)}
          onBlur={() => commit(hex)} placeholder="#hex" style={{ ...INP_S, flex: 1 }} />
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 20 }}><Label>{label}</Label>{children}</div>
}

// ── Inline tip (validation) ────────────────────────────────────────────────────
function InlineTip({ msg, warning }) {
  return (
    <div style={{ marginTop: 7, fontSize: 12, fontWeight: 600, fontFamily: FF,
      color: warning ? '#D97706' : OR,
      display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.45 }}>
      <span style={{ flexShrink: 0, fontSize: 13 }}>{warning ? '⚠' : 'ℹ'}</span>
      {msg}
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function SpinSm() {
  return <div style={{ width: 11, height: 11, border: '2px solid currentColor',
    borderTopColor: 'transparent', borderRadius: '50%',
    animation: 'spin .7s linear infinite', flexShrink: 0 }} />
}

// ── Preview section (added to steps 4 and 5) ──────────────────────────────────
function PreviewSection({ d, pushToast }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const hasKey = !!localStorage.getItem('pulse_anthropic_key')

  const gen = async () => {
    setLoading(true)
    try {
      const voice = d.brandVoice || 'engaging and authentic'
      const personality = (d.brandPersonality || []).join(', ') || 'authentic'
      const themes = (d.contentThemes || []).join(', ') || 'brand content'
      const prompt = `Based on this brand data write one sample caption.
Brand voice: ${voice}. Personality: ${personality}.
Themes: ${themes}. Return only the caption text.`
      const res = await callClaude([{ role: 'user', content: prompt }], 350)
      setPreview(typeof res === 'string' ? res : JSON.stringify(res))
    } catch (e) {
      pushToast?.(e.message === 'NO_KEY' ? 'Add API key in Settings' : e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  const copyText = () => {
    navigator.clipboard?.writeText(preview).then(() => pushToast?.('Copied!')).catch(() => {})
  }

  return (
    <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${BD}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: preview ? 12 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF }}>
          AI Caption Preview
        </span>
        <button onClick={gen} disabled={loading || !hasKey}
          style={{ padding: '7px 16px', borderRadius: 9,
            border: `1.5px solid ${loading || !hasKey ? BD : OR}`,
            background: loading || !hasKey ? 'transparent' : `${OR}12`,
            color: loading || !hasKey ? MI : OR,
            fontSize: 12, fontWeight: 700, cursor: loading || !hasKey ? 'not-allowed' : 'pointer',
            fontFamily: FF, display: 'inline-flex', alignItems: 'center', gap: 7, opacity: !hasKey ? 0.5 : 1 }}>
          {loading && <SpinSm />}
          {loading ? 'Generating…' : '✦ Generate Preview'}
        </button>
      </div>
      {preview && (
        <div style={{ background: '#FFF4ED', borderRadius: 10, padding: '14px 16px',
          border: `1px solid ${OR}30`, borderLeft: `3px solid ${OR}`, marginTop: preview ? 0 : 0 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {preview}
          </p>
          <button onClick={copyText}
            style={{ padding: '4px 12px', borderRadius: 7, border: `1px solid ${BD}`,
              background: 'transparent', color: MI, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>
            Copy
          </button>
        </div>
      )}
      {!hasKey && (
        <p style={{ margin: '6px 0 0', fontSize: 11, color: MI, fontFamily: FF }}>
          Add your Anthropic API key in Settings to preview captions.
        </p>
      )}
    </div>
  )
}

// ── Steps ──────────────────────────────────────────────────────────────────────
function Step1({ d, upd }) {
  const toggle = (key, val) => {
    const arr = d[key] || []
    upd({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }
  const uspWords = d.uniqueSellingPoint.trim().split(/\s+/).filter(Boolean).length
  const showUspTip = uspWords > 0 && uspWords < 10
  const conflictP = TONE_CONFLICTS[d.brandVoice] || []
  const showConflict = d.brandVoice && (d.brandPersonality || []).some(p => conflictP.includes(p))

  return (
    <>
      <Field label="Brand Name *">
        <input value={d.brandName} onChange={e => upd({ brandName: e.target.value })}
          placeholder="e.g. Glow Studio" style={INP_S} />
      </Field>
      <Field label="Industry / Niche">
        <Sel value={d.industry} onChange={v => upd({ industry: v })} options={INDUSTRIES} />
      </Field>
      <Field label="Brand Voice">
        <Sel value={d.brandVoice} onChange={v => upd({ brandVoice: v })} options={VOICES} />
      </Field>
      <Field label="Brand Personality">
        <MultiPill options={PERSONALITIES} selected={d.brandPersonality || []}
          onToggle={v => toggle('brandPersonality', v)} />
        {showConflict && <InlineTip warning msg="These may conflict. Consider aligning them." />}
      </Field>
      <Field label="Unique Selling Point *">
        <input value={d.uniqueSellingPoint} onChange={e => upd({ uniqueSellingPoint: e.target.value })}
          placeholder="What makes you different in one sentence?" style={INP_S} />
        {showUspTip && <InlineTip msg="Be more specific. Vague USPs lead to generic content." />}
      </Field>
    </>
  )
}

function Step2({ d, upd }) {
  const toggle = (key, val) => {
    const arr = d[key] || []
    upd({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }
  const showBroadTip = (d.topInterests || []).length >= 8

  return (
    <>
      <Field label="Age Range">
        <Sel value={d.ageRange} onChange={v => upd({ ageRange: v })} options={AGE_RANGES} />
      </Field>
      <Field label="Gender Focus">
        <Sel value={d.genderFocus} onChange={v => upd({ genderFocus: v })} options={GENDERS} />
      </Field>
      <Field label="Location Focus">
        <Sel value={d.locationFocus} onChange={v => upd({ locationFocus: v })} options={LOCATIONS} />
      </Field>
      <Field label="Top Interests">
        <MultiPill options={INTERESTS} selected={d.topInterests || []}
          onToggle={v => toggle('topInterests', v)} />
        {showBroadTip && <InlineTip msg="Narrowing your audience improves content quality." />}
      </Field>
      <Field label="Pain Points">
        <MultiPill options={PAIN_POINTS} selected={d.painPoints || []}
          onToggle={v => toggle('painPoints', v)} />
      </Field>
      <Field label="Desired Feeling">
        <MultiPill options={FEELINGS} selected={d.desiredFeeling || []}
          onToggle={v => toggle('desiredFeeling', v)} />
      </Field>
    </>
  )
}

function Step3({ d, upd }) {
  const toggle = (key, val) => {
    const arr = d[key] || []
    upd({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <ColorField label="Primary Color" value={d.primaryColor} onChange={v => upd({ primaryColor: v })} />
        <ColorField label="Secondary Color" value={d.secondaryColor} onChange={v => upd({ secondaryColor: v })} />
        <ColorField label="Accent Color" value={d.accentColor} onChange={v => upd({ accentColor: v })} />
      </div>
      <Field label="Font Style">
        <Sel value={d.fontStyle} onChange={v => upd({ fontStyle: v })} options={FONT_STYLES} />
      </Field>
      <Field label="Visual Style">
        <MultiPill options={VISUAL_STYLES} selected={d.visualStyle || []}
          onToggle={v => toggle('visualStyle', v)} />
      </Field>
      <Field label="Logo URL (optional)">
        <input value={d.logoUrl} onChange={e => upd({ logoUrl: e.target.value })}
          placeholder="https://…" style={INP_S} />
      </Field>
    </>
  )
}

function Step4({ d, upd, pushToast }) {
  return (
    <>
      <Field label="Content Themes">
        <TagsInput tags={d.contentThemes || []} placeholder="e.g. morning routines, self-care…"
          onAdd={t => upd({ contentThemes: [...(d.contentThemes || []), t] })}
          onRemove={i => upd({ contentThemes: (d.contentThemes || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Topics to Always Cover">
        <TagsInput tags={d.alwaysCover || []} placeholder="e.g. member transformations…"
          onAdd={t => upd({ alwaysCover: [...(d.alwaysCover || []), t] })}
          onRemove={i => upd({ alwaysCover: (d.alwaysCover || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Topics to Never Cover">
        <TagsInput tags={d.neverCover || []} placeholder="e.g. political content…" variant="red"
          onAdd={t => upd({ neverCover: [...(d.neverCover || []), t] })}
          onRemove={i => upd({ neverCover: (d.neverCover || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Competitor They Admire">
        <input value={d.competitorAdmire} onChange={e => upd({ competitorAdmire: e.target.value })}
          placeholder="e.g. @lululemon" style={INP_S} />
      </Field>
      <Field label="Content They Hate Seeing in Their Niche">
        <textarea value={d.contentHate} onChange={e => upd({ contentHate: e.target.value })}
          placeholder="Describe content styles or topics they strongly dislike…"
          style={{ ...INP_S, resize: 'vertical', minHeight: 80 }} />
      </Field>
      <PreviewSection d={d} pushToast={pushToast} />
    </>
  )
}

function Step5({ d, upd, pushToast }) {
  return (
    <>
      <Field label="Example Caption They Love">
        <textarea value={d.captionLove} onChange={e => upd({ captionLove: e.target.value })}
          placeholder="Paste an example caption that feels on-brand…"
          style={{ ...INP_S, resize: 'vertical', minHeight: 90 }} />
      </Field>
      <Field label="Example Caption They Hate">
        <textarea value={d.captionHate} onChange={e => upd({ captionHate: e.target.value })}
          placeholder="Paste an example caption they would never want to post…"
          style={{ ...INP_S, resize: 'vertical', minHeight: 90 }} />
      </Field>
      <Field label="Words They Always Use">
        <TagsInput tags={d.wordsAlwaysUse || []} placeholder="e.g. transform, community…" variant="green"
          onAdd={t => upd({ wordsAlwaysUse: [...(d.wordsAlwaysUse || []), t] })}
          onRemove={i => upd({ wordsAlwaysUse: (d.wordsAlwaysUse || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Words They Never Use">
        <TagsInput tags={d.wordsNeverUse || []} placeholder="e.g. cheap, diet, skinny…" variant="red"
          onAdd={t => upd({ wordsNeverUse: [...(d.wordsNeverUse || []), t] })}
          onRemove={i => upd({ wordsNeverUse: (d.wordsNeverUse || []).filter((_, j) => j !== i) })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <Label>Emoji Usage</Label>
          <Sel value={d.emojiUsage} onChange={v => upd({ emojiUsage: v })} options={EMOJI_OPTS} />
        </div>
        <div>
          <Label>CTA Style</Label>
          <Sel value={d.ctaStyle} onChange={v => upd({ ctaStyle: v })} options={CTA_STYLES} />
        </div>
      </div>
      <PreviewSection d={d} pushToast={pushToast} />
    </>
  )
}

function Step6({ d, upd }) {
  const activePlatforms = [d.primaryPlatform, d.secondaryPlatform].filter(p => p && p !== 'None')
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <Label>Primary Platform</Label>
          <Sel value={d.primaryPlatform} onChange={v => upd({ primaryPlatform: v })} options={PLATFORMS} />
        </div>
        <div>
          <Label>Secondary Platform</Label>
          <Sel value={d.secondaryPlatform} onChange={v => upd({ secondaryPlatform: v })}
            options={['None', ...PLATFORMS]} placeholder="None" />
        </div>
      </div>
      {activePlatforms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activePlatforms.map(p => (
            <div key={p} style={{ background: BG, borderRadius: 12, padding: '14px 16px', border: `1px solid ${BD}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TX, fontFamily: FF, marginBottom: 10 }}>{p}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>Posting Goal</Label>
                  <input value={(d.postingGoals || {})[p] || ''}
                    onChange={e => upd({ postingGoals: { ...(d.postingGoals || {}), [p]: e.target.value } })}
                    placeholder="e.g. 5 posts/week" style={INP_S} />
                </div>
                <div>
                  <Label>Current Followers</Label>
                  <input type="number" value={(d.currentFollowers || {})[p] || ''}
                    onChange={e => upd({ currentFollowers: { ...(d.currentFollowers || {}), [p]: e.target.value } })}
                    placeholder="e.g. 2400" style={INP_S} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function Step7({ d, upd }) {
  const toggle = (key, val) => {
    const arr = d[key] || []
    upd({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }
  return (
    <>
      <Field label="Main Offer or Service">
        <input value={d.mainOffer} onChange={e => upd({ mainOffer: e.target.value })}
          placeholder="e.g. 6-week transformation program" style={INP_S} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <Label>Price Range</Label>
          <Sel value={d.priceRange} onChange={v => upd({ priceRange: v })} options={PRICE_RANGES} />
        </div>
        <div>
          <Label>Booking Method</Label>
          <Sel value={d.bookingMethod} onChange={v => upd({ bookingMethod: v })} options={BOOK_METHODS} />
        </div>
      </div>
      <Field label="Seasonal Peaks">
        <MultiPill options={MONTHS} selected={d.seasonalPeaks || []}
          onToggle={v => toggle('seasonalPeaks', v)} />
      </Field>
      <Field label="Current Promotions (optional)">
        <textarea value={d.currentPromotions} onChange={e => upd({ currentPromotions: e.target.value })}
          placeholder="Any active deals, launches, or campaigns…"
          style={{ ...INP_S, resize: 'vertical', minHeight: 80 }} />
      </Field>
    </>
  )
}

function Step8({ d, upd }) {
  return (
    <>
      <Field label="What We NEVER Say">
        <TagsInput tags={d.neverSay || []} placeholder="e.g. guaranteed results…" variant="red"
          onAdd={t => upd({ neverSay: [...(d.neverSay || []), t] })}
          onRemove={i => upd({ neverSay: (d.neverSay || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="What We NEVER Post">
        <TagsInput tags={d.neverPost || []} placeholder="e.g. before/after comparisons…" variant="red"
          onAdd={t => upd({ neverPost: [...(d.neverPost || []), t] })}
          onRemove={i => upd({ neverPost: (d.neverPost || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Who We Are NOT Targeting">
        <TagsInput tags={d.notTargeting || []} placeholder="e.g. under 18s, men…" variant="grey"
          onAdd={t => upd({ notTargeting: [...(d.notTargeting || []), t] })}
          onRemove={i => upd({ notTargeting: (d.notTargeting || []).filter((_, j) => j !== i) })} />
      </Field>
      <Field label="Our Biggest Brand Mistake to Avoid">
        <textarea value={d.biggestMistake} onChange={e => upd({ biggestMistake: e.target.value })}
          placeholder="Describe the #1 thing that has hurt or could hurt your brand image…"
          style={{ ...INP_S, resize: 'vertical', minHeight: 100 }} />
      </Field>
    </>
  )
}

const STEP_META = [
  { title: 'Brand Identity',     subtitle: 'Define who you are and what makes you stand out.' },
  { title: 'Target Audience',    subtitle: 'Paint a picture of your ideal client.' },
  { title: 'Visual Identity',    subtitle: 'Set the look and feel of your brand.' },
  { title: 'Content Direction',  subtitle: 'Map out the topics and themes you own.' },
  { title: 'Brand Voice',        subtitle: 'Show us how you sound in real life.' },
  { title: 'Platform Priorities',subtitle: 'Choose where and how often you show up.' },
  { title: 'Business Context',   subtitle: 'Give us the commercial picture.' },
  { title: 'Brand Guardrails',   subtitle: 'Set the hard limits to protect your brand.' },
]

function isStepValid(step, d) {
  if (step === 0) return d.brandName.trim() !== '' && d.uniqueSellingPoint.trim() !== ''
  return true
}

// ── Brand Brain Display ────────────────────────────────────────────────────────
function BrainCard({ title, accent, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px',
      border: `1px solid ${BD}`, borderTop: `4px solid ${accent || OR}`,
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase',
        letterSpacing: '.08em', marginBottom: 14, fontFamily: FF }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function CopyBtn({ text, pushToast }) {
  const copy = () => navigator.clipboard?.writeText(text).then(() => pushToast?.('Copied!')).catch(() => {})
  return (
    <button onClick={copy}
      style={{ padding: '4px 11px', borderRadius: 7, border: `1px solid ${BD}`,
        background: 'transparent', color: MI, fontSize: 11, fontWeight: 600,
        cursor: 'pointer', fontFamily: FF, flexShrink: 0 }}>
      Copy
    </button>
  )
}

function BrandBrainScreen({ brain, data, onEdit, onRegenerate, pushToast }) {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 20, padding: '26px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: TX, fontFamily: FF }}>
            Your Brand Brain is ready
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: MI, fontFamily: FF }}>
            {data.brandName ? `${data.brandName} — ` : ''}AI-generated brand intelligence
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRegenerate}
            style={{ padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${OR}`,
              background: `${OR}12`, color: OR, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF }}>
            Regenerate
          </button>
          <button onClick={onEdit}
            style={{ padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${BD}`,
              background: '#fff', color: TX, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>
            Edit Brand Kit
          </button>
        </div>
      </div>

      {/* Card 1: Brand Summary */}
      <BrainCard title="Brand Summary" accent={OR}>
        <p style={{ margin: 0, fontSize: 14, color: TX, fontFamily: FF, lineHeight: 1.75 }}>
          {brain.brandSummary}
        </p>
      </BrainCard>

      {/* Card 2: Positioning */}
      <BrainCard title="Positioning" accent="#7C3AED">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: brain.toneDescription ? 14 : 0 }}>
          <div style={{ borderRadius: 12, padding: '14px 16px', border: '2px solid #22C55E', background: '#F0FDF4' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: FF }}>We Are</div>
            <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.6 }}>{brain.positioningStatement}</p>
          </div>
          <div style={{ borderRadius: 12, padding: '14px 16px', border: '2px solid #EF4444', background: '#FEF2F2' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontFamily: FF }}>We Are Not</div>
            <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.6 }}>{brain.weAreNot}</p>
          </div>
        </div>
        {brain.toneDescription && (
          <div style={{ padding: '12px 14px', background: BG, borderRadius: 10, border: `1px solid ${BD}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5, fontFamily: FF }}>Tone</div>
            <p style={{ margin: 0, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.5 }}>{brain.toneDescription}</p>
          </div>
        )}
      </BrainCard>

      {/* Card 3: Content Pillars */}
      {brain.pillars?.length > 0 && (
        <BrainCard title="Content Pillars" accent={OR}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {brain.pillars.map((p, i) => (
              <div key={i} style={{ background: BG, borderRadius: 12, padding: '14px 16px',
                border: `1px solid ${BD}`, borderLeft: `3px solid ${OR}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 8, fontFamily: FF }}>{p.name}</div>
                {p.audiencePainPoint && (
                  <div style={{ fontSize: 11, color: MI, fontFamily: FF, marginBottom: 5, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#B45309' }}>Pain point: </span>{p.audiencePainPoint}
                  </div>
                )}
                {p.emotionalTrigger && (
                  <div style={{ fontSize: 11, color: MI, fontFamily: FF, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#7C3AED' }}>Trigger: </span>{p.emotionalTrigger}
                  </div>
                )}
              </div>
            ))}
          </div>
        </BrainCard>
      )}

      {/* Card 4: Post Ideas */}
      {brain.postIdeas?.length > 0 && (
        <BrainCard title="Post Ideas" accent="#16A34A">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {brain.postIdeas.map((idea, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: BG, borderRadius: 10, border: `1px solid ${BD}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: OR, background: `${OR}15`,
                  padding: '2px 8px', borderRadius: 20, fontFamily: FF, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.45 }}>{idea}</span>
                <CopyBtn text={idea} pushToast={pushToast} />
              </div>
            ))}
          </div>
        </BrainCard>
      )}

      {/* Card 5: Caption Samples */}
      {(brain.sampleCaptionOnBrand || brain.sampleCaptionOffBrand) && (
        <BrainCard title="Caption Samples" accent="#22C55E">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {brain.sampleCaptionOnBrand && (
              <div style={{ borderRadius: 12, padding: '14px 16px', border: '2px solid #22C55E', background: '#F0FDF4' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF, flex: 1 }}>On Brand</span>
                  <CopyBtn text={brain.sampleCaptionOnBrand} pushToast={pushToast} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: TX, fontFamily: FF, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{brain.sampleCaptionOnBrand}</p>
              </div>
            )}
            {brain.sampleCaptionOffBrand && (
              <div style={{ borderRadius: 12, padding: '14px 16px', border: '2px solid #EF4444', background: '#FEF2F2' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF, flex: 1 }}>Off Brand</span>
                  <CopyBtn text={brain.sampleCaptionOffBrand} pushToast={pushToast} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: TX, fontFamily: FF, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{brain.sampleCaptionOffBrand}</p>
              </div>
            )}
          </div>
          {brain.whyOffBrandIsWrong && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', fontFamily: FF }}>Why this is wrong: </span>
              <span style={{ fontSize: 12, color: TX, fontFamily: FF, lineHeight: 1.5 }}>{brain.whyOffBrandIsWrong}</span>
            </div>
          )}
        </BrainCard>
      )}

      {/* Card 6: Content Rules */}
      {(brain.contentRules?.do?.length > 0 || brain.contentRules?.dont?.length > 0) && (
        <BrainCard title="Content Rules" accent="#EF4444">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, fontFamily: FF }}>Do</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(brain.contentRules.do || []).map((r, i) => (
                  <div key={i} style={{ padding: '7px 12px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #86EFAC', fontSize: 12, color: '#16A34A', fontWeight: 600, fontFamily: FF }}>✓ {r}</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, fontFamily: FF }}>Don't</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(brain.contentRules.dont || []).map((r, i) => (
                  <div key={i} style={{ padding: '7px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5', fontSize: 12, color: '#EF4444', fontWeight: 600, fontFamily: FF }}>✕ {r}</div>
                ))}
              </div>
            </div>
          </div>
        </BrainCard>
      )}

      {/* Vocabulary Rules */}
      {(brain.vocabularyRules?.use?.length > 0 || brain.vocabularyRules?.avoid?.length > 0) && (
        <BrainCard title="Vocabulary" accent="#7C3AED">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: FF }}>Use</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(brain.vocabularyRules.use || []).map((w, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', border: '1px solid #86EFAC', fontSize: 12, color: '#16A34A', fontWeight: 600, fontFamily: FF }}>{w}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: FF }}>Avoid</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(brain.vocabularyRules.avoid || []).map((w, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: 12, color: '#EF4444', fontWeight: 600, fontFamily: FF }}>{w}</span>
                ))}
              </div>
            </div>
          </div>
        </BrainCard>
      )}

      {/* Content Angles */}
      {brain.contentAngles?.length > 0 && (
        <BrainCard title="Content Angles" accent={OR}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {brain.contentAngles.map((angle, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: BG, borderRadius: 10, border: `1px solid ${BD}` }}>
                <span style={{ color: OR, fontSize: 14, flexShrink: 0 }}>→</span>
                <span style={{ flex: 1, fontSize: 13, color: TX, fontFamily: FF, lineHeight: 1.45 }}>{angle}</span>
                <CopyBtn text={angle} pushToast={pushToast} />
              </div>
            ))}
          </div>
        </BrainCard>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BrandKitTab({ clientId, pushToast }) {
  const storageKey = `pulse_brand_${clientId}`
  const brainKey   = `pulse_brand_brain_${clientId}`

  const [data, setData]         = useState(() => ({ ...defaultState(), ...safeGet(storageKey, {}) }))
  const [step, setStep]         = useState(0)
  const [feedback, setFeedback] = useState(false)
  const [phase, setPhase]       = useState(() => safeGet(`pulse_brand_brain_${clientId}`) ? 'brain' : 'wizard')
  const [brandBrain, setBrandBrain] = useState(() => safeGet(`pulse_brand_brain_${clientId}`, null))
  const [genError, setGenError] = useState('')
  const feedbackTimer           = useRef(null)

  useEffect(() => {
    setData({ ...defaultState(), ...safeGet(storageKey, {}) })
    setStep(0)
    setFeedback(false)
    setGenError('')
    const brain = safeGet(brainKey, null)
    setBrandBrain(brain)
    setPhase(brain ? 'brain' : 'wizard')
  }, [clientId])

  const upd = (changes) => {
    setData(prev => {
      const next = { ...prev, ...changes }
      safeSet(storageKey, next)
      return next
    })
  }

  const genBrain = async (brandData) => {
    const key = localStorage.getItem('pulse_anthropic_key')
    if (!key) {
      setGenError('Add your Anthropic API key in Settings to generate your Brand Brain.')
      return
    }
    setPhase('generating')
    setGenError('')
    try {
      const prompt = `Analyze this brand data and return ONLY JSON:
{
  "brandSummary": "string (1 paragraph)",
  "positioningStatement": "string",
  "weAreNot": "string",
  "toneDescription": "string",
  "pillars": [{"name": "string", "audiencePainPoint": "string", "emotionalTrigger": "string"}],
  "postIdeas": ["string", "string", "string", "string", "string"],
  "sampleCaptionOnBrand": "string",
  "sampleCaptionOffBrand": "string",
  "whyOffBrandIsWrong": "string",
  "contentRules": {"do": ["string"], "dont": ["string"]},
  "vocabularyRules": {"use": ["string"], "avoid": ["string"]},
  "contentAngles": ["string"]
}

Brand Data: ${JSON.stringify(brandData)}`
      const res = await callClaude([{ role: 'user', content: prompt }], 2400)
      if (typeof res === 'object' && res !== null && !Array.isArray(res)) {
        safeSet(brainKey, res)
        setBrandBrain(res)
        setPhase('brain')
      } else {
        throw new Error('Unexpected response — please try again.')
      }
    } catch (e) {
      setGenError(e.message === 'NO_KEY' ? 'Add your Anthropic API key in Settings.' : e.message.slice(0, 120))
      setPhase('wizard')
    }
  }

  const goNext = () => {
    setFeedback(true)
    clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(false), 3000)
    if (step < 7) setStep(s => s + 1)
    else genBrain(data)
  }

  const goPrev = () => {
    setFeedback(false)
    setStep(s => s - 1)
  }

  // ── Generating screen ──────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '60px 48px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🧠</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: TX, fontFamily: FF }}>
            Building Your Brand Brain…
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 15, color: MI, fontFamily: FF }}>
            Analyzing your brand data and generating intelligence…
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${OR}`,
              borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Brain screen ───────────────────────────────────────────────────────────
  if (phase === 'brain' && brandBrain) {
    return (
      <div style={{ minHeight: '100vh', background: BG, padding: '32px 16px 60px', display: 'flex', justifyContent: 'center' }}>
        <BrandBrainScreen
          brain={brandBrain}
          data={data}
          onEdit={() => { setPhase('wizard'); setStep(0) }}
          onRegenerate={() => genBrain(data)}
          pushToast={pushToast}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Wizard screen ──────────────────────────────────────────────────────────
  const pct = ((step + 1) / 8) * 100
  const meta = STEP_META[step]
  const valid = isStepValid(step, data)
  const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8]
  const StepComp = STEPS[step]

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex',
      flexDirection: 'column', alignItems: 'center', padding: '32px 16px 60px' }}>

      {genError && (
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 14,
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#DC2626', fontSize: 13, fontFamily: FF }}>
          {genError}
        </div>
      )}

      {brandBrain && (
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setPhase('brain')}
            style={{ padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${OR}`,
              background: `${OR}12`, color: OR, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: FF }}>
            View Brand Brain →
          </button>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '32px 36px 36px' }}>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: MI, fontFamily: FF, fontWeight: 600, marginBottom: 8 }}>
            Step {step + 1} of 8
          </div>
          <div style={{ height: 7, borderRadius: 99, background: '#F0EDFF', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: OR,
              borderRadius: 99, transition: 'width .35s ease' }} />
          </div>
        </div>

        {/* Step header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TX, fontFamily: FF }}>
            {meta.title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: MI, fontFamily: FF }}>
            {meta.subtitle}
          </p>
          <div style={{ fontSize: 13, color: '#16A34A', fontFamily: FF, fontWeight: 600,
            marginTop: 8, minHeight: 20,
            opacity: feedback ? 1 : 0, transition: 'opacity .4s ease' }}>
            ✓ {STEP_FEEDBACK[step]}
          </div>
        </div>

        {/* Step content */}
        <div style={{ marginBottom: 32 }}>
          <StepComp d={data} upd={upd} pushToast={pushToast} />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button onClick={goPrev}
              style={{ flex: 1, padding: '13px', borderRadius: 11,
                border: `1.5px solid ${BD}`, background: '#fff', color: TX,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FF }}>
              ← Back
            </button>
          )}
          <button onClick={goNext} disabled={!valid}
            style={{ flex: 2, padding: '13px', borderRadius: 11, border: 'none',
              background: valid ? OR : '#FED7AA', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed',
              fontFamily: FF, transition: 'background .2s' }}>
            {step === 7 ? 'Generate Brand Brain →' : 'Next →'}
          </button>
        </div>

        {step === 7 && (
          <p style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 12, color: MI, fontFamily: FF }}>
            All changes are saved automatically. Finishing will generate your AI Brand Brain.
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
