import React, { useState, useEffect } from 'react'
import { callClaude } from './socialUtils.jsx'

const BG   = '#F7F5FF'
const CARD = '#FFFFFF'
const OR   = '#F97316'
const PU   = '#7C3AED'
const TX   = '#1A1A1A'
const MI   = '#6B7280'
const BD   = '#E5E7EB'
const FF   = "'Outfit', sans-serif"

function loadAnalysis(clientId) {
  try { return JSON.parse(localStorage.getItem(`pulse_analysis_${clientId}`) || 'null') } catch { return null }
}
function loadStrategy(clientId) {
  try { return JSON.parse(localStorage.getItem(`pulse_strategy_${clientId}`) || 'null') } catch { return null }
}

function ListCard({ title, items, accent }) {
  if (!items?.length) return null
  return (
    <div style={{ background: CARD, borderRadius: 14, padding: '18px 20px', border: `1px solid ${BD}`, borderLeft: `4px solid ${accent || OR}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: FF }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item, i) => <li key={i} style={{ fontSize: 14, color: TX, fontFamily: FF, marginBottom: 6, lineHeight: 1.5 }}>{item}</li>)}
      </ul>
    </div>
  )
}

export default function StrategyTab({ clientId, pushToast, onGoToCreate, onGoToAnalysis }) {
  const [analysis, setAnalysis] = useState(null)
  const [strategy, setStrategy] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [hasKey,   setHasKey]   = useState(() => !!localStorage.getItem('pulse_anthropic_key'))

  useEffect(() => {
    setAnalysis(loadAnalysis(clientId))
    setStrategy(loadStrategy(clientId))
  }, [clientId])

  const runStrategy = async () => {
    setLoading(true)
    try {
      const prompt = `Based on this analysis generate a content strategy. Be specific and actionable.

Return ONLY JSON:
{
  "pillars": [{ "name": "string", "description": "string" }],
  "hooks": ["string"],
  "postingPlan": { "reels": number, "posts": number, "stories": number },
  "contentDirection": ["string"],
  "ctaStyle": ["string"],
  "weeklyFocus": "string"
}

Analysis Data: ${JSON.stringify(analysis)}`

      const res = await callClaude([{ role: 'user', content: prompt }], 1200)
      localStorage.setItem(`pulse_strategy_${clientId}`, JSON.stringify(res))
      setStrategy(res)
      pushToast?.('Strategy generated!')
    } catch (e) {
      if (e.message === 'NO_KEY') setHasKey(false)
      else pushToast?.(e.message.slice(0, 80), 'error')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: FF }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: TX }}>Strategy</h2>
        <p style={{ margin: 0, fontSize: 14, color: MI }}>Generate a content strategy from your analysis.</p>
      </div>

      {!hasKey && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: `${PU}12`, border: `1px solid ${PU}30`, color: PU, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          Add your Anthropic API key in Settings to generate strategy.
        </div>
      )}

      {/* No analysis warning */}
      {!analysis && (
        <div style={{ background: CARD, borderRadius: 14, padding: '24px 24px', border: `1px solid ${BD}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TX, marginBottom: 8, fontFamily: FF }}>Run Analysis first</div>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: MI, fontFamily: FF, lineHeight: 1.6 }}>
            Strategy is generated from your Analysis results. Complete the Analysis tab first.
          </p>
          {onGoToAnalysis && (
            <button onClick={onGoToAnalysis} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: OR, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF }}>
              Go to Analysis →
            </button>
          )}
        </div>
      )}

      {/* Generate button */}
      {hasKey && analysis && (
        <button
          onClick={runStrategy}
          disabled={loading}
          style={{ padding: '12px 32px', borderRadius: 11, border: 'none', background: loading ? '#ccc' : OR, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FF, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10, boxShadow: loading ? 'none' : `0 4px 16px ${OR}40` }}
        >
          {loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
          {loading ? 'Generating…' : strategy ? 'Regenerate Strategy' : 'Generate Strategy'}
        </button>
      )}

      {/* Strategy output */}
      {strategy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>

          {/* Content Pillars */}
          {strategy.pillars?.length > 0 && (
            <div style={{ background: CARD, borderRadius: 14, padding: '18px 20px', border: `1px solid ${BD}`, borderLeft: `4px solid ${PU}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14, fontFamily: FF }}>Content Pillars</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {strategy.pillars.map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: BG, border: `1px solid ${BD}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TX, fontFamily: FF, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: MI, fontFamily: FF, lineHeight: 1.5 }}>{p.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ListCard title="Hooks That Work"    items={strategy.hooks}            accent={OR} />

          {/* Posting Plan */}
          {strategy.postingPlan && (
            <div style={{ background: CARD, borderRadius: 14, padding: '18px 20px', border: `1px solid ${BD}`, borderLeft: `4px solid #16A34A`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MI, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14, fontFamily: FF }}>Weekly Posting Plan</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {[
                  { label: 'Reels',   value: strategy.postingPlan.reels },
                  { label: 'Posts',   value: strategy.postingPlan.posts },
                  { label: 'Stories', value: strategy.postingPlan.stories },
                ].map(({ label, value }) => (
                  <div key={label} style={{ flex: '1 1 80px', textAlign: 'center', padding: '14px 10px', borderRadius: 12, background: BG, border: `1px solid ${BD}` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: OR, fontFamily: FF }}>{value ?? '—'}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: MI, fontFamily: FF, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ListCard title="Content Direction" items={strategy.contentDirection} accent={OR} />
          <ListCard title="CTA Style"          items={strategy.ctaStyle}         accent={PU} />

          {strategy.weeklyFocus && (
            <div style={{ background: OR, borderRadius: 14, padding: '18px 20px', boxShadow: `0 4px 16px ${OR}40` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: FF }}>Weekly Focus</div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: FF, lineHeight: 1.5 }}>{strategy.weeklyFocus}</p>
            </div>
          )}

          {onGoToCreate && (
            <button
              onClick={onGoToCreate}
              style={{ alignSelf: 'flex-start', marginTop: 8, padding: '12px 28px', borderRadius: 11, border: 'none', background: OR, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FF, boxShadow: `0 4px 16px ${OR}40` }}
            >
              Go to Create →
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
