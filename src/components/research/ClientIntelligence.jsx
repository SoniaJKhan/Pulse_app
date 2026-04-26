import React, { useState, useCallback } from 'react'

const STAGES = ['Client', 'Brand & Content', 'Competitors', 'Analysis', 'Strategy']
const STORAGE_KEY = 'pulse_client_intelligence'

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Twitter/X', 'Pinterest']
const GOAL_OPTIONS = ['Growth', 'Engagement', 'Leads', 'Sales', 'Personal Brand']
const CONTENT_TYPES = ['Reel', 'Carousel', 'Static', 'Story', 'Other']
const CATEGORIES = ['Performance', 'Educational', 'BTS', 'Lifestyle', 'Promotional']
const HOOK_STYLES = ['Emotional', 'Informational', 'Visual', 'Trend']
const WEEKLY_OBJ_OPTIONS = ['Engagement', 'Reach', 'DMs', 'Testing Reels']

// ─── Storage ───────────────────────────────────────────────────────────────────

function defaultData() {
  return {
    clientProfile: { clientName: '', clientType: '', platforms: [], goals: [] },
    brand: { toneKeywords: [], audienceDescription: '', languageStyle: 'English' },
    contentAudit: [],
    competitors: [],
    weeklyObjective: '',
    aiOutputs: {
      patterns: null, competitorInsights: null, strategy: null,
      formatRules: null, executionRules: null, pillars: [], ideas: [], weeklyPlan: [],
    },
  }
}

function loadData(clientId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[clientId] || defaultData()
  } catch { return defaultData() }
}

function saveData(clientId, data) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[clientId] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

// ─── AI Integration ────────────────────────────────────────────────────────────

const PROMPTS = {
  patterns: (payload) => `You are a social media strategist. Analyze the following content audit data STRICTLY based on the actual posts provided. Do not give generic advice. Every finding must reference the specific data given.

Respond with valid JSON only, no markdown:
{"patterns":"what content patterns exist based on the actual posts","working":[{"finding":"specific observation","reasoning":"why this works based on the data"}],"notWorking":[{"finding":"specific observation","reasoning":"why this is underperforming based on the data"}]}

Data:
${JSON.stringify(payload)}`,

  competitors: (payload) => `You are a social media strategist. Analyze competitor data STRICTLY based on the actual accounts and posts provided.

Respond with valid JSON only, no markdown:
{"formats":"common high-performing content formats observed","hookPatterns":"hook patterns from top-performing posts","videoStructure":"video structure trends from the data","engagementTriggers":"what drives engagement based on actual posts"}

Data:
${JSON.stringify(payload)}`,

  strategy: (payload) => `You are a social media strategist. Merge the content and competitor findings below into a clear strategic direction. Base everything strictly on the provided data.

Respond with valid JSON only, no markdown:
{"whatToDo":["specific action 1","specific action 2"],"whatToAvoid":["specific thing to avoid"],"contentDirection":"recommended content direction based on all data"}

Data:
${JSON.stringify(payload)}`,

  formatRules: (payload) => `You are a social media strategist. Define format rules for this specific client based strictly on their brand and strategy data.

Respond with valid JSON only, no markdown:
{"formatType":"best content format type for this client","hookType":"best hook type for this audience","idealLength":"ideal content length with reasoning","style":"raw polished or minimal and why based on brand tone"}

Data:
${JSON.stringify(payload)}`,

  executionRules: (payload) => `You are a social media strategist. Define execution rules for this client based strictly on their data. No generic advice.

Respond with valid JSON only, no markdown:
{"postingFrequency":"recommended posting frequency with reasoning","contentMix":"content mix ratio based on goals and audit","toneGuidance":"specific tone guidance based on their brand keywords","ctaStyle":"CTA style based on their goals"}

Data:
${JSON.stringify(payload)}`,

  pillars: (payload) => `You are a social media strategist. Generate 4–6 content pillars for this client. Each must be directly tied to their brand, audience, and goals. No generic pillars.

Respond with a valid JSON array only, no markdown:
[{"name":"pillar name","description":"what this covers","whyItWorks":"why this works for THIS client specifically","examples":["example content type 1","example content type 2"]}]

Data:
${JSON.stringify(payload)}`,

  ideas: (payload) => `You are a social media strategist. Generate 10–20 content ideas based strictly on the pillars, brand, and audience provided. Short and actionable.

Respond with a valid JSON array only, no markdown:
[{"pillar":"pillar name","idea":"short actionable content idea","contentType":"Reel or Carousel or Static or Story"}]

Data:
${JSON.stringify(payload)}`,

  weeklyPlan: (payload) => `You are a social media strategist. Generate a 7-day content plan based strictly on the client's strategy and pillars. Example format: Day 1 | Reel | "Why most people quit the gym in 30 days" | Motivational hook into transformation story.

Respond with a valid JSON array of exactly 7 items, no markdown:
[{"day":1,"contentType":"Reel","hookIdea":"short hook idea","description":"brief description of what to create"}]

Data:
${JSON.stringify(payload)}`,
}

async function runAIAnalysis(stepType, payload) {
  const apiKey = localStorage.getItem('pulse_anthropic_key')
  if (!apiKey) throw new Error('NO_KEY')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: PROMPTS[stepType](payload) }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text.slice(0, 200))
  }

  const json = await res.json()
  const text = json.content[0].text.trim()
  try { return JSON.parse(text) } catch {}
  const m = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (m) { try { return JSON.parse(m[1]) } catch {} }
  const obj = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (obj) { try { return JSON.parse(obj[0]) } catch {} }
  return text
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const inp = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13,
  fontFamily: "'Outfit', sans-serif", background: 'var(--bg)', color: 'var(--dark)', outline: 'none',
}
const ta = { ...inp, resize: 'vertical', minHeight: 80 }

function Label({ children, helper }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>{children}</label>
      {helper && <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", opacity: 0.7 }}>{helper}</span>}
    </div>
  )
}

function Field({ label, helper, children, col2 }) {
  return (
    <div style={{ marginBottom: 16, gridColumn: col2 ? '1 / -1' : undefined }}>
      <Label helper={helper}>{label}</Label>
      {children}
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--bg)', minHeight: 42, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{ background: 'rgba(196,135,74,0.15)', color: 'var(--accent)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--dark)', flex: 1, minWidth: 80 }}
      />
    </div>
  )
}

function MultiSelect({ options, selected, onChange, allowCustom }) {
  const [customInput, setCustomInput] = useState('')
  const toggle = (opt) => selected.includes(opt) ? onChange(selected.filter(x => x !== opt)) : onChange([...selected, opt])
  const addCustom = () => {
    const val = customInput.trim()
    if (val && !selected.includes(val)) onChange([...selected, val])
    setCustomInput('')
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", border: '1.5px solid',
            background: selected.includes(opt) ? 'rgba(196,135,74,0.15)' : 'transparent',
            borderColor: selected.includes(opt) ? 'var(--accent)' : 'var(--border)',
            color: selected.includes(opt) ? 'var(--accent)' : 'var(--mid-grey)',
          }}>{opt}</button>
        ))}
        {allowCustom && selected.filter(s => !options.includes(s)).map(s => (
          <button key={s} onClick={() => toggle(s)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", border: '1.5px solid var(--accent)',
            background: 'rgba(196,135,74,0.15)', color: 'var(--accent)',
          }}>{s} ×</button>
        ))}
      </div>
      {allowCustom && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input value={customInput} onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Add custom…" style={{ ...inp, width: 160 }} />
          <button onClick={addCustom} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>Add</button>
        </div>
      )}
    </div>
  )
}

function RunButton({ label, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--accent)',
      background: 'rgba(196,135,74,0.1)', color: 'var(--accent)',
      fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: "'Outfit', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1,
    }}>
      {loading && <div style={{ width: 12, height: 12, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
      {label}
    </button>
  )
}

function OutputRenderer({ data }) {
  if (!data) return null
  if (typeof data === 'string') return (
    <p style={{ margin: 0, fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{data}</p>
  )
  if (Array.isArray(data)) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((item, i) => (
        <div key={i} style={{ padding: '11px 14px', background: 'rgba(196,135,74,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
          {typeof item === 'string' ? (
            <span style={{ fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{item}</span>
          ) : Object.entries(item).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'capitalize', fontFamily: "'Outfit', sans-serif" }}>{k.replace(/([A-Z])/g, ' $1')}: </span>
              <span style={{ fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif", display: 'block', marginBottom: 4 }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
          {Array.isArray(v) ? (
            <ul style={{ margin: '0 0 0 14px', padding: 0 }}>
              {v.map((item, i) => <li key={i} style={{ fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", marginBottom: 3 }}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
            </ul>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{String(v)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function AICard({ output, loading, error }) {
  if (loading) return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>
        <div style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Generating analysis…
      </div>
    </div>
  )
  if (error === 'NO_KEY') return (
    <div style={{ background: 'rgba(196,80,58,0.08)', border: '1px solid rgba(196,80,58,0.2)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
      <span style={{ fontSize: 13, color: '#C4503A', fontFamily: "'Outfit', sans-serif" }}>No API key found. Add your Anthropic API key in Settings → Integrations.</span>
    </div>
  )
  if (error) return (
    <div style={{ background: 'rgba(196,80,58,0.08)', border: '1px solid rgba(196,80,58,0.2)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
      <span style={{ fontSize: 13, color: '#C4503A', fontFamily: "'Outfit', sans-serif" }}>Error: {error}</span>
    </div>
  )
  if (!output) return null
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid rgba(196,135,74,0.2)', borderRadius: 10, padding: '16px 18px', marginTop: 12 }}>
      <OutputRenderer data={output} />
    </div>
  )
}

function AnalysisBlock({ title, description, onRun, loading, error, output }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>{title}</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{description}</p>
      <RunButton label={output ? 'Re-run' : 'Run Analysis'} onClick={onRun} loading={loading} />
      <AICard output={output} loading={loading} error={error} />
    </div>
  )
}

// ─── Progress Stepper ──────────────────────────────────────────────────────────

function Stepper({ stage, onGoTo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
      {STAGES.map((s, i) => {
        const isDone = i < stage
        const isActive = i === stage
        return (
          <React.Fragment key={s}>
            <div onClick={() => isDone && onGoTo(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: isDone ? 'pointer' : 'default', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                background: isActive ? 'var(--accent)' : isDone ? 'rgba(196,135,74,0.18)' : 'var(--bg)',
                border: `2px solid ${isActive || isDone ? 'var(--accent)' : 'var(--border)'}`,
                color: isActive ? '#fff' : isDone ? 'var(--accent)' : 'var(--mid-grey)',
                transition: 'all 0.2s',
              }}>
                {isDone ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, fontFamily: "'Outfit', sans-serif", color: isActive ? 'var(--accent)' : isDone ? 'var(--dark)' : 'var(--mid-grey)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < stage ? 'var(--accent)' : 'var(--border)', margin: '15px 6px 0', minWidth: 24 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function NavButtons({ stage, onBack, onNext }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      <button onClick={onBack} disabled={stage === 0} style={{
        padding: '10px 22px', borderRadius: 8, border: '1.5px solid var(--border)',
        background: 'none', color: stage === 0 ? 'var(--border)' : 'var(--mid-grey)',
        fontSize: 13, fontWeight: 600, cursor: stage === 0 ? 'not-allowed' : 'pointer',
        fontFamily: "'Outfit', sans-serif",
      }}>← Back</button>
      {stage < STAGES.length - 1 && (
        <button onClick={onNext} style={{
          padding: '10px 24px', borderRadius: 8, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
        }}>Next →</button>
      )}
    </div>
  )
}

// ─── Stage 1 ───────────────────────────────────────────────────────────────────

function Stage1({ profile, onChange }) {
  const f = (k, v) => onChange({ ...profile, [k]: v })
  const [customType, setCustomType] = useState('')
  const [showCustomType, setShowCustomType] = useState(false)
  const builtinTypes = ['Wellness Creator', 'Other']

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Let us understand your client first.</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>This shapes everything that comes after. Take your time here.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Client Name">
          <input style={inp} value={profile.clientName} onChange={e => f('clientName', e.target.value)} placeholder="e.g. Noor Wellness" />
        </Field>
        <Field label="Client Type">
          <select style={inp} value={builtinTypes.includes(profile.clientType) ? profile.clientType : profile.clientType ? '__custom' : ''}
            onChange={e => {
              if (e.target.value === '__custom') { setShowCustomType(true) }
              else { setShowCustomType(false); f('clientType', e.target.value) }
            }}>
            <option value="">Select type…</option>
            {builtinTypes.map(t => <option key={t} value={t}>{t}</option>)}
            <option value="__custom">Custom…</option>
          </select>
          {(showCustomType || (profile.clientType && !builtinTypes.includes(profile.clientType))) && (
            <input style={{ ...inp, marginTop: 6 }} value={customType || profile.clientType} onChange={e => { setCustomType(e.target.value); f('clientType', e.target.value) }} placeholder="Describe client type…" />
          )}
        </Field>
      </div>

      <Field label="Platforms" helper="Where are they active or want to grow?">
        <MultiSelect options={PLATFORM_OPTIONS} selected={profile.platforms} onChange={v => f('platforms', v)} allowCustom />
      </Field>

      <Field label="Goals" helper="What are they trying to achieve? Select all that apply.">
        <MultiSelect options={GOAL_OPTIONS} selected={profile.goals} onChange={v => f('goals', v)} allowCustom />
      </Field>
    </div>
  )
}

// ─── Stage 2 ───────────────────────────────────────────────────────────────────

function Stage2({ brand, contentAudit, onBrandChange, onAuditChange }) {
  const b = (k, v) => onBrandChange({ ...brand, [k]: v })
  const [addingPost, setAddingPost] = useState(false)
  const emptyPost = { url: '', platform: '', contentType: '', category: '', views: '', likes: '', comments: '', notes: '' }
  const [postForm, setPostForm] = useState(emptyPost)
  const pf = (k, v) => setPostForm(prev => ({ ...prev, [k]: v }))

  const savePost = () => {
    if (!postForm.url.trim()) return
    onAuditChange([...contentAudit, { ...postForm, id: `post-${Date.now()}`, views: Number(postForm.views) || 0, likes: Number(postForm.likes) || 0, comments: Number(postForm.comments) || 0 }])
    setPostForm(emptyPost)
    setAddingPost(false)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Define the brand and review what has been posted.</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>First capture the brand voice, then audit 5–10 existing posts.</p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', marginBottom: 22 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Brand Voice</h3>

        <Field label="Tone Keywords" helper="Example: soulful, premium, energetic, calm">
          <TagInput tags={brand.toneKeywords} onChange={v => b('toneKeywords', v)} placeholder="Type a keyword and press Enter…" />
        </Field>

        <Field label="Audience Description" helper="Who is this content for? Be specific — age, interests, location.">
          <textarea style={ta} value={brand.audienceDescription} onChange={e => b('audienceDescription', e.target.value)} placeholder="e.g. Women aged 25–40 interested in holistic wellness and self-improvement, based in Pakistan and diaspora." />
        </Field>

        <Field label="Language Style">
          <select style={inp} value={brand.languageStyle} onChange={e => b('languageStyle', e.target.value)}>
            {['English', 'Urdu', 'Mix', 'Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Content Audit</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Add 5–10 posts. Mix of best and worst performers gives the most accurate analysis.</p>
          </div>
          {!addingPost && contentAudit.length < 10 && (
            <button onClick={() => setAddingPost(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>+ Add Post</button>
          )}
        </div>

        {addingPost && (
          <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
                <Label>Post URL</Label>
                <input style={inp} value={postForm.url} onChange={e => pf('url', e.target.value)} placeholder="https://…" />
              </div>
              <Field label="Platform">
                <select style={inp} value={postForm.platform} onChange={e => pf('platform', e.target.value)}>
                  <option value="">Select…</option>
                  {PLATFORM_OPTIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Content Type">
                <select style={inp} value={postForm.contentType} onChange={e => pf('contentType', e.target.value)}>
                  <option value="">Select…</option>
                  {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Category">
                <select style={inp} value={postForm.category} onChange={e => pf('category', e.target.value)}>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Views">
                <input style={inp} type="number" value={postForm.views} onChange={e => pf('views', e.target.value)} placeholder="0" min="0" />
              </Field>
              <Field label="Likes">
                <input style={inp} type="number" value={postForm.likes} onChange={e => pf('likes', e.target.value)} placeholder="0" min="0" />
              </Field>
              <Field label="Comments">
                <input style={inp} type="number" value={postForm.comments} onChange={e => pf('comments', e.target.value)} placeholder="0" min="0" />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Notes" helper="What worked or didn't about this post?">
                  <textarea style={{ ...ta, minHeight: 60 }} value={postForm.notes} onChange={e => pf('notes', e.target.value)} placeholder="e.g. Hook was strong but CTA was vague. High saves, low comments." />
                </Field>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setAddingPost(false); setPostForm(emptyPost) }} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
              <button onClick={savePost} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save Post</button>
            </div>
          </div>
        )}

        {contentAudit.length === 0 && !addingPost && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No posts added yet. Add at least 5 for meaningful AI analysis.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contentAudit.map((post, i) => (
            <div key={post.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '11px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>Post {i + 1}</span>
                    {post.platform && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(74,140,140,0.12)', color: '#4A8C8C', fontFamily: "'Outfit', sans-serif" }}>{post.platform}</span>}
                    {post.contentType && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(196,135,74,0.1)', color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" }}>{post.contentType}</span>}
                    {post.category && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{post.category}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>{post.url}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                    {[['Views', post.views], ['Likes', post.likes], ['Comments', post.comments]].filter(([, v]) => v > 0).map(([l, v]) => (
                      <span key={l} style={{ fontSize: 11, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{l}: <strong style={{ color: 'var(--dark)' }}>{Number(v).toLocaleString()}</strong></span>
                    ))}
                  </div>
                </div>
                <button onClick={() => onAuditChange(contentAudit.filter(p => p.id !== post.id))} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#C4503A', fontSize: 11, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Stage 3 ───────────────────────────────────────────────────────────────────

function Stage3({ competitors, onChange }) {
  const [addingComp, setAddingComp] = useState(false)
  const emptyComp = { handle: '', platform: '', niche: '', topPosts: [{ type: '', views: '', hookStyle: '', notes: '' }] }
  const [compForm, setCompForm] = useState(emptyComp)
  const cf = (k, v) => setCompForm(prev => ({ ...prev, [k]: v }))
  const [showCustomHook, setShowCustomHook] = useState([false, false, false])

  const saveComp = () => {
    if (!compForm.handle.trim()) return
    onChange([...competitors, { ...compForm, id: `comp-${Date.now()}` }])
    setCompForm(emptyComp)
    setShowCustomHook([false, false, false])
    setAddingComp(false)
  }

  const updatePost = (i, k, v) => {
    const posts = [...compForm.topPosts]
    posts[i] = { ...posts[i], [k]: v }
    cf('topPosts', posts)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Add similar accounts that are doing well.</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Add 3–5 competitors. Focus on accounts your client's audience already follows.</p>

      {competitors.length < 5 && !addingComp && (
        <button onClick={() => setAddingComp(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>+ Add Competitor</button>
      )}

      {addingComp && (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
            <Field label="Handle / Username">
              <input style={inp} value={compForm.handle} onChange={e => cf('handle', e.target.value)} placeholder="@handle" />
            </Field>
            <Field label="Platform">
              <select style={inp} value={compForm.platform} onChange={e => cf('platform', e.target.value)}>
                <option value="">Select…</option>
                {PLATFORM_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Niche">
              <input style={inp} value={compForm.niche} onChange={e => cf('niche', e.target.value)} placeholder="e.g. Spiritual wellness" />
            </Field>
          </div>

          <div style={{ marginBottom: 4 }}>
            <Label helper="Add up to 3 top-performing posts from this account">Top Posts</Label>
            {compForm.topPosts.map((post, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid-grey)', display: 'block', marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>POST {i + 1}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
                  <Field label="Content Type">
                    <select style={inp} value={post.type} onChange={e => updatePost(i, 'type', e.target.value)}>
                      <option value="">Select…</option>
                      {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Views">
                    <input style={inp} type="number" value={post.views} onChange={e => updatePost(i, 'views', e.target.value)} placeholder="0" min="0" />
                  </Field>
                  <Field label="Hook Style">
                    <select style={inp} value={HOOK_STYLES.includes(post.hookStyle) ? post.hookStyle : post.hookStyle ? '__custom' : ''}
                      onChange={e => {
                        if (e.target.value === '__custom') { const h = [...showCustomHook]; h[i] = true; setShowCustomHook(h) }
                        else { updatePost(i, 'hookStyle', e.target.value) }
                      }}>
                      <option value="">Select…</option>
                      {HOOK_STYLES.map(h => <option key={h}>{h}</option>)}
                      <option value="__custom">Custom…</option>
                    </select>
                    {(showCustomHook[i] || (post.hookStyle && !HOOK_STYLES.includes(post.hookStyle))) && (
                      <input style={{ ...inp, marginTop: 5 }} value={post.hookStyle} onChange={e => updatePost(i, 'hookStyle', e.target.value)} placeholder="Custom hook style…" />
                    )}
                  </Field>
                </div>
                <Field label="Notes">
                  <input style={inp} value={post.notes} onChange={e => updatePost(i, 'notes', e.target.value)} placeholder="What made this post work?" />
                </Field>
              </div>
            ))}
            {compForm.topPosts.length < 3 && (
              <button onClick={() => cf('topPosts', [...compForm.topPosts, { type: '', views: '', hookStyle: '', notes: '' }])} style={{ fontSize: 12, color: 'var(--mid-grey)', background: 'none', border: '1px dashed var(--border)', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>+ Add another post</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => { setAddingComp(false); setCompForm(emptyComp) }} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)' }}>Cancel</button>
            <button onClick={saveComp} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Save Competitor</button>
          </div>
        </div>
      )}

      {competitors.length === 0 && !addingComp && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mid-grey)', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>No competitors added yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {competitors.map(comp => (
          <div key={comp.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>{comp.handle}</span>
                {comp.platform && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(74,140,140,0.12)', color: '#4A8C8C', fontFamily: "'Outfit', sans-serif" }}>{comp.platform}</span>}
                {comp.niche && <span style={{ fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>{comp.niche}</span>}
              </div>
              <button onClick={() => onChange(competitors.filter(c => c.id !== comp.id))} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#C4503A', fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>Remove</button>
            </div>
            {comp.topPosts?.some(p => p.type || p.hookStyle) && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {comp.topPosts.filter(p => p.type || p.hookStyle).map((p, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 5, background: 'rgba(196,135,74,0.08)', color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>
                    {[p.type, p.hookStyle, p.views && `${Number(p.views).toLocaleString()} views`].filter(Boolean).join(' · ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stage 4 ───────────────────────────────────────────────────────────────────

function Stage4({ data, onSaveOutput }) {
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  const run = async (stepType, payload) => {
    setLoading(l => ({ ...l, [stepType]: true }))
    setErrors(e => ({ ...e, [stepType]: null }))
    try {
      const result = await runAIAnalysis(stepType, payload)
      onSaveOutput(stepType, result)
    } catch (err) {
      setErrors(e => ({ ...e, [stepType]: err.message === 'NO_KEY' ? 'NO_KEY' : err.message }))
    } finally {
      setLoading(l => ({ ...l, [stepType]: false }))
    }
  }

  const { clientProfile, brand, contentAudit, competitors, weeklyObjective, aiOutputs } = data

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Run the analysis.</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Each button analyses the data you provided. Run them in order for best results.</p>

      <AnalysisBlock
        title="Analyze Content Patterns"
        description="What patterns exist across your content audit. What's working and what isn't — based strictly on your posts."
        onRun={() => run('patterns', { clientProfile, brand, contentAudit })}
        loading={loading.patterns} error={errors.patterns} output={aiOutputs.patterns}
      />

      <AnalysisBlock
        title="Analyze Competitors"
        description="Common high-performing formats, hook patterns, video structure trends, and engagement triggers from your competitor data."
        onRun={() => run('competitors', { competitors })}
        loading={loading.competitors} error={errors.competitors} output={aiOutputs.competitorInsights}
      />

      <AnalysisBlock
        title="Merge Insights"
        description="What to do, what to avoid, and a recommended content direction based on your content + competitor analysis."
        onRun={() => run('strategy', { patterns: aiOutputs.patterns, competitorInsights: aiOutputs.competitorInsights, clientProfile, brand })}
        loading={loading.strategy} error={errors.strategy} output={aiOutputs.strategy}
      />

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>What should we focus on this week?</h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>This shapes your format and execution rules below.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
          {WEEKLY_OBJ_OPTIONS.map(opt => (
            <button key={opt} onClick={() => onSaveOutput('weeklyObjective', weeklyObjective === opt ? '' : opt)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", border: '1.5px solid',
              background: weeklyObjective === opt ? 'rgba(196,135,74,0.15)' : 'transparent',
              borderColor: weeklyObjective === opt ? 'var(--accent)' : 'var(--border)',
              color: weeklyObjective === opt ? 'var(--accent)' : 'var(--mid-grey)',
            }}>{opt}</button>
          ))}
        </div>
        <input style={{ ...inp, width: 280 }} value={!WEEKLY_OBJ_OPTIONS.includes(weeklyObjective) ? weeklyObjective : ''} onChange={e => onSaveOutput('weeklyObjective', e.target.value)} placeholder="Or type a custom objective…" />
      </div>

      <AnalysisBlock
        title="Generate Format Rules"
        description="Best format type, hook type, ideal length, and visual style for this client based on their brand and strategy."
        onRun={() => run('formatRules', { clientProfile, brand, strategy: aiOutputs.strategy, weeklyObjective })}
        loading={loading.formatRules} error={errors.formatRules} output={aiOutputs.formatRules}
      />

      <AnalysisBlock
        title="Generate Execution Rules"
        description="Posting frequency, content mix, tone guidance, and CTA style — derived from this client's data."
        onRun={() => run('executionRules', { clientProfile, brand, contentAudit, strategy: aiOutputs.strategy, formatRules: aiOutputs.formatRules })}
        loading={loading.executionRules} error={errors.executionRules} output={aiOutputs.executionRules}
      />
    </div>
  )
}

// ─── Stage 5 ───────────────────────────────────────────────────────────────────

function Stage5({ data, onSaveOutput }) {
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  const run = async (stepType, payload) => {
    setLoading(l => ({ ...l, [stepType]: true }))
    setErrors(e => ({ ...e, [stepType]: null }))
    try {
      const result = await runAIAnalysis(stepType, payload)
      onSaveOutput(stepType, result)
    } catch (err) {
      setErrors(e => ({ ...e, [stepType]: err.message === 'NO_KEY' ? 'NO_KEY' : err.message }))
    } finally {
      setLoading(l => ({ ...l, [stepType]: false }))
    }
  }

  const { clientProfile, brand, contentAudit, competitors, weeklyObjective, aiOutputs } = data
  const ctx = { clientProfile, brand, contentAudit, competitors, weeklyObjective, ...aiOutputs }

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, fontFamily: "'Libre Baskerville', serif", color: 'var(--dark)' }}>Build the strategy.</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--mid-grey)', fontFamily: "'Outfit', sans-serif" }}>Turn your analysis into a clear, actionable content plan.</p>

      <AnalysisBlock
        title="Generate Content Pillars"
        description="4–6 content pillars with names, descriptions, why each works for this client, and example content types."
        onRun={() => run('pillars', ctx)}
        loading={loading.pillars} error={errors.pillars}
        output={aiOutputs.pillars?.length ? aiOutputs.pillars : null}
      />

      <AnalysisBlock
        title="Generate Ideas"
        description="10–20 short, actionable content ideas mapped to your pillars."
        onRun={() => run('ideas', { ...ctx, pillars: aiOutputs.pillars })}
        loading={loading.ideas} error={errors.ideas}
        output={aiOutputs.ideas?.length ? aiOutputs.ideas : null}
      />

      <AnalysisBlock
        title="Generate Weekly Plan"
        description="A 7-day action plan — each day has a content type, hook idea, and short description of what to create."
        onRun={() => run('weeklyPlan', { ...ctx, pillars: aiOutputs.pillars, ideas: aiOutputs.ideas })}
        loading={loading.weeklyPlan} error={errors.weeklyPlan}
        output={aiOutputs.weeklyPlan?.length ? aiOutputs.weeklyPlan : null}
      />
    </div>
  )
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function ClientIntelligence({ clientId }) {
  const [stage, setStage] = useState(0)
  const [data, setData] = useState(() => loadData(clientId))

  const update = useCallback((section, value) => {
    setData(prev => {
      const next = { ...prev, [section]: value }
      saveData(clientId, next)
      return next
    })
  }, [clientId])

  const saveAIOutput = useCallback((key, value) => {
    setData(prev => {
      const next = key === 'weeklyObjective'
        ? { ...prev, weeklyObjective: value }
        : { ...prev, aiOutputs: { ...prev.aiOutputs, [key]: value } }
      saveData(clientId, next)
      return next
    })
  }, [clientId])

  return (
    <div>
      <Stepper stage={stage} onGoTo={setStage} />

      {stage === 0 && <Stage1 profile={data.clientProfile} onChange={v => update('clientProfile', v)} />}
      {stage === 1 && <Stage2 brand={data.brand} contentAudit={data.contentAudit} onBrandChange={v => update('brand', v)} onAuditChange={v => update('contentAudit', v)} />}
      {stage === 2 && <Stage3 competitors={data.competitors} onChange={v => update('competitors', v)} />}
      {stage === 3 && <Stage4 data={data} onSaveOutput={saveAIOutput} />}
      {stage === 4 && <Stage5 data={data} onSaveOutput={saveAIOutput} />}

      <NavButtons stage={stage} onBack={() => setStage(s => s - 1)} onNext={() => setStage(s => s + 1)} />
    </div>
  )
}
